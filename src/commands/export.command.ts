import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';
import { BlobServiceClient } from '@azure/storage-blob';
import { v4 as uuidv4 } from 'uuid';
import { BlobHTTPHeaders } from '@azure/storage-blob';

export async function exportCommand() {

    // for (let i = 0; i <= 20; i++) {
    //     const encodedString = encodeToOldLatin(i);
    //     console.log(`Integer: ${i}, Encoded: ${encodedString}, Decoded: ${decodeFromOldLatin(encodedString)}`);
    // }

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

    const AZURE_STORAGE_CONNECTION_STRING = "DefaultEndpointsProtocol=https;AccountName=dreamscripts;AccountKey=FHTi793Gyo/vq2WQs/bPDicA3yM0ynil3o6ZvNaNjgEv+BoQZHzyuomnm3QzEIXpRtAVT4tM+7Th+AStpmAG7Q==;EndpointSuffix=core.windows.net";

    // const username = await getUsername();
    const baseName = sanitizeWorkspaceName(workspaceFolder.name);
    const namespace = baseName;
    output.on('close', async function () {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Uploading file to Dreamscript repo ...",
            cancellable: false
        }, async (progress) => {
            try {
                const containerClient = await getContainerClientFromUser(AZURE_STORAGE_CONNECTION_STRING, namespace);

                const nextBlobNumber = await getNextBlobNumber(containerClient, baseName);
                const blockBlobClient = containerClient.getBlockBlobClient(`${baseName}x${nextBlobNumber}.zip`);
                
                // Set the Content-Disposition header to suggest a .zip file name
                const contentSettings: BlobHTTPHeaders = {
                    blobContentType: "application/zip",
                    // blobContentDisposition: `attachment; filename=${zipFileName}`
                };
                // await blockBlobClient.uploadFile(zipFilePath);
                await blockBlobClient.uploadFile(zipFilePath, {
                    blobHTTPHeaders: contentSettings
                });
                const blobUrl = blockBlobClient.url;
                    
                // Replace the base URL with your custom domain
                const customDomain = "https://dreamscript.works";
                const customBlobUrl = blobUrl.replace(/https:\/\/[^/]+/, customDomain);
                await vscode.env.clipboard.writeText(customBlobUrl);
                vscode.window.showInformationMessage(`Exported and uploaded to Dreamscript repo. URL copied to clipboard: ${blobUrl}`);
            } catch (err) {
                vscode.window.showErrorMessage(`Error uploading file to Dreamscript repo: ${err}`);
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

async function getNextBlobNumber(containerClient, baseName: string): Promise<number> {
    let maxNumber = -1;
    const regex = new RegExp(`^${baseName}x\\d+)\\.zip$`);

    for await (const blob of containerClient.listBlobsFlat()) {
        const match = blob.name.match(regex);
        if (match) {
            const versionNumber = parseInt(match[1], 10);
            maxNumber = Math.max(maxNumber, versionNumber);
        }
    }

    return maxNumber + 1;
}


async function getContainerClient(connectionString, containerName) {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const createContainerResponse = await containerClient.createIfNotExists({ access: 'container' });
        return containerClient;
    } catch (error) {
        vscode.window.showErrorMessage(`Error creating container: ${error}`);
        return undefined;
    }
}

function sanitizeWorkspaceName(name) {
    let validName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    validName = validName.replace(/--+/g, '-'); // Replace consecutive dashes with a single dash
    return validName.substring(0, 63); // Ensure the name is within Azure's length limit
}

async function getUsername() {
    const username = await vscode.window.showInputBox({
        prompt: "Enter any prefered username for export URL (only letters, numbers, and dashes; 3-63 chars; no consecutive dashes)",
        placeHolder: "Username",
        validateInput: text => {
            if (!text || text.length < 3 || text.length > 63) {
                return "Username must be between 3 and 63 characters long";
            }
            if (!/^[a-z0-9-]+$/.test(text.toLowerCase())) {
                return "Username can only contain letters, numbers, and dashes";
            }
            if (/--/.test(text)) {
                return "Username cannot contain consecutive dashes";
            }
            return null; // Input is valid
        }
    });

    if (!username) {
        vscode.window.showErrorMessage("Username is required");
        return undefined;
    }

    return username;
}
async function getContainerClientFromUser(AZURE_STORAGE_CONNECTION_STRING, username) {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(username);
        
               // Create the container with public access level
               const createContainerResponse = await containerClient.createIfNotExists({
                access: 'container'
            });
    
            if (createContainerResponse.succeeded) {
                // vscode.window.showInformationMessage(`Container '${validContainerName}' created with public access.`);
            }
            return containerClient;
    } catch (error) {
        vscode.window.showErrorMessage(`Error creating container: ${error}`);
        return undefined;
    }
}

function encodeToOldLatin(integer) {
    const base = 2; // Base of the encoding system
    const characters = ['O', 'I']; // Characters used for encoding
    const minLength = 4; // Minimum length of the encoded string

    let result = '';
    do {
        result = characters[integer % base] + result;
        integer = Math.floor(integer / base);
    } while (integer > 0);

    // Pad with leading 'O's if necessary
    while (result.length < minLength) {
        result = 'O' + result;
    }

    return result;
}

function decodeFromOldLatin(str) {
    const base = 2; // Base of the encoding system
    const characters = ['O', 'I']; // Characters used for encoding

    let result = 0;
    for (let i = 0; i < str.length; i++) {
        result = result * base + characters.indexOf(str[i]);
    }

    return result;
}
