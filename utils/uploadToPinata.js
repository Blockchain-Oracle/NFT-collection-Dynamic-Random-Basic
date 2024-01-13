const pinataSDK = require("@pinata/sdk");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const PINATA_SERCRET_KEY = process.env.PINATA_SERCRET_KEY;
const PINATA_API_KEY = process.env.PINATA_API_KEY;

const pinata = new pinataSDK(PINATA_API_KEY, PINATA_SERCRET_KEY);

async function storeImages(imageFilePath) {
  const fullImagesPath = path.resolve(imageFilePath);
  const files = fs.readdirSync(fullImagesPath);
  let responses = [];

  console.log("streaming files pls wait..");

  for (fileIndex in files) {
    const readableStreamFromFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    );
    console.log(`uploading ${files[fileIndex]} to IPFS pls wait`);

    const options = {
      pinataMetadata: {
        name: files[fileIndex],
      },
    };
    try {
      const response = await pinata.pinFileToIPFS(
        readableStreamFromFile,
        options
      );
      responses.push(response);
    } catch (error) {
      console.log(error);
    }
  }
  return { responses, files };
}

async function storeTokenUriMeta(metadata, name) {
  let upLoadrex;
  try {
    const options = {
      pinataMetadata: {
        name: name,
      },
    };
    upLoadrex = await pinata.pinJSONToIPFS(metadata, options);
  } catch (error) {
    console.log(error);
  }
  return upLoadrex.IpfsHash;
}
module.exports = { storeImages, storeTokenUriMeta };
