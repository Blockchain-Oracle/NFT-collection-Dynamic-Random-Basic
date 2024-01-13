const { network } = require("hardhat");
const { verify } = require("../utils/verify");
module.exports = async function ({ getNamedAccounts, deployments }) {
  const deployer = (await getNamedAccounts()).deployer;
  const { deploy, log } = await deployments;
  //deploying contracts
  log("deploying pls wait ");
  const arguments = [];
  const BasicNFT = await deploy("BasicNFT", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
    // waitConfirmations: network.config.blockConfirmation || 1,
  });
  log("..........................................................");
  await verify(BasicNFT.address, []);
};
module.exports.tags = ["all", "basicnft", "main"];
