import { llm } from "./llm";
import { translateCommandTemplate } from "./translate.template";
import * as vscode from 'vscode';
import * as fs from 'fs';
import { Keys } from "./keys";
import { Configs } from "./configs";
import { emojifyCommandTemplate } from "./emojify.template";
import { promptifyCommandTemplate } from "./promptify.template";
import stringSimilarity from 'string-similarity';
import { diffWords } from 'diff';

export async function merge() {
    const maxLength: number = 160;

    const editor = vscode.window.activeTextEditor;
    if (!editor) return;
    
    await editor.document.save();
    const dreamFilePath = editor.document.uri.fsPath;

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    if (!selectedText) {
        vscode.window.showInformationMessage("No text selected. Please select text to merge.");
        return;
    }

    const splittedText = selectedText
        .split(/~\s*\+/)
        .filter(part => part.trim())
        .map(part => part.trim());
    
    if (splittedText.length !== 2) {
        vscode.window.showErrorMessage("There should be two parts of text separated by ~ +. Please fix the text before merging.");
        return;
    }
    
    const [A, B] = splittedText;

    const result = doMerge(A, B);

    await editor.edit((editBuilder) => {
        const endPosition = selection.end;
        editBuilder.insert(endPosition, `\n${result}\n`);
    }).then(() => {
        // const newEndPosition = selection.end.translate(0, response.length + 1); // +1 for the newline character
        // const newSelection = new vscode.Selection(endPosition, newEndPosition);
        // editor.selection = newSelection;
    });

    // if (splittedText.length > 1) {
    //     selectedText = splittedText.join('');
    // }

    // const maxLines = await Configs.getConfig('promptifyMaxLines');

	// const question = promptifyCommandTemplate({content: selectedText, maxLines});
    
    // const backendChoice = await Configs.getConfig('llmBackend');
    
    // await vscode.window.withProgress({
    //     location: vscode.ProgressLocation.Notification,
    //     title: `📝 Promptify using ${backendChoice}...`,
    //     cancellable: false
    // }, async (progress) => {
    //     try {
    //         const response = await llm(question);
    //         let endPosition;
    //         await editor.edit((editBuilder) => {
    //             const endPosition = selection.end;
    //             editBuilder.insert(endPosition, `\n💡 ${response}\n`);
    //         }).then(() => {
    //             // const newEndPosition = selection.end.translate(0, response.length + 1); // +1 for the newline character
    //             // const newSelection = new vscode.Selection(endPosition, newEndPosition);
    //             // editor.selection = newSelection;
    //         });
    //     } catch (error) {
    //         vscode.window.showErrorMessage(`Error during promptify: ${error}`);
    //     }
    // });
}

function doMerge(A, B) {
    // // Sample arrays
    // const A = [
    //     'photorealism of A veiled figure stands before a many three vast array of mirrors',
    //     'non-skinny clothes'
    // ];

    // const B = [
    //     'photorealism of A veiled figure stands before a many five vast array of reflective surfaces',
    //     'non-skinny clothes'
    // ];

    // Function to get differences
    function getDifferences(text1, text2) {
        const differences = diffWords(text1, text2, {ignoreCase: true});
        let output = "";
        differences.forEach((part) => {
            // green for additions, red for deletions
            output += part.added ? `+{${part.value}}` :
                       part.removed ? `-{${part.value}}` :
                                      part.value;
          });
        return differences.map((part, index) => ({
            index,
            value: part.value,
            added: part.added,
            removed: part.removed
        })).filter(part => part.added || part.removed);
    }

    // Function to compare arrays semantically
    function compareParagraphs(arrayA, arrayB) {
        const matchedIndices = new Set();
        const mergedParagraphs = arrayA.map(paragraphA => {
            const bestMatch = stringSimilarity.findBestMatch(paragraphA, arrayB).bestMatch;
            if (bestMatch.rating < 0.7) {
                return { merged: paragraphA };
            }
            const differences = getDifferences(paragraphA, bestMatch.target);
            let merged = paragraphA;
            let lastIndex = 0;

            differences.forEach(diff => {
                if (diff.added) {
                    merged += `\n~ +{${diff.value}}`;
                } else if (diff.removed) {
                    merged += `\n~ -{${diff.value}}`;
                } else {
                    merged += `\n~ ?{${diff.value}}`;
                }
                lastIndex = diff.index + diff.value.length;
            });

            // merged += paragraphA.slice(lastIndex);
            matchedIndices.add(arrayB.indexOf(bestMatch.target));

            return {
                paragraph: paragraphA,
                bestMatch: bestMatch.target,
                similarity: bestMatch.rating,
                differences: differences,
                merged: merged,
            };
        });

        arrayB.forEach((paragraphB, index) => {
            if (!matchedIndices.has(index)) {
                mergedParagraphs.push({ merged: `${paragraphB}` });
            }
        });

        return mergedParagraphs;
    }

    const separators = /[.,;]/;
    A = A.split(separators).map(element => element.trim());
    B = B.split(separators).map(element => element.trim());
    const result = compareParagraphs(A, B);


    const mergedResult = '~=\n' + result.map((element, index) => `// ${index})\n${element.merged}`).join(',\n\n');

    return mergedResult;
}

