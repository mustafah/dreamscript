// Step 1: Import the S3Client object and all necessary SDK commands.
import {
  PutObjectCommand,
  S3Client
} from '@aws-sdk/client-s3';

const response = await fetch('https://dreamscript.works/credentials');
const credentials = (await response.json()).credentials;

console.log(credentials);


// Step 2: The s3Client function validates your request and directs it to your Space's specified endpoint using the AWS SDK.
const s3Client = new S3Client({
  endpoint: "https://sfo2.digitaloceanspaces.com", // "https://nyc3.digitaloceanspaces.com", // Find your endpoint in the control panel, under Settings. Prepend "https://".
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  region: "sfo2", // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (for example, nyc3).
  credentials: credentials
});


// Step 3: Define the parameters for the object you want to upload.
const params = {
  Bucket: "dreamscriptstorage", // The path to the directory you want to upload the object to, starting with your Space name.
  Key: "hello-world.txt", // Object key, referenced whenever you want to access this file later.
  Body: "Hello, World 2!", // The object's contents. This variable is an object, not a string.
  ACL: "private", // Defines ACL permissions, such as private or public.
  Metadata: { // Defines metadata tags.
    "x-amz-meta-my-key": "your-value"
  }
};


// Step 4: Define a function that uploads your object using SDK's PutObjectCommand object and catches any errors.
const uploadObject = async () => {
  try {
    const data = await s3Client.send(new PutObjectCommand(params));
    console.log("Successfully uploaded object: " + params.Bucket + "/" + params.Key);
    return data;
  } catch (err) {
    console.log("Error", err);
  }
};


// Step 5: Call the uploadObject function.
uploadObject();