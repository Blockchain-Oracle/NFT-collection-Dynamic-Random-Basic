const { network } = require("hardhat");
const { networkConfig } = require("./../helper-hardhat-config");
const chainId = network.config.chainId;

module.exports = async function ({ deployments, getNamedAccounts }) {
  if (chainId == 31337) {
    const { deploy, log } = deployments;

    log("local network detected deploying mocks vrf");
    // console.log(deployments);
    const { deployer } = await getNamedAccounts();
    const baseFee = networkConfig[chainId]["_BASEFEE"];
    const gasLink = networkConfig[chainId]["_GASPRICELINK"];

    const arg = [baseFee, gasLink];

    networkConfig.arg = MockV3 = await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: arg,
      log: true,
    });
    log("....................................................................");
  }
};
module.exports.tags = ["all", "mocks", "randomNum"];
