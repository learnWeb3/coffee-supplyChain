import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import SupplyChain from "../../../build/contracts/SupplyChain.json";
import "../styles/main.scss";
import navigateTo from "./Router/index";
import Connect from "./Connect/index";

class App {
  constructor() {
    this.web3 = null;
    this.networkId = null;
    this.contract = null;
    this.currentAddress = null;
    this.accountTypes = null;
  }

  // enable metamask events support
  async _metamaskEvents(provider) {
    const self = this;

    provider.on("accountsChanged", (accounts) => {
      self.run();
    });

    provider.on("disconnect", (error) => {
      self.run();
    });

    provider.on("chainChanged", (chainId) => {
      self.run();
    });
  }

  // metamask browser support detection
  async detectMetamask() {
    try {
      const provider = await detectEthereumProvider();
      if (provider) {
        // enable metamask events support
        this._metamaskEvents(provider);
        return provider;
      } else {
        console.log("running on localblockchain");
        return process.env.PROVIDER_URL;
      }
    } catch (error) {
      console.error("please install metamsk or lauch ganache instance");
    }
  }

  // web3 library initilaisation
  async initWeb3(provider) {
    try {
      this.web3 = new Web3(provider);
      const { eth } = this.web3;
      this.networkId = await eth.net.getId();
      this.contract = new eth.Contract(
        SupplyChain.abi,
        SupplyChain.networks[this.networkId].address
      );
      this.contract.eth = eth;
      await provider.request({ method: "eth_requestAccounts" });
      this.currentAddress = await provider
        .request({ method: "eth_accounts" })
        .then((address) => address[0].toLowerCase());
    } catch (error) {
      console.error(error);
    }
  }

  // get account types aka Farmer/Distributor/Retailer/Consumer
  async getAccountTypes() {
    try {
      const accountTypes = await this.contract.methods
        .getAccountTypes()
        .call({ from: this.currentAddress });
      this.accountTypes = {
        isFarmer: accountTypes[0],
        isDistributor: accountTypes[1],
        isRetailer: accountTypes[2],
        isConsumer: accountTypes[3],
      };
    } catch (error) {
      console.error(error);
    }
  }

  // init web3, detect metamask support and render the page accordingly
  async run() {
    // detect metamask support
    new Connect("body", "connect");
    const provider = await this.detectMetamask();
    await this.initWeb3(provider);
    await this.getAccountTypes();
    const { isFarmer, isDistributor, isRetailer, isConsumer } =
      this.accountTypes;
    if (!isFarmer && !isDistributor && !isRetailer && !isConsumer) {
      navigateTo("sign", this.contract, this.currentAddress);
    } else {
      navigateTo("home", this.contract, this.currentAddress);
    }
  }

  // lauch the app
  static launch() {
    const APP = new App();
    APP.run();
  }
}

App.launch();
