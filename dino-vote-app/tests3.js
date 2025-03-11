const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const s3 = new S3Client({
   credentials: {
       accessKeyId: 'miniostorage',
       secretAccessKey: 'minio123'
   },
   endpoint: 'http://localhost:9000',
   forcePathStyle: true,
});

const bucketName = "dinobucket2";
(async () => {
    try {
        // uploading object with string data on Body
        const objectKey = "first-entry3.txt";
        response = await s3.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: objectKey,
                Body: "Hello there again",
            })
        );
        console.log(response);
        console.log(`Successfully uploaded ${bucketName}/${objectKey}`);
    } catch (err) {
        console.log("Error", err);
    }
})();