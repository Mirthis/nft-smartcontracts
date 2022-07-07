const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const { PINATA_API_KEY, PINATA_API_SECRET } = process.env;
const pinata = pinataSDK(PINATA_API_KEY, PINATA_API_SECRET);

async function storeImages(imagesFilePath) {
  console.log("Uploading images to Pinata...");
  const fullImagesPath = path.resolve(imagesFilePath);
  const files = fs.readdirSync(fullImagesPath);
  let responses = [];
  for (fileIndex in files) {
    console.log(`Uploading ${files[fileIndex]}`);
    const readableStreamForFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    );
    try {
      const response = await pinata.pinFileToIPFS(readableStreamForFile);
      responses.push(response);
    } catch (error) {
      console.log(error);
    }
  }
  console.log("Image upload to Pinata completed");
  return { responses, files };
}

async function storeTokenUrisMetadata(metadata) {
  console.log("Uploading metadata to Pinata...");
  try {
    const response = await pinata.pinJSONToIPFS(metadata);
    return response;
  } catch (error) {
    console.log(error);
  }
  console.log("Metadata upload to Pinata completed");
}

module.exports = { storeImages, storeTokenUrisMetadata };
