const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { networkConfig } = require("../../helper-hardhat-config");
const chainId = network.config.chainId;
describe("RandomIPFSNFT", () => {
  let deployer, MockV3Aggragator, RandomIPFSNFT, subscriptionId;
  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["all"]);
    MockV3Aggragator = await ethers.getContract(
      "VRFCoordinatorV2Mock",
      deployer
    );
    await MockV3Aggragator.waitForDeployment();
    RandomIPFSNFT = await ethers.getContract("RandomIPFSNFT", deployer);
    await RandomIPFSNFT.waitForDeployment();
    subscriptionId = await RandomIPFSNFT.getSubscriptionId();
    await MockV3Aggragator.addConsumer(
      subscriptionId,
      await RandomIPFSNFT.getAddress()
    );
  });
  describe("constructor", () => {
    it("confirm all constructor inputs", async () => {
      // address _vrfCoordinator,
      // uint64 _subscriptionId,
      // bytes32 _keyHash,
      // uint32 _callbackGasLimit,
      // uint256 _amount,
      // string[3] memory _tokenuri
      const _vrfCoordinator = await RandomIPFSNFT.getVrfCoorfinator();
      assert.equal(_vrfCoordinator, MockV3Aggragator.target);
      const _subscriptionId = await RandomIPFSNFT.getSubscriptionId();
      assert.equal(_subscriptionId, 1);
      const KeyHash = await RandomIPFSNFT.getkeyHash();
      assert.equal(KeyHash, networkConfig[chainId]["keyHash"]);
      const _callbackGasLimit = await RandomIPFSNFT.getCallBackGaaLimit();
      assert.equal(
        _callbackGasLimit,
        networkConfig[chainId]["CALLBACK_GAS_LIMIT"]
      );
      const _amount = await RandomIPFSNFT.getMintFee();
      assert.equal(_amount, networkConfig[chainId]["fundAmount"]);
      expect((await RandomIPFSNFT.getTokenUri()).length).to.equal(3);
    });
  });

  describe("requestNft", () => {
    it("confirms amounts SENDING, emiting of events", async () => {
      await expect(RandomIPFSNFT.requestNft()).to.be.revertedWithCustomError(
        RandomIPFSNFT,
        "RandomIPFSNFT__NotEnoughEthSent"
      );
      await expect(
        RandomIPFSNFT.requestNft({
          value: networkConfig[chainId]["fundAmount"],
        })
      ).to.emit(RandomIPFSNFT, "nftRequest");

      const trx = await RandomIPFSNFT.requestNft({
        value: networkConfig[chainId]["fundAmount"],
      });
      const MappingConfirm = await RandomIPFSNFT.getMinter(1);
      console.log(MappingConfirm);
      assert.equal(deployer, MappingConfirm);
    });
  });

  describe("fullfillRandomWords", () => {
    it("confirm  stuffs", async () => {
      //emits event,confirm token , confirm increament
      return new Promise(async (resolve, reject) => {
        RandomIPFSNFT.once("NftMinted", async () => {
          console.log("evets found");
          try {
            assert.equal(counterInital, 0);
            const counter = await RandomIPFSNFT.getTokenCounter();
            assert.equal(counter, 1);
            const ipfsCon = await RandomIPFSNFT.getTokenUri();
            expect(ipfsCon[0]).to.includes("ipfs");
          } catch (error) {
            reject(error);
          }
          resolve();
        });
        const txR = await RandomIPFSNFT.requestNft({
          value: networkConfig[chainId]["fundAmount"],
        });
        const counterInital = await RandomIPFSNFT.getTokenCounter();

        await txR.wait(1);
        await MockV3Aggragator.fulfillRandomWords(
          subscriptionId,
          await RandomIPFSNFT.getAddress()
        );
      });
    });
  });

  describe(" getBreedFromModdedRng", () => {
    it("should return pug if moddedRng < 10", async function () {
      const expectedValue = await RandomIPFSNFT.getBreedFromModdedRng(7);
      assert.equal(0, expectedValue);
    });
    it("should return shiba-inu if moddedRng is between 10 - 39", async function () {
      const expectedValue = await RandomIPFSNFT.getBreedFromModdedRng(21);
      assert.equal(1, expectedValue);
    });
    it("should return st. bernard if moddedRng is between 40 - 99", async function () {
      const expectedValue = await RandomIPFSNFT.getBreedFromModdedRng(77);
      assert.equal(2, expectedValue);
    });
    it("should revert if moddedRng > 99", async function () {
      await expect(
        RandomIPFSNFT.getBreedFromModdedRng(100)
      ).to.be.revertedWithCustomError(
        RandomIPFSNFT,
        "RandomIPFSNFT__RangeOutOfBounds"
      );
    });
  });

  describe("withdraw", () => {
    it("confirms wuthdraw", async () => {
      accounts = await ethers.getSigners();
      connectContract = await RandomIPFSNFT.connect(accounts[1]);
      await expect(connectContract.withdraw()).to.be.revertedWithCustomError(
        RandomIPFSNFT,
        "RandomIPFSNFT__NotOwner"
      );
    });
  });
});
