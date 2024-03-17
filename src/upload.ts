import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fetch from "node-fetch";
import * as fs from 'fs';

import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import * as path from 'path';

async function listObjects(bucketName: string, prefix: string) {
	try {
    const s3Client = await getS3Client();
    const params = {
      Bucket: bucketName,
      Prefix: prefix, // Filter objects that have this prefix
    };
    const command = new ListObjectsV2Command(params);
    const response = await s3Client.send(command);
	// console.log(response);
    const objectKeys = response.Contents ? response.Contents
      .sort((a, b) => new Date(b.LastModified).getTime() - new Date(a.LastModified).getTime())
      .map((obj) => obj.Key) : [];
    return objectKeys;
  } catch (err) {
    console.log("Error:", err);
  }
}


async function uploadFile(filePath: string, bucketName: string) {
  try {
    const s3Client = await getS3Client();


    const fileName = getFileName(filePath);
    // const fileContent = ""; // Include your file content here
    // const fileContent = await fs.readFile(filePath, {encoding: 'utf-8'} as any);
	const fileContent = await fs.promises.readFile(filePath);

	
    const params = {
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ACL: "public",
    };

    const data = await s3Client.send(new PutObjectCommand(params as any));
    console.log("Successfully uploaded object:", bucketName + "/" + fileName);
  } catch (err) { 
    console.log("Error:", err);
  }
}


function getFileName(filePath: string) {
	return path.basename(filePath, '.zip').toLowerCase();
}

let _s3Client = null;
async function getS3Client() {
	if (!_s3Client) {
		const response = await fetch("https://dreamscript.works/credentials");
		const credentials = (await response.json()).credentials;
		_s3Client = new S3Client({
			endpoint: "https://sfo2.digitaloceanspaces.com",
			forcePathStyle: false,
			region: "sfo2",
			credentials,
		});
	}
	return _s3Client;
}

export async function uploadMain() {
	// Usage example
	const bucketName = "dreamscriptstorage";
	const filePath = '/Users/mustafah/Downloads/mydreamproject.zip';
	let fileName = getFileName(filePath);
	const list = await listObjects(bucketName, fileName);
	// console.log(list);
	fileName = list[0].toLowerCase();
	// const filePath2 = "/Users/mustafah/Downloads/mydreamprojectxOIO.zip";
	// uploadFile(filePath2, bucketName);
	const lastXIndex = fileName.lastIndexOf('x');
	let versionNumber: any = 0;
	let binaryString;
	if (lastXIndex !== -1) {
		binaryString = fileName.substring(lastXIndex + 1); // Extract the binary string from the URL
		versionNumber = decodeFromOldLatin(binaryString);
		// versionNumber = binaryString.replace(/i/g, '1').replace(/o/g, '0'); // Convert 'I' to '1' and 'O' to '0'
		// versionNumber = parseInt(versionNumber, 2);
		fileName = fileName.substring(0, lastXIndex);
		if (!versionNumber) return '';
	}
	versionNumber += 1;

	binaryString = encodeToOldLatin(versionNumber);
	return {versionNumber};
}

function encodeToOldLatin(integer, minLength = 3) {
    const base = 2; // Base of the encoding system
    const characters = ['O', 'I']; // Characters used for encoding

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