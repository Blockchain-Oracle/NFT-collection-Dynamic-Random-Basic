const { network } = require("hardhat");
const decimals = 8;
const updateAnswer = 2000;
const chainId = network.config.chainId;
module.exports = async function ({ deployments, getNamedAccounts }) {
  if (chainId == 31337) {
    const { deploy, log } = deployments;

    log("local network detected deploying pricefeed");
    const { deployer } = await getNamedAccounts();

    const args = [decimals, updateAnswer];

    await deploy("MockV3Aggregator", {
      from: deployer,
      args: args,
      log: true,
    });
    log("....................................................");
  }
};
module.exports.tags = ["all", "mocks", "priceFeed"];
