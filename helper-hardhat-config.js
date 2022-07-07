const { ethers } = require("hardhat");

const networkConfig = {
  4: {
    name: "rinkeby",
    vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    subscriptionId: 6490,
    callbackGasLimit: 500_000,
    interval: "30",
    mintFee: ethers.utils.parseEther("0.005"),
    ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
  },
  31337: {
    name: "hardhat",
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    callbackGasLimit: 500_000,
    interval: "30",
    mintFee: ethers.utils.parseEther("0.005"),
  },
};

const developmentChains = ["hardhat", "localhost"];
// const developmentChains = [31337];

const DECIMALS = 8;
const INITIAL_PRICE = "200000000000000000000";

module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_PRICE };