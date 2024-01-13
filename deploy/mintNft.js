const { network, ethers, deployments } = require("hardhat");
const { resolve } = require("path");

module.exports = async ({ getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  // Basic NFT
  //dynamic nft

  // basic nft
  const BasicNft = await ethers.getContract("BasicNFT", deployer);
  const tx = await BasicNft.mintNft();
  await tx.wait();
  console.log(`basicnft of index 0 token uri: ${await BasicNft.tokenURI(0)}`);
  //
  // dynamic nft
  const dynamicNft = await ethers.getContract("DynamicNft", deployer);
  const highValue = await dynamicNft.getPriceFeed();
  const txDynamic = await dynamicNft.mintNft(highValue);
  await txDynamic.wait(1);
  console.log(
    `dynamic nft of index 0 with token uri ${await dynamicNft.tokenURI(1)}`
  );

  //random Nft

  const randomNft = await ethers.getContract("RandomIPFSNFT", deployer);
  return new Promise(async (resolve, reject) => {
    randomNft.once("NftMinted", async () => {
      console.log("event found");
      try {
        console.log(`random nft of index0 ${await randomNft.tokenURI(0)}`);
      } catch (error) {
        reject(error);
      }
      resolve();
    });
    if (chainId == 31337) {
      mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer);
      await mock.addConsumer(1, randomNft.target);
    }
    const value = await randomNft.getMintFee();
    await randomNft.requestNft({ value: value });
    if (chainId == 31337) {
      await mock.fulfillRandomWords(1, randomNft.target);
    }
  });
};

module.exports.tags = ["mint"];
