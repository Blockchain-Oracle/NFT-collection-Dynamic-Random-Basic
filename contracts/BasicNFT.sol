// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

pragma solidity ^0.8.7;

contract BasicNFT is ERC721 {
    uint256 private s_tokenCounter;
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";

    constructor() ERC721("Doggy", "DOG") {
        s_tokenCounter = 0;
    }

    function mintNft() public returns (uint256) {
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter++;
        return s_tokenCounter;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
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
        return TOKEN_URI;
    }

    //view and pure function

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }

    function getTokenURL() public pure returns (string memory) {
        return TOKEN_URI;
    }
}
