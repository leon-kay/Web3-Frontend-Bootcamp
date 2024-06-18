const { expect } = require("chai");

describe("NFTMarket", function () {
  let deployer, user;
  let token, nft, market;

  beforeEach(async function () {
    [deployer, user] = await ethers.getSigners();

    const MyToken = await ethers.getContractFactory("MyToken");
    token = await MyToken.deploy("10000000000000000000000"); // 10,000 MTK

    const MyNFT = await ethers.getContractFactory("MyNFT");
    nft = await MyNFT.deploy();

    const NFTMarket = await ethers.getContractFactory("NFTMarket");
    market = await NFTMarket.deploy(token.address, nft.address);
  });

  it("should allow users to list and buy NFTs", async function () {
    await nft.connect(deployer).mintNFT(user.address, "tokenURI1");
    await nft.connect(user).approve(market.address, 1);
    await market.connect(user).listNFT(1, 100);

    await token.connect(user).approve(market.address, 100);
    await market.connect(user).buyNFT(0);

    expect(await nft.ownerOf(1)).to.equal(user.address);
  });
});
