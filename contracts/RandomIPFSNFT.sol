// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIPFSNFT__RangeOutOfBounds();
error RandomIPFSNFT__NotEnoughEthSent();
error RandomIPFSNFT__WithdrawlFailed();
error RandomIPFSNFT__NotOwner();
error RandomIPFSNFT__NotOpen();

contract RandomIPFSNFT is ERC721URIStorage, VRFConsumerBaseV2 {
    //NFT VARIABLES
    string[] internal S_TOKEN_URI;
    uint256 private s_tokenCounter;
    uint256 private constant MAX_CHANCE_VALUE = 100;
    VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATION = 3;
    uint32 private constant NUMWORDS = 1;
    uint256 private immutable i_mintFee;
    address private immutable i_owner;

    //Rare superRare, common
    //Uers have to mint thier nft
    //owner of the contract can withdraw the Eth

    //EVENTS
    event nftRequest(uint256 indexed requestId, address indexed sender);
    event NftMinted(Breed dogBreed, address minter);

    //mappings
    mapping(uint256 s_requestId => address sender) private s_requestIdToSender;

    //enums
    enum Breed {
        PUG,
        SHIBA_INU,
        ST_BERNARD
    }

    enum State {
        open,
        calculating
    }

    State private s_nftState;

    constructor(
        address _vrfCoordinator,
        uint64 _subscriptionId,
        bytes32 _keyHash,
        uint32 _callbackGasLimit,
        uint256 _amount,
        string[3] memory _tokenuri
    )
        ERC721("Blockchain Oracle NFT", "BON")
        VRFConsumerBaseV2(_vrfCoordinator)
    {
        i_vrfCoordinator = VRFCoordinatorV2Interface(_vrfCoordinator);
        i_subscriptionId = _subscriptionId;
        i_keyHash = _keyHash;
        i_callbackGasLimit = _callbackGasLimit;
        i_mintFee = _amount;
        i_owner = msg.sender;
        S_TOKEN_URI = _tokenuri;
        s_nftState = State.open;
    }

    function requestNft() public payable returns (uint256 requestId) {
        if (s_nftState == State.calculating) {
            revert RandomIPFSNFT__NotOpen();
        }
        if (msg.value < i_mintFee) {
            revert RandomIPFSNFT__NotEnoughEthSent();
        }
        s_nftState = State.calculating;
        requestId = i_vrfCoordinator.requestRandomWords(
            i_keyHash,
            i_subscriptionId,
            REQUEST_CONFIRMATION,
            i_callbackGasLimit,
            NUMWORDS
        );
        s_requestIdToSender[requestId] = msg.sender;

        emit nftRequest(requestId, msg.sender);
    }

    function withdraw() public {
        if (i_owner != msg.sender) {
            revert RandomIPFSNFT__NotOwner();
        }
        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        if (!success) {
            revert RandomIPFSNFT__WithdrawlFailed();
        }
    }

    /**
     * @notice Returns an array representing the chances of minting different NFT rarities.
     * @dev Array values indicate the maximum random number (inclusive) that results in each rarity.
     * @dev Values must be in ascending order and within the range of 0 to MAX_CHANCE_VALUE (100).
     *  chances uint256[3] memory An array of 3 uint256 values, representing chances for rarities:
     *   - chances[0]: Chance for common NFT (random number <= 10) PUG NFT
     *   - chances[1]: Chance for rare NFT (random number <= 30) Shiba Inu
     *   - chances[2]: Chance for super rare NFT (random number <= 100) St. Bernard
     */

    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal virtual override {
        address dogOwner = s_requestIdToSender[requestId];
        uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;
        //we want to get our dog breed first before we mint
        Breed dogBreed = getBreedFromModdedRng(moddedRng);
        uint256 newCounter = s_tokenCounter;
        _safeMint(dogOwner, newCounter);
        s_tokenCounter++;
        s_nftState = State.open;
        _setTokenURI(newCounter, S_TOKEN_URI[uint256(dogBreed)]);
        emit NftMinted(dogBreed, dogOwner);
    }

    function getBreedFromModdedRng(
        uint256 moddedRng
    ) public pure returns (Breed) {
        uint256 cummulativeSum = 0;
        uint256[3] memory chanceArray = getChance();

        //incase you get confuse of algorithm below you can use this calculation below and illustrate algo
        //moddedRng
        //i =0
        //cummulativeSum

        for (uint256 i = 0; i < chanceArray.length; i++) {
            if (moddedRng >= cummulativeSum && moddedRng < chanceArray[i]) {
                return Breed(i);
            }
            cummulativeSum = chanceArray[i];
        }
        revert RandomIPFSNFT__RangeOutOfBounds();
    }

    //view and pure functions

    function getChance() public pure returns (uint256[3] memory) {
        return [10, 40, MAX_CHANCE_VALUE];
    }

    function getMintFee() public view returns (uint256) {
        return i_mintFee;
    }

    function getDogTokenUrls(
        uint256 index
    ) public view returns (string memory) {
        return S_TOKEN_URI[index];
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getVrfCoorfinator()
        public
        view
        returns (VRFCoordinatorV2Interface)
    {
        return i_vrfCoordinator;
    }

    function getSubscriptionId() public view returns (uint64) {
        return i_subscriptionId;
    }

    function getkeyHash() public view returns (bytes32) {
        return i_keyHash;
    }

    function getCallBackGaaLimit() public view returns (uint32) {
        return i_callbackGasLimit;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getTokenUri() public view returns (string[] memory) {
        return S_TOKEN_URI;
    }

    function getMinter(uint256 index) public view returns (address) {
        return s_requestIdToSender[index];
    }
}
