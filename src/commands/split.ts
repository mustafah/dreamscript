import sharp from 'sharp';
import path from 'path';
import * as vscode from 'vscode';

export async function splitImageByWidth(imagePath: string, numSplits: number = null): Promise<string[]> {

  const image = await sharp(imagePath);
  const { width, height } = await image.metadata();

  if (!numSplits) numSplits = Math.round(width / height);

  if (numSplits > 1) {
    numSplits -= 1;
    // if (numSplits > 4) numSplits = 4;
    const answer = await vscode.window.showInputBox({
      value: numSplits.toString(),
      placeHolder: `How many splits?`,
      prompt: `${numSplits} splits would be created. How many do you want?`,
    });
    if (answer) numSplits = parseInt(answer);
  }

  if (numSplits === 1) return [imagePath];


  if (numSplits <= 0) {
    throw new Error('Number of splits must be greater than 0.');
  }
  
  const splitWidth = Math.floor(width / numSplits);
  const outputPaths: string[] = [];

  for (let i = 0; i < numSplits; i++) {
    const left = i * splitWidth;
    const right = Math.min(left + splitWidth, width);


	const fileName = path.basename(imagePath, path.extname(imagePath));
	const outputFilename = path.join(
		path.dirname(imagePath),
		`${fileName}_${i}${path.extname(imagePath)}`
	);

	// const outputFilename = path.join(
	// 	path.dirname(imagePath),
	// 	`split_${i}.jpg`
	// );

    const splitImage = await image.clone()
      .extract({ left, top: 0, width: right - left, height: height });

    await splitImage.toFile(outputFilename);

    outputPaths.push(outputFilename);
  }

  return outputPaths;
}

// // Example usage
// const imagePath = "path/to/your/image.jpg";
// const numSplits = 3;


