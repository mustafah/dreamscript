import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fetch from "node-fetch";
import * as fs from 'fs';

async function uploadFile(filePath: string) {
  try {
    const response = await fetch("https://dreamscript.works/credentials");
    const credentials = (await response.json()).credentials;

    const s3Client = new S3Client({
      endpoint: "https://sfo2.digitaloceanspaces.com",
      forcePathStyle: false,
      region: "sfo2",
      credentials,
    });

    const bucketName = "dreamscriptstorage";
    const fileName = filePath.split("/").slice(-1)[0];
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

// Usage example
const filePath = '/Users/mustafah/Projects/visualize_pandas.zip'; // "/Users/mustafah/Projects/dreamscript/src/install.js";
uploadFile(filePath);