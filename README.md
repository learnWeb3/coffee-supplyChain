# Supply chain & data auditing

This repository containts an Ethereum DApp that demonstrates a Supply Chain flow between a Seller and Buyer.

The user story is similar to any commonly used supply chain process. A Seller can add items to the inventory system stored in the blockchain. A Buyer can purchase such items from the inventory system. Additionally a Seller can mark an item as Shipped, and similarly a Buyer can mark an item as Received.

A different user interface has been made in order to differentiate the actions according to the user roles and offer a subscription page with account type choices.

We have choosen to implement an upload of a file accessible under the farmer account's role using IPFS decentralized file system storage referencing the hash in the smart contract, this file could be of different nature according to agriculture policies around the world but could serve the purpose of sharing quality and variety analysis of the item harvested for example to the other actors in the supplychain platform.

[PRE PROJECT FILES](pre-project/)
[UML SCHEMES](pre-project/UML)

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

In order to interact with the platform you will need 4 different addresses funded with tests ethers on the ethereum Rinkeby network.

You can fund these addresses from an ethereum [faucet](https://faucet.rinkeby.io/):

## Config the app

In order to run the application you will need to create environnement files to refrences environnement variables and add the already deployed contract address to the supplychain contract abi.

```bash
# creating general environement file
echo -e "PROVIDER_URL=<YOUR INFURA RINKEBY PROVIDER URL>\nMNEMONIC=<YOUR METAMASK MNEMONIC>" >> ./project-6/.env
```

```bash
# creating client environement file
echo "PROVIDER_URL=<YOUR INFURA RINKEBY WEBSOCKET PROVIDER URL TO SUPPORT EVENTS>" >> ./project-6/client/.env
```

```bash
# creating server environement file
echo -e "PINATA_API_KEY=<YOUR API KEY>\nPINATA_API_SECRET=<YOUR API SECRET>" >> ./project-6/server/.env
```

```json
// replace network key in your contract abi when compiled
 "networks": {
    "4": {
      "events": {},
      "links": {},
      "address": "0x7Cea407Aa29631256da085d892886E9B14b8bb13",
      "transactionHash": "0xf41db71634083052649ee6c13c87c73448eeb29b122e30ed7abe8c5c14742b12"
    }
  }
```

## Quickstart (DEV ENVIRONNEMENT)

```bash
# install packages
npm run install
```

### Lauch the smart contract test

```bash
# lauch ganache-cli
ganache-cli
# install client packages
npm run test
```

### Deploy the smart contracts

```bash
# deploy the contracts to localhost network
npm run migrate-dev
```

### Running the app (development)

```bash
# running the app in dev environement
npm run app-dev
```

## Deployment (PROD ENVIRONNEMENT)

### Deploy the contract to ethereum rinkeby network

- Current rinkeby contract address: 0x7Cea407Aa29631256da085d892886E9B14b8bb13
- [Etherscan link to rinkeby contract](https://rinkeby.etherscan.io/address/0xe635af33AddA68f80c6973a8FAC6144fC3441FCd)

```bash
# deploy the contracts to rinkeby network
npm run migrate-rinkeby
```

### Build the app

```bash
# build the app
npm run build-app
```

### Run the app (production)

```bash
# build the app
npm run start-app
```

## Dependencies

### environnement

- Ganache CLI v6.12.2 (ganache-core: 2.13.2)
- Truffle v5.4.0 (core: 5.4.0)
- Solidity - 0.8.0 (solc-js)
- Node v14.17.3
- Web3.js v1.4.0

### smart contract

- @truffle/hdwallet-provider": "^1.0.35" (interact programmatically with a hierarchical deterministic wallet)
- "bignumber.js": "^9.0.1" (BigNum support in javascript)
- "chai": "^4.3.4" (assertion library for node js)
- "chai-bignumber": "^3.0.0" (assertion extension for chai library to support BigNum)
- "dotenv": "^10.0.0" (environnement variable manager)

### Client

- "parcel": "^2.0.0-beta.2" (assets,javascript modules bundler and much more)
- "sass": "^1.35.2" (scss pre-compiler)
- "@metamask/detect-provider": "^1.2.0" (detect metamask support in the browser)
- "jquery": "^3.6.0" (famous javascript utility library)
- "web3": "^1.4.0" (interact programmatically with the smart contract abi and the blockchain)

### Server

- "@pinata/sdk": "^1.1.23" (IPFS sdk using the PINATA IPFS gateway)
- "body-parser": "^1.19.0" (parse the body of a request according to it's content type)
- "cors": "^2.8.5" (cors configuration for express)
- "express-fileupload": "^1.2.1" (webserver in node js)

## Built With

- [Ethereum](https://www.ethereum.org/) - Ethereum is a decentralized platform that runs smart contracts
- [IPFS](https://ipfs.io/) - IPFS is the Distributed Web | A peer-to-peer hypermedia protocol
  to make the web faster, safer, and more open.
- [Truffle Framework](http://truffleframework.com/) - Truffle is the most popular development framework for Ethereum with a mission to make your life a whole lot easier.

## Authors

See also the list of [contributors](https://github.com/your/project/contributors.md) who participated in this project.

## Acknowledgments

- Solidity
- Ganache-cli
- Truffle
- IPFS
