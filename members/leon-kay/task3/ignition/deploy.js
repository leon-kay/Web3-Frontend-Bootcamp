// scripts/deploy.js
async function main() {
  const [deployer, user] = await ethers.getSigners();

  // 部署 ERC20 代币合约
  const Token = await ethers.getContractFactory("MyToken");
  const token = await Token.deploy("10");
  await token.deployed();
  console.log("Token deployed to:", token.address);

  // 部署 ERC721 NFT 合约
  const NFT = await ethers.getContractFactory("MyNFT");
  const nft = await NFT.deploy();
  await nft.deployed();
  console.log("NFT deployed to:", nft.address);

  // 部署 NFT 市场合约
  const Market = await ethers.getContractFactory("NFTMarket");
  const market = await Market.deploy();
  await market.deployed();
  console.log("Market deployed to:", market.address);

  // 铸造 NFT
  let transaction = await nft
    .connect(deployer)
    .mintNFT(deployer.address, "https://mytokenuri.com/nft1");
  const tx = await transaction.wait();
  const tokenId = tx.events[0].args.tokenId;
  console.log("NFT Minted:", tokenId.toString());

  // 授权市场合约操作所有 NFT
  transaction = await nft
    .connect(deployer)
    .setApprovalForAll(market.address, true);
  await transaction.wait();

  // 将 NFT 上架到市场
  const listingPrice = ethers.utils.parseUnits("1", 18);
  transaction = await market
    .connect(deployer)
    .listNFT(nft.address, tokenId, listingPrice, token.address);
  await transaction.wait();
  console.log("NFT Listed on Market");

  // 用户购买 NFT
  // 首先，将代币从部署者转移给其他用户
  transaction = await token
    .connect(deployer)
    .transfer(user.address, ethers.utils.parseUnits("500", 18));
  await transaction.wait();

  // 用户需要先授权市场从其账户扣款
  transaction = await token.connect(user).approve(market.address, listingPrice);
  await transaction.wait();

  // 用户购买 NFT
  transaction = await market
    .connect(user)
    .buyNFT(nft.address, tokenId, token.address);
  await transaction.wait();
  console.log("NFT Purchased by User");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
