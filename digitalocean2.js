const AWS = require("aws-sdk");
const fs = require("fs");

const spacesEndpoint = new AWS.Endpoint('https://dreamscriptstorage.sfo2.digitaloceanspaces.com');
const s3 = new AWS.S3({
    endpoint: spacesEndpoint,
	region: 'us-east-1',
    accessKeyId: 'DO00VPAJBFQDCKBDGE9V',
    secretAccessKey: 'zRfxCADbZB7ktcGKjVqjCAeAMZSoB2J7U+Zfrf3iOuM'
});

const file = fs.readFileSync('/Users/mustafah/Projects/Caravan.zip');

s3.putObject({
    Bucket: 'default',
    Key: "Caravan.zip",
    Body: file,
    ACL: "public-read" // Corrected ACL option
}, (err, data) => {
    if (err) return console.log(err);
    console.log("Your file has been uploaded successfully!", data);
});
