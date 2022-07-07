const { assert, expect } = require("chai");
const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("RandomIpfsNft", () => {
      let randomIpfsNft, vrfCoordinatorV2Mock, mintFee, deployer, interval;
      const chainId = network.config.chainId;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["mocks", "randomIPFS"]);
        randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
        mintFee = await randomIpfsNft.getMintFee();
        interval = 10;
      });

      describe("constructor", () => {
        it("initialize the contract correctly", async () => {
          console.log(networkConfig[chainId]["mintFee"]);
          console.log("mintFee: ", mintFee);
          const tokenCounter = await randomIpfsNft.getTokenCounter();
          assert.equal(tokenCounter.toString(), "0");
          assert.equal(
            mintFee.toString(),
            networkConfig[chainId]["mintFee"].toString()
          );
        });
      });

      describe("requestNft", () => {
        it("revert if not enough ETH is sent", async () => {
          await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
            "RandomIpfsNft__NotEnoughFundsToMint"
          );
        });

        it("emits event on request", async () => {
          expect(randomIpfsNft.requestNft({ value: mintFee })).to.emit(
            randomIpfsNft,
            "NftRequested"
          );
        });
      });

      describe("fulfillRandomWords", () => {
        // beforeEach(async () => {
        //   await randomIpfsNft.requestNft({ value: mintFee });
        //   await network.provider.send("evm_increaseTime", [interval + 1]);
        //   await network.provider.request({ method: "evm_mine", params: [] });
        // });

        it("mint a new nft", async () => {
          const tokenCounterStart = await randomIpfsNft.getTokenCounter();
          const txResponse = await randomIpfsNft.requestNft({ value: mintFee });
          const txReceipt = await txResponse.wait(1);
          await vrfCoordinatorV2Mock.fulfillRandomWords(
            txReceipt.events[1].args.requestId,
            randomIpfsNft.address
          );

          const tokenURI = await randomIpfsNft.tokenURI(0);
          const tokenCounterEnd = await randomIpfsNft.getTokenCounter();
          assert.equal(
            tokenCounterStart.add(1).toString(),
            tokenCounterEnd.toString()
          );
          console.log("Token URI", tokenURI);
          assert.equal(tokenURI, await randomIpfsNft.getDogToekenUri(2));
        });
      });
    });
