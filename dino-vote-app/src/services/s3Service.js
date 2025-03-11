const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const config = dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const { MINIO_BUCKET_LOCATION,S3_BUCKET_NAME, MINIO_HOST, MINIO_PORT, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD } = process.env;



const uploadImage = async (imageUrl, imageName) => {
  
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  const s3 = new S3Client({
    credentials: {
        accessKeyId: 'miniostorage',
        secretAccessKey: 'minio123'
    },
    endpoint: 'http://localhost:9000',
    forcePathStyle: true,
  });

  const bucketName = "dinobucket";
  (async () => {
      try {
          // uploading object with string data on Body
          const objectKey = imageName;
          s3response = await s3.send(
              new PutObjectCommand({
                  Bucket: bucketName,
                  Key: objectKey,
                  Body: response.data,
              })
          );

          console.log(`Successfully uploaded ${bucketName}/${objectKey}`);
          
      } catch (err) {
          console.log("Error", err);
      }
  })();

};
module.exports = { uploadImage };