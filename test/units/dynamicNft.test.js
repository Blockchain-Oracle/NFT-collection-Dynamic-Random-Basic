const { deployments, getNamedAccounts, ethers } = require("hardhat");
const { assert, expect } = require("chai");
describe("DynamicNft", () => {
  let deployer, mocK, dynamicNft;
  beforeEach(async () => {
    await deployments.fixture(["all"]);
    deployer = (await getNamedAccounts()).deployer;
    mocK = await ethers.getContract("MockV3Aggregator", deployer);
    await mocK.waitForDeployment();
    dynamicNft = await ethers.getContract("DynamicNft", deployer);
    await dynamicNft.waitForDeployment();
  });

  describe("constructor", () => {
    // string memory lowSvg,
    // string memory highSvg,
    // address priceFeedAddress

    it("confirms lovsvg", async () => {
      const lowSvg = await dynamicNft.getLowSvg();
      assert.equal(
        lowSvg,
        "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/Pgo8c3ZnIHdpZHRoPSIxMDI0cHgiIGhlaWdodD0iMTAyNHB4IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik01MTIgNjRDMjY0LjYgNjQgNjQgMjY0LjYgNjQgNTEyczIwMC42IDQ0OCA0NDggNDQ4IDQ0OC0yMDAuNiA0NDgtNDQ4Uzc1OS40IDY0IDUxMiA2NHptMCA4MjBjLTIwNS40IDAtMzcyLTE2Ni42LTM3Mi0zNzJzMTY2LjYtMzcyIDM3Mi0zNzIgMzcyIDE2Ni42IDM3MiAzNzItMTY2LjYgMzcyLTM3MiAzNzJ6Ii8+CiAgPHBhdGggZmlsbD0iI0U2RTZFNiIgZD0iTTUxMiAxNDBjLTIwNS40IDAtMzcyIDE2Ni42LTM3MiAzNzJzMTY2LjYgMzcyIDM3MiAzNzIgMzcyLTE2Ni42IDM3Mi0zNzItMTY2LjYtMzcyLTM3Mi0zNzJ6TTI4OCA0MjFhNDguMDEgNDguMDEgMCAwIDEgOTYgMCA0OC4wMSA0OC4wMSAwIDAgMS05NiAwem0zNzYgMjcyaC00OC4xYy00LjIgMC03LjgtMy4yLTguMS03LjRDNjA0IDYzNi4xIDU2Mi41IDU5NyA1MTIgNTk3cy05Mi4xIDM5LjEtOTUuOCA4OC42Yy0uMyA0LjItMy45IDcuNC04LjEgNy40SDM2MGE4IDggMCAwIDEtOC04LjRjNC40LTg0LjMgNzQuNS0xNTEuNiAxNjAtMTUxLjZzMTU1LjYgNjcuMyAxNjAgMTUxLjZhOCA4IDAgMCAxLTggOC40em0yNC0yMjRhNDguMDEgNDguMDEgMCAwIDEgMC05NiA0OC4wMSA0OC4wMSAwIDAgMSAwIDk2eiIvPgogIDxwYXRoIGZpbGw9IiMzMzMiIGQ9Ik0yODggNDIxYTQ4IDQ4IDAgMSAwIDk2IDAgNDggNDggMCAxIDAtOTYgMHptMjI0IDExMmMtODUuNSAwLTE1NS42IDY3LjMtMTYwIDE1MS42YTggOCAwIDAgMCA4IDguNGg0OC4xYzQuMiAwIDcuOC0zLjIgOC4xLTcuNCAzLjctNDkuNSA0NS4zLTg4LjYgOTUuOC04OC42czkyIDM5LjEgOTUuOCA4OC42Yy4zIDQuMiAzLjkgNy40IDguMSA3LjRINjY0YTggOCAwIDAgMCA4LTguNEM2NjcuNiA2MDAuMyA1OTcuNSA1MzMgNTEyIDUzM3ptMTI4LTExMmE0OCA0OCAwIDEgMCA5NiAwIDQ4IDQ4IDAgMSAwLTk2IDB6Ii8+Cjwvc3ZnPg=="
      );
    });
    it("confirms highsvg", async () => {
      const highSvg = await dynamicNft.getHighSvg();
      assert.equal(
        highSvg,
        "data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgd2lkdGg9IjQwMCIgIGhlaWdodD0iNDAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgZmlsbD0ieWVsbG93IiByPSI3OCIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLXdpZHRoPSIzIi8+CiAgPGcgY2xhc3M9ImV5ZXMiPgogICAgPGNpcmNsZSBjeD0iNjEiIGN5PSI4MiIgcj0iMTIiLz4KICAgIDxjaXJjbGUgY3g9IjEyNyIgY3k9IjgyIiByPSIxMiIvPgogIDwvZz4KICA8cGF0aCBkPSJtMTM2LjgxIDExNi41M2MuNjkgMjYuMTctNjQuMTEgNDItODEuNTItLjczIiBzdHlsZT0iZmlsbDpub25lOyBzdHJva2U6IGJsYWNrOyBzdHJva2Utd2lkdGg6IDM7Ii8+Cjwvc3ZnPg=="
      );
    });

    it("confirms priceFeed address", async () => {
      const priceFeed = await dynamicNft.getPriceFeedAddress();
      const mockPriceAddress = mocK.target;
      assert.equal(priceFeed, mockPriceAddress);
    });
  });

  describe("mintNft", () => {
    // s_counter++;
    //     _safeMint(msg.sender, s_counter);
    //     s_TokenIdToHighValue[s_counter] = highValue;
    //     emit CreatedNft(msg.sender, s_counter);
    it("confirms counterIntialzation", async () => {
      const counter = await dynamicNft.getCounter();
      assert.equal(counter, 0);
    });
    it("confirms counterIncrement", async () => {
      const { answer } = await mocK.latestRoundData();
      // console.log(answer);
      await dynamicNft.mintNft(answer);
      const counter = await dynamicNft.getCounter();
      assert.equal(counter, 1);
      //confirms if highSvg, or lowSvg
    });

    it("confirms if event was emited", async () => {
      await expect(dynamicNft.mintNft(500)).to.emit(dynamicNft, "CreatedNft");
    });
  });
  describe("confirms image to svg", () => {
    it("confirms image  to suv", async () => {
      const imgSvgFunc = await dynamicNft.svgToImg("@222");
      expect(imgSvgFunc).to.include("data:image/svg+xml;base64");
    });
  });
  describe("token uri", () => {
    it("confirms high svg", async () => {
      await dynamicNft.mintNft(400000);
      const tokenUriMetaData = await dynamicNft.tokenURI(1);
      expect(tokenUriMetaData).to.includes("data:application/json;base64");
    });

    it("confirms revert", async () => {
      await expect(dynamicNft.tokenURI(1)).to.revertedWithCustomError(
        dynamicNft,
        "ERC721NonexistentToken"
      );
    });
  });
});
