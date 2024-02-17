import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import * as FormData from 'form-data';

export async function exportCommand() {
    const workspaceFolder = vscode.workspace.workspaceFolders[0];
    if (!workspaceFolder) {
        vscode.window.showErrorMessage("No workspace folder open");
        return;
    }

    // Create .vscode/extensions.json with recommended extension
    const vscodeDir = path.join(workspaceFolder.uri.fsPath, '.vscode');
    const extensionsFile = path.join(vscodeDir, 'extensions.json');
    if (!fs.existsSync(vscodeDir)) {
        fs.mkdirSync(vscodeDir);
    }
    fs.writeFileSync(extensionsFile, JSON.stringify({
        "recommendations": ["mustafah.dreamscript"]
    }, null, 2));

    // Setting up the zip file
    const zip = archiver('zip', { zlib: { level: 9 } });
    const formattedDate = new Date().toLocaleString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: true }).replace(/ /g, '').replace(/:/g, '_').replace(/,/g, '__');
    const zipFileName = `${workspaceFolder.name}_${formattedDate}.dreams.zip`;
    const zipFilePath = path.join(workspaceFolder.uri.fsPath, '..', zipFileName);
    const output = fs.createWriteStream(zipFilePath);

    output.on('close', async function () {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Uploading file...",
            cancellable: false
        }, async (progress) => {
            try {
                const formData = new FormData();
                formData.append('reqtype', 'fileupload');
                formData.append('time', '72h'); // Adjust as needed
                formData.append('fileToUpload', fs.createReadStream(zipFilePath));

                const response = await axios.post('https://litterbox.catbox.moe/resources/internals/api.php', formData, {
                    headers: {
                      ...formData.getHeaders(),
                    },
                });

                vscode.window.showInformationMessage(`Workspace exported and uploaded. URL: ${response.data}`);
            } catch (err) {
                vscode.window.showErrorMessage(`Error uploading file: ${err}`);
            }
        });
    });


    zip.on('error', function(err) {
        throw err;
    });

    zip.pipe(output);
    zip.directory(workspaceFolder.uri.fsPath, false);
    zip.finalize();

}
