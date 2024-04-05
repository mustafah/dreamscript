import * as fs from 'fs';
import * as vscode from 'vscode';
import * as path from 'path';

export const separators  = /[.,;]+$/;
class DreamScriptCompiler {
    private promptLines: string[] = [];
    private variables: any = {};
    
    constructor(private input: string = null) {}

    compile() {
        const lines = this.input.split('\n');
        for (let line of lines) {
            line = line.trim();
            if (!this.processScriptLine(line)) {
                if (line !== '') {
                    line = line.replace(separators, ',');
                    this.promptLines.push(line);
                }
            }
        }
        this.promptLines[this.promptLines.length - 1] = this.promptLines[this.promptLines.length - 1].replace(separators, '') + '.';
        this.variables.prompt = this.promptLines.join(' \n');
        return this.variables;
    }

    public processScriptLine(line: string): boolean {
        return this.processCommentLine(line) || this.processImportLine(line) || this.processAssignmentLine(line) || this.processTranslationLine(line);
    }

    public isTranslateLine(line: string): boolean {
        return !(this.processImportLine(line) || this.processAssignmentLine(line)) && this.processTranslationLine(line);
    }

    private processImportLine(line: string): boolean {
        const importMatch = line.match(/^\s*~\s*import\s+(.+)$/);
        if (importMatch) {
            const filePath = importMatch[1];
            this.promptLines.push(this.handleImportStatement(filePath));
            return true;
        }
        return false;
    }
    
    private handleImportStatement(filePath: string): string {
            // Resolve the file path relative to the workspace root
            const workspaceFolders = vscode.workspace.workspaceFolders;
            let fullPath = filePath;
        try {
            if (workspaceFolders && !path.isAbsolute(filePath)) {
                fullPath = path.join(workspaceFolders[0].uri.fsPath, filePath);
            }
    
            return fs.readFileSync(fullPath, 'utf8');
        } catch (e) {
            console.error(`Failed to read file: ${fullPath}`);
            return '';
        }
    }

    private processAssignmentLine(line: string): boolean {
        const assignmentMatch = line.match(/^\s*~(.*)=(.+)$/);
        if (assignmentMatch) {
            const variableName = assignmentMatch[1];
            const expression = assignmentMatch[2];
            try {
                this.variables[variableName] = eval(expression);
            } catch (e) {
                this.variables[variableName] = expression;
                // console.error(`Failed to evaluate expression: ${expression}`);
            }
            return true;
        }
        return false;
    }

    private processCommentLine(line: string): boolean {
        if (line.startsWith('//')) {
          return true;
        }
        return false;
      }

    private processTranslationLine(line: string): boolean {
        if (line.startsWith('~')) {
          return true;
        }
        return false;
      }
}

export default DreamScriptCompiler;
