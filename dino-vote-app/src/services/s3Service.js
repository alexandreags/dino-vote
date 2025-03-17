const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const config = dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const { MINIO_BUCKET_LOCATION, S3_BUCKET_NAME, MINIO_HOST, MINIO_PORT, MINIO_ROOT_USER, MINIO_ROOT_PASSWORD } = process.env;

const uploadImage = async (imageUrl, imageName) => {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });

    const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
    const s3 = new S3Client({
      credentials: {
        accessKeyId: process.env.MINIO_ROOT_USER,
        secretAccessKey: process.env.MINIO_ROOT_PASSWORD,
      },
      endpoint: process.env.MINIO_ENDPOINT,
      forcePathStyle: true,
      region: process.env.S3_BUCKET_LOCATION,
    });

    const bucketName = process.env.S3_BUCKET_NAME;
    console.log('bucketName:', bucketName);

    // Uploading object with string data on Body
    const objectKey = imageName;
    const s3response = await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: response.data,
      })
    );
    

    console.log(`Successfully uploaded ${bucketName}/${objectKey}`);
    const S3imageUrl = `${process.env.MINIO_ENDPOINT}/${bucketName}/${imageName}`;
    return S3imageUrl;
    //console.log(`Response: ${JSON.stringify(s3response)}`);
    
  } catch (exception) {
    console.log("Error in upload image: \n", exception);
  }

};

module.exports = { uploadImage };