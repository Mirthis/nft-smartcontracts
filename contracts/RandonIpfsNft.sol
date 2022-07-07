// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NotEnoughFundsToMint();
error RandomIpfsNft__WithdrawFail();

contract RandomIpfsNft is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
  // type declaration
  enum Breed {
    PUG,
    SHIBA_INU,
    ST_BERNARD
  }

  // Chainlink VRF variables
  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
  uint64 private immutable i_subscriptionId;
  bytes32 private immutable i_gasLane;
  uint32 private immutable i_callbackGasLimit;
  uint16 private constant REQUEST_CONFIRMATIONS = 3;
  uint16 private constant NUM_WORDS = 1;

  // Chainlink VRF helpers
  mapping(uint256 => address) public s_requestIdToSender;

  // Nft variables
  uint256 private s_tokenCounter;
  uint256 internal constant MAX_CHANCE_VALUE = 100;
  string[] internal s_dogTokenUris;
  uint256 internal immutable i_mintFee;

  // Event
  event NftRequested(uint256 indexed requestId, address requester);
  event NftMinted(Breed dogBreed, address minter);

  constructor(
    address vrfCoordinatorV2,
    uint64 subscriptionId,
    bytes32 gasLane,
    uint32 callbackGasLimit,
    string[3] memory dogTokenUris,
    uint256 mintFee
  ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS NFT", "RIN") {
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
    i_subscriptionId = subscriptionId;
    i_gasLane = gasLane;
    i_callbackGasLimit = callbackGasLimit;
    s_dogTokenUris = dogTokenUris;
    i_mintFee = mintFee;
    s_tokenCounter = 0;
  }

  // kick off request to ChainLink VREF
  function requestNft() public payable returns (uint256 requestId) {
    if (msg.value < i_mintFee) revert RandomIpfsNft__NotEnoughFundsToMint();
    requestId = i_vrfCoordinator.requestRandomWords(
      i_gasLane,
      i_subscriptionId,
      REQUEST_CONFIRMATIONS,
      i_callbackGasLimit,
      NUM_WORDS
    );
    s_requestIdToSender[requestId] = msg.sender;
    emit NftRequested(requestId, msg.sender);
  }

  // callback invoked by ChainLink VREF
  function fulfillRandomWords(uint256 requestId, uint256[] memory randonWords)
    internal
    override
  {
    // this is needed cause msg.sender is chainlinkg and we don't eant the nft to go there
    address nftOwner = s_requestIdToSender[requestId];
    uint256 newTokenId = s_tokenCounter;
    // convert random value to value between 0 and 99
    uint256 moddedRng = randonWords[0] % MAX_CHANCE_VALUE;
    Breed dogBreed = getBreedFromModdedRng(moddedRng);
    _safeMint(nftOwner, newTokenId);
    _setTokenURI(newTokenId, s_dogTokenUris[uint256(dogBreed)]);
    s_tokenCounter += 1;
    emit NftMinted(dogBreed, nftOwner);
  }

  function getBreedFromModdedRng(uint256 moddedRng)
    public
    pure
    returns (Breed)
  {
    uint256 cumulativeSum = 0;
    uint256[3] memory chanceArray = getChanceArray();
    for (uint256 i = 0; i < chanceArray.length; i++) {
      if (
        moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[1]
      ) {
        return Breed(i);
      }
      cumulativeSum += chanceArray[i];
    }
    revert RandomIpfsNft__RangeOutOfBounds();
  }

  function getChanceArray() public pure returns (uint256[3] memory) {
    return [10, 30, MAX_CHANCE_VALUE];
  }

  function withdraw() public onlyOwner {
    uint256 amount = address(this).balance;
    (bool success, ) = payable(msg.sender).call{value: amount}("");
    if (!success) revert RandomIpfsNft__WithdrawFail();
  }

  function getMintFee() public view returns (uint256) {
    return i_mintFee;
  }

  function getDogToekenUri(uint256 index) public view returns (string memory) {
    return s_dogTokenUris[index];
  }

  function getTokenCounter() public view returns (uint256) {
    return s_tokenCounter;
  }
}
