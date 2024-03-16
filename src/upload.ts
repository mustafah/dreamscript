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
      ACL: "private",
      Metadata: {
        "x-amz-meta-my-key": "your-value",
      },
    };

    const data = await s3Client.send(new PutObjectCommand(params as any));
    console.log("Successfully uploaded object:", bucketName + "/" + fileName);
  } catch (err) {
    console.log("Error:", err);
  }
}


function getFileName(filePath: string) {
	return path.basename(filePath, '.zip');
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
	const fileName = getFileName(filePath);
	// const list = await listObjects(bucketName, fileName);
	// console.log(list);
	const filePath2 = "/Users/mustafah/Downloads/mydreamprojectxOIO.zip";
	uploadFile(filePath2, bucketName);
}
