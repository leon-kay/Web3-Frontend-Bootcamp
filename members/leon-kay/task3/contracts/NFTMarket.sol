// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract NFTMarket {
    struct Sale {
        address seller;
        uint256 price;
        bool isActive;
    }

    mapping(address => mapping(uint256 => Sale)) public nftSales;

    // 事件声明
    event NFTListed(address indexed nftAddress, uint256 indexed tokenId, address seller, uint256 price);
    event NFTPurchased(address indexed nftAddress, uint256 indexed tokenId, address seller, address buyer, uint256 price);

    function listNFT(address nftAddress, uint256 tokenId, uint256 price, address tokenAddress) public {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), tokenId);
        nftSales[nftAddress][tokenId] = Sale(msg.sender, price, true);

        emit NFTListed(nftAddress, tokenId, msg.sender, price);
    }

    function buyNFT(address nftAddress, uint256 tokenId, address tokenAddress) public {
        Sale memory sale = nftSales[nftAddress][tokenId];
        require(sale.isActive, "NFT not for sale");

        IERC20(tokenAddress).transferFrom(msg.sender, sale.seller, sale.price);
        IERC721(nftAddress).transferFrom(address(this), msg.sender, tokenId);

        sale.isActive = false;
        nftSales[nftAddress][tokenId] = sale;

        emit NFTPurchased(nftAddress, tokenId, sale.seller, msg.sender, sale.price);
    }
}
