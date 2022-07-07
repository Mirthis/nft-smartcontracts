const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("BasicNft", () => {
      let basicNft, deployer;
      const chainId = network.config.chainId;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["basicnft"]);
        basicNft = await ethers.getContract("BasicNft");
      });

      describe("constructor", () => {
        it("initialize the nft correctly", async () => {
          const tokenCounter = await basicNft.getTokenCounter();
          assert.equal(tokenCounter.toString(), "0");
        });
      });

      describe("mint NFT", () => {
        it("update the contracts correctly", async () => {
          const tokenCounterStart = await basicNft.getTokenCounter();
          const tx = await basicNft.mintNft();
          await tx.wait(1);
          const tokenURI = await basicNft.tokenURI(0);
          const tokenCounterEnd = await basicNft.getTokenCounter();
          assert.equal(
            tokenCounterStart.add(1).toString(),
            tokenCounterEnd.toString()
          );
          assert.equal(tokenURI, await basicNft.TOKEN_URI());
        });
      });
    });
