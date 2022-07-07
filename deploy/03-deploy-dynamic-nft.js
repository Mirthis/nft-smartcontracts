const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const fs = require("fs");
require("dotenv").config();
const {
  storeImages,
  storeTokenUrisMetadata,
} = require("../utils/uploadToPinata");

module.exports = async ({ getNamedAccounts, deployments }) => {
  console.log("------ Start DynamicSvgNft deployment script");
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const EthUsdPriceAggregator = await ethers.getContract("MockV3Aggregator");
    ethUsdPriceFeedAddress = EthUsdPriceAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
  }

  const lowSvg = fs.readFileSync("./images/dynamicNft/frown.svg", {
    encoding: "utf-8",
  });
  const hihgSvg = fs.readFileSync("./images/dynamicNft/happy.svg", {
    encoding: "utf-8",
  });

  const args = [ethUsdPriceFeedAddress, lowSvg, hihgSvg];
  // const dynamicSvgNft = await deploy("DynamicSvgNft", {
  //   from: deployer,
  //   args,
  //   log: true,
  //   waitConfirmations: network.config.blockConfirmations || 1,
  // });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    console.log("Verifying...");
    await verify("0xC041471BF27f4677a91176a3a9e1F88D139323Ab", args);
  }
  console.log("------ Completed DynamicSvgNft deployment script");
};

module.exports.tags = ["all", "dynamicSvg", "main"];
