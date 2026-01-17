const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "ap-south-1", 
});

const BUCKET_NAME = "medilens-uploads-563591101214";

module.exports = {
  s3,
  BUCKET_NAME,
};
