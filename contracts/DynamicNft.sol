// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "base64-sol/base64.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

// error DynamicNft__uriQurery_for_not_existent_query();
error DynamicNft__URI_QueryFor_NonExistentToken();

contract DynamicNft is ERC721URIStorage {
    uint256 private s_counter;

    string private TOKENURI;

    string private i_lowSvg;
    string private i_highSvg;
    string private constant BASE64ENCODEDPREFIX = "data:image/svg+xml;base64,";
    AggregatorV3Interface internal immutable dataFeed;

    mapping(uint256 => uint256) public s_TokenIdToHighValue;

    event CreatedNft(address minter, uint256 tokenId);

    //MINT
    //STORE SVG INFORMATION
    //SHOW X IMAGES AND SHOW Y
    constructor(
        string memory lowSvg,
        string memory highSvg,
        address priceFeedAddress
    ) ERC721("Blockchain Oracle  Dynamic", "BOD") {
        i_lowSvg = svgToImg(lowSvg);
        i_highSvg = svgToImg(highSvg);
        dataFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function mintNft(uint256 highValue) public {
        s_counter++;
        _safeMint(msg.sender, s_counter);
        s_TokenIdToHighValue[s_counter] = highValue;
        emit CreatedNft(msg.sender, s_counter);
    }

    function svgToImg(string memory svg) public pure returns (string memory) {
        string memory svg64BaseEncoded = Base64.encode(
            bytes(string(abi.encodePacked(svg)))
        );
        return string(abi.encodePacked(BASE64ENCODEDPREFIX, svg64BaseEncoded));
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        /**
         * @dev Reverts if the `tokenId` doesn't have a current owner (it hasn't been minted, or it has been burned).
         * Returns the owner.
         *
         * Overrides to ownership logic should be done to {_ownerOf}.
         */

        address owner = _ownerOf(tokenId);
        if (owner == address(0)) {
            revert ERC721NonexistentToken(tokenId);
        }

        uint256 ethPrice = getPriceFeed();
        string memory imageUri = i_lowSvg;

        if (ethPrice >= s_TokenIdToHighValue[s_counter]) {
            imageUri = i_highSvg;
        }

        return
            string(
                abi.encodePacked(
                    _baseURI(),
                    (
                        Base64.encode(
                            bytes(
                                abi.encodePacked(
                                    '{"name":"',
                                    name(),
                                    '",  "description":"An NFT that change based on price",',
                                    '"attributes":[{"trait_type": "coolness", "value":100}], "image":"',
                                    imageUri,
                                    '"}'
                                )
                            )
                        )
                    )
                )
            );
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return "data:application/json;base64,";
    }

    // _tokenuri

    //get price of eth/usd
    function getPriceFeed() public view returns (uint256) {
        (
            ,
            /* uint80 roundID */ int answer /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/,
            ,
            ,

        ) = dataFeed.latestRoundData();
        return uint256(answer);
    }

    //pure / view functions

    function getLowSvg() public view returns (string memory) {
        return i_lowSvg;
    }

    function getHighSvg() public view returns (string memory) {
        return i_highSvg;
    }

    function getPriceFeedAddress() public view returns (AggregatorV3Interface) {
        return dataFeed;
    }

    function getCounter() public view returns (uint256) {
        return s_counter;
    }
}
