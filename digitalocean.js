const AWS = require('aws-sdk');
const fs = require('fs');

// Set the AWS configuration for DigitalOcean Spaces
const spacesEndpoint = new AWS.Endpoint('https://dreamscriptstorage.sfo2.digitaloceanspaces.com'); // Replace 'your-space-name' with your actual Space name
const s3 = new AWS.S3({
	forcePathStyle: true,
    endpoint: spacesEndpoint,
    accessKeyId: 'DO00VPAJBFQDCKBDGE9V', // Replace 'your-access-key' with your actual access key
    secretAccessKey: 'zRfxCADbZB7ktcGKjVqjCAeAMZSoB2J7U+Zfrf3iOuM', // Replace 'your-secret-key' with your actual secret key
});

// Define the file path and bucket name
const filePath = '/Users/mustafah/Projects/Caravan.zip'; // Replace '/path/to/your/file.txt' with the path to your local file
const bucketName = 'default'; // Replace 'your-bucket-name' with your actual bucket name

// Read the file data
const fileData = fs.readFileSync(filePath);

// Set the parameters for the S3 upload
const uploadParams = {
    Bucket: bucketName,
    Key: 'Caravan.zip', // Replace 'file.txt' with the desired key/name of the file in the bucket
    Body: fileData,
};

// Upload the file to DigitalOcean Spaces
s3.upload(uploadParams, function(err, data) {
    if (err) {
        console.error("Error uploading file:", err);
    } else {
        console.log("File uploaded successfully. File URL:", data.Location);
    }
});
