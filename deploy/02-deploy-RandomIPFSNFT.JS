const { network, ethers } = require("hardhat");
require("dotenv").config();
const { storeImages, storeTokenUriMeta } = require("../utils/uploadToPinata");
const imageLocation = "./images/randomNft";
const { networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

const metaDataTemplete = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "cuteness",
      value: 100,
    },
  ],
};

module.exports = async function ({ deployments, getNamedAccounts }) {
  const chainId = network.config.chainId;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  //Chainlink vrf mocks
  //helper hardhat config
  //get vrfcoordinator address for network
  //upload image to ipfs

  let vrfCoordinator,
    subscriptionId,
    keyHash,
    CALLBACK_GAS_LIMIT,
    fundAmount,
    tokenuri,
    mocks;

  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenuri = await handleTokenUris();
  }

  //   address _vrfCoordinator,
  //   uint64 _subscriptionId,
  //   bytes32 _keyHash,
  //   uint32 _callbackGasLimit,
  //   uint256 _amount,
  //   string[3] memory _tokenuri

  keyHash = gasLink = networkConfig[chainId]["keyHash"];
  CALLBACK_GAS_LIMIT = gasLink = networkConfig[chainId]["CALLBACK_GAS_LIMIT"];
  fundAmount = gasLink = networkConfig[chainId]["fundAmount"];
  subscriptionId = networkConfig[chainId]["subscriptionId"];
  vrfCoordinator = networkConfig[chainId]["vrfCoordinator"];

  if (chainId == 31337) {
    mocks = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
    vrfCoordinator = mocks.target;
    subscriptionId = "1";
    const tx = await mocks.createSubscription();
    await tx.wait(1);
    await mocks.fundSubscription("1", fundAmount);
  }
  tokenuri = await handleTokenUris();
  //args
  const arg = [
    vrfCoordinator,
    subscriptionId,
    keyHash,
    CALLBACK_GAS_LIMIT,
    fundAmount,
    tokenuri,
  ];

  // console.log(tokenuri);

  const RandomIPFSNFT = await deploy("RandomIPFSNFT", {
    from: deployer,
    args: arg,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  // chainId == 31337
  //   ? await mocks.addConsumer(subscriptionId, RandomIPFSNFT.address)
  //   : "";
  log(
    "...................................................................................."
  );

  if (chainId !== 31337 && process.env.ETHERSCAN_APIKEY) {
    console.log("verifying pls wait");
    await verify(RandomIPFSNFT.address, arg);
  }
};

async function handleTokenUris() {
  const tokenuriArray = [];
  const { responses, files } = await storeImages(imageLocation);
  for (responsesIndex in responses) {
    let tokenUriMetaData = { ...metaDataTemplete };
    tokenUriMetaData.name = files[responsesIndex].replace(".png", "");
    tokenUriMetaData.description = `an adorable ${tokenUriMetaData.name} pup`;
    tokenUriMetaData.image = `ipfs://${responses[responsesIndex].IpfsHash}`;
    console.log(`uploading token url meta data. ${tokenUriMetaData.name}..`);

    const metadatauploadResponse = await storeTokenUriMeta(
      tokenUriMetaData,
      tokenUriMetaData.name
    );
    tokenuriArray.push(`ipfs://${metadatauploadResponse}`);
  }
  //store the image in ipfs
  //store thr metadata
  return tokenuriArray;
}

module.exports.tags = ["all", "RandomIPFSNFT", "main"];
