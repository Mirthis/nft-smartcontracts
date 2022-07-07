const { network, ethers } = require("hardhat");
const {
  developmentChains,
  DECIMALS,
  INITIAL_PRICE,
} = require("../helper-hardhat-config");

const BASE_FEE = ethers.utils.parseEther("0.25"); // 0.25 LINK per request
const GAS_PRICE_LINK = 1e9; // Calculoted value based on gas price at a given moment

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  if (developmentChains.includes(network.name)) {
    console.log("Local network detected, deploying mocks...");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: [BASE_FEE, GAS_PRICE_LINK],
      log: true,
      waitConfirmations: network.config.blockConfirmations || 1,
    });
    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
    console.log("Mock deployed");
    console.log("----------------------------------------------");
  }
};

module.exports.tags = ["all", "mocks"];
