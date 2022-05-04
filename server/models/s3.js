const aws = require("aws-sdk");
const crypto = require("crypto");
const { promisify } = require("util");
const randomBytes = promisify(crypto.randomBytes);

const s3 = new aws.S3({
  secretAccessKey: process.env.S3_SECRET,
  accessKeyId: process.env.S3_KEY,
  region: process.env.S3_REGION,
  signatureVersion: "v4",
});

async function generateUploadURL() {
  const rawBytes = await randomBytes(16);
  const imageName = rawBytes.toString("hex");

  const params = {
    Bucket: "verazon.online",
    Key: imageName,
    Expires: 60,
    ACL: 'public-read'
  };

  const uploadURL = await s3.getSignedUrlPromise("putObject", params);
  return uploadURL;
}

module.exports = { s3, generateUploadURL };
