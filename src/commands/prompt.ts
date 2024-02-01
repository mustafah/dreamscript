const vscode = require('vscode');

export function promptForMetadata() {
    vscode.window.showInputBox({
        prompt: 'Enter metadata for the image',
        placeHolder: 'Type metadata here',
        value: '' // You can set a default value here if needed
    }).then(metadata => {
        if (metadata !== undefined) {
            // Handle the entered metadata
            console.log(metadata); // Replace with your metadata handling logic
        }
    });
}
