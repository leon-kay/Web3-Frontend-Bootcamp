// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MyNFT.sol";
import "./MyToken.sol";

contract NFTMarket {
    MyToken public token;
    MyNFT public nft;

    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
    }

    Listing[] public listings;

    constructor(address _token, address _nft) {
        token = MyToken(_token);
        nft = MyNFT(_nft);
    }

    function listNFT(uint256 tokenId, uint256 price) public {
        require(nft.ownerOf(tokenId) == msg.sender, "Not the owner");
        nft.transferFrom(msg.sender, address(this), tokenId);
        listings.push(Listing(tokenId, msg.sender, price));
    }

    function buyNFT(uint256 index) public {
        Listing memory listing = listings[index];
        require(
            token.balanceOf(msg.sender) >= listing.price,
            "Insufficient balance"
        );
        token.transferFrom(msg.sender, listing.seller, listing.price);
        nft.transferFrom(address(this), msg.sender, listing.tokenId);

        listings[index] = listings[listings.length - 1];
        listings.pop();
    }
}
