const { network, ethers } = require("hardhat");
const fs = require("fs");
const { isUtf8 } = require("buffer");
const { networkConfig } = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const chainId = network.config.chainId;
module.exports = async function ({ deployments, getNamedAccounts }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  log(deployer);

  //   string memory lowSvg,
  //   string memory highSvg,
  //   address priceFeedAddress
  let priceFeedAddress, highSvg, lowSvg;

  lowSvg = fs.readFileSync("./images/dynamicNft/frown.svg", {
    encoding: "utf8",
  });
  highSvg = fs.readFileSync("./images/dynamicNft/smile.svg", {
    encoding: "utf8",
  });

  if (chainId == "31337") {
    const mock = await ethers.getContract("MockV3Aggregator", deployer);
    priceFeedAddress = mock.target;
    // console.log(priceFeedAddress);
  } else {
    priceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
  }
  const args = [lowSvg, highSvg, priceFeedAddress];
  const DynamicNft = await deploy("DynamicNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(
    "........................................................................"
  );

  if (chainId !== 31337) {
    await verify(DynamicNft.address, args);
  }
};
module.exports.tags = ["all", "dynamicNft", "main"];
// module.exports.tags = ["all", "basicnft", "main"];
