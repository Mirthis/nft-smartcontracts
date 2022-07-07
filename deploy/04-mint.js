const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");

module.exports = async ({ getNamedAccounts, deployments }) => {
  console.log("------ Start Minting script");
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  console.log("Minting Basic NFT");
  const basicNft = await ethers.getContract("BasicNft", deployer);
  const baiscNftMintTx = await basicNft.mintNft();
  await baiscNftMintTx.wait(1);
  console.log(`Baisc Nft index 0 has token URI ${await basicNft.tokenURI(0)}`);

  console.log("Minting Random IPFS NFT");
  const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
  const mintFee = await randomIpfsNft.getMintFee();

  await new Promise(async (resolve, reject) => {
    setTimeout(resolve, 300000); // 5  minutes
    randomIpfsNft.once("NftMinted", async () => resolve());

    const randomIpfsNftTx = await randomIpfsNft.requestNft({
      value: mintFee.toString(),
    });
    const randomIpfsNtfTxReceipt = await randomIpfsNftTx.wait(1);

    if (developmentChains.includes(network.name)) {
      const requestId =
        randomIpfsNtfTxReceipt.events[1].args.requestId.toString();
      const vrfCoordinatorV2Mock = await ethers.getContract(
        "VRFCoordinatorV2Mock",
        deployer
      );
      await vrfCoordinatorV2Mock.fulfillRandomWords(
        requestId,
        randomIpfsNft.address
      );
    }
  });

  console.log(
    `Random IPFS Nft index 0 has token URI ${await randomIpfsNft.tokenURI(0)}`
  );

  console.log("Minting Dynamic SVG NFT");
  const highValue = ethers.utils.parseEther("4000");
  const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer);
  const dynamicSvgNftTx = await dynamicSvgNft.mintNft(highValue.toString());
  await dynamicSvgNftTx.wait(1);
  console.log(
    `Dynamic SVG NFT index 0 has token URI ${await dynamicSvgNft.tokenURI(0)}`
  );
};

module.exports.tags = ["all", "mint"];
