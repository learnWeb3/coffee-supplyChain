// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// assertion library
const chai = require("chai");
const assert = require("chai").assert;
const expect = require("chai").expect;
// Bignumbers managemnt for js
const BigNumber = require("bignumber.js");
//use default BigNumber
chai.use(require("chai-bignumber")());
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require("SupplyChain");

contract("SupplyChain", function (accounts) {
  // Declare few constants and assign a few sample accounts generated by ganache-cli
  var sku = 1;
  var upc = 1;
  const ownerID = accounts[0];
  const originFarmerID = accounts[1];
  const originFarmName = "John Doe";
  const originFarmInformation = "Yarray Valley";
  const originFarmLatitude = "-38.239770";
  const originFarmLongitude = "144.341490";
  var productID = sku + upc;
  const productNotes = "Best beans for Espresso";
  const productPrice = web3.utils.toWei(`1`, "ether");
  var itemState = 0;
  const distributorID = accounts[2];
  const retailerID = accounts[3];
  const consumerID = accounts[4];
  const emptyAddress = "0x00000000000000000000000000000000000000";
  const otherFarmerID = accounts[5];
  const farmerDocumentId = "QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR"

  console.log("ganache-cli accounts used here...");
  console.log("Contract Owner: accounts[0] ", accounts[0]);
  console.log("Farmer: accounts[1] ", accounts[1]);
  console.log("Distributor: accounts[2] ", accounts[2]);
  console.log("Retailer: accounts[3] ", accounts[3]);
  console.log("Consumer: accounts[4] ", accounts[4]);

  it("Testing smart contract function addFarmer() to add a farmer account", async () => {
    const supplyChain = await SupplyChain.deployed();
    // initial farmer
    await supplyChain.addFarmer(originFarmerID);
    // other farmer to check product rights
    await supplyChain.addFarmer(otherFarmerID);
    // check that farmer has been successfullly added
    const checkFarmer = await supplyChain.isFarmer(originFarmerID);
    assert.equal(checkFarmer, true, `${originFarmerID} is a farmer`);
    // check event has been emitted
    const farmerAddedEvents = await supplyChain.getPastEvents("FarmerAdded");
    assert.equal(farmerAddedEvents[0].event, "FarmerAdded");
  });

  it("Testing smart contract function addDistributor() to add a distributor account", async () => {
    const supplyChain = await SupplyChain.deployed();
    await supplyChain.addDistributor(distributorID);
    // check that distributor has been successfullly added
    const checkDistributor = await supplyChain.isDistributor(distributorID);
    assert.equal(checkDistributor, true, `${distributorID} is a distributor`);
    // check event has been emitted
    const distributorAddedEvents = await supplyChain.getPastEvents(
      "DistributorAdded"
    );
    assert.equal(distributorAddedEvents.length, 1);
    assert.equal(distributorAddedEvents[0].event, "DistributorAdded");
  });

  it("Testing smart contract function addRetailer() to add a retailer account", async () => {
    const supplyChain = await SupplyChain.deployed();
    await supplyChain.addRetailer(retailerID);
    // check that retailer has been successfullly added
    const checkRetailer = await supplyChain.isRetailer(retailerID);
    assert.equal(checkRetailer, true, `${retailerID} is a retailer`);
    const retailerAddedEvents = await supplyChain.getPastEvents(
      "RetailerAdded"
    );
    // check event has been emitted
    assert.equal(retailerAddedEvents.length, 1);
    assert.equal(retailerAddedEvents[0].event, "RetailerAdded");
  });

  it("Testing smart contract function addConsumer() to add a consumer account", async () => {
    const supplyChain = await SupplyChain.deployed();
    await supplyChain.addConsumer(consumerID);
    // check that consumer has been successfullly added
    const checkConsumer = await supplyChain.isConsumer(consumerID);
    assert.equal(checkConsumer, true, `${consumerID} is a consumer`);
    // check event has been emitted
    const consumerAddedEvents = await supplyChain.getPastEvents(
      "ConsumerAdded"
    );
    assert.equal(consumerAddedEvents.length, 1);
    assert.equal(consumerAddedEvents[0].event, "ConsumerAdded");
  });

  it("Testing smart contract function harvestItem() that is farmerOnly", async () => {
    const supplyChain = await SupplyChain.deployed();

    // calling function using distributorId
    try {
      await supplyChain.harvestItem(
        upc,
        originFarmerID,
        originFarmName,
        originFarmInformation,
        originFarmLatitude,
        originFarmLongitude,
        productNotes,
        farmerDocumentId,
        { from: distributorID }
      );
      // tx should fail
      assert.fail(`${distributorID} is not a farmer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need farmer role");
    }
    // calling function using retailerID
    try {
      await supplyChain.harvestItem(
        upc,
        originFarmerID,
        originFarmName,
        originFarmInformation,
        originFarmLatitude,
        originFarmLongitude,
        productNotes,
        farmerDocumentId,
        { from: retailerID }
      );
      // tx should fail
      assert.fail(`${retailerID} is not a farmer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need farmer role");
    }

    // calling function using consumerId
    try {
      await supplyChain.harvestItem(
        upc,
        originFarmerID,
        originFarmName,
        originFarmInformation,
        originFarmLatitude,
        originFarmLongitude,
        productNotes,
        farmerDocumentId,
        { from: consumerID }
      );
      // tx should fail
      assert.fail(`${consumerID} is not a farmer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need farmer role");
    }
  });

  it("Testing smart contract function harvestItem() that allows a farmer to harvest coffee", async () => {
    const supplyChain = await SupplyChain.deployed();
    await supplyChain.harvestItem(
      upc,
      originFarmerID,
      originFarmName,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      productNotes,
      farmerDocumentId,
      { from: originFarmerID }
    );
    // check Harvested event is emitted
    const harvestedEvents = await supplyChain.getPastEvents("Harvested");
    assert.equal(harvestedEvents.length, 1);
    assert.equal(harvestedEvents[0].event, "Harvested");
    // check product state has changed
    const product = await supplyChain.fetchItemBufferTwo(upc);
    expect(new BigNumber(product.itemState)).to.be.bignumber.equal("0");
  });

  it("Test that the previous supply chain stage has been successfully completed", async () => {
    const supplyChain = await SupplyChain.deployed();

    // test purchaseItem should fail
    try {
      await supplyChain.purchaseItem(upc, {
        from: consumerID,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "not received");
    }

    // test receiveItem should fail
    try {
      await supplyChain.receiveItem(upc, { from: retailerID });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "not shipped");
    }
    // test packItem should fail
    try {
      await supplyChain.packItem(upc, { from: originFarmerID });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "not processed");
    }
    // test sellItem should fail
    try {
      await supplyChain.sellItem(upc, productPrice, { from: originFarmerID });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "not packed");
    }
    // test buyItem should fail
    try {
      await supplyChain.buyItem(upc, {
        from: distributorID,
        value: productPrice,
      });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "not forSale");
    }
  });

  it("Testing smart contract function processItem() that is farmerOnly", async () => {
    const supplyChain = await SupplyChain.deployed();
    // calling function using distributorId
    try {
      await supplyChain.processItem(upc, { from: distributorID });
      // tx should fail
      assert.fail(`${distributorID} is not a farmer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need farmer role");
    }
    // calling function using retailerID
    try {
      await supplyChain.processItem(upc, { from: retailerID });
      // tx should fail
      assert.fail(`${retailerID} is not a farmer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need farmer role");
    }

    // calling function using consumerId
    try {
      await supplyChain.processItem(upc, { from: consumerID });
      // tx should fail
      assert.fail(`${consumerID} is not a farmer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need farmer role");
    }
  });
  it("Testing smart contract function processItem() that is isOriginFarmer", async () => {
    const supplyChain = await SupplyChain.deployed();
    try {
      await supplyChain.processItem(upc, { from: otherFarmerID });
      // tx should fail
      assert.fail(`${otherFarmerID} is not the originator of the product`);
    } catch (error) {
      assert.equal(error.reason, "invalid caller");
    }
  });
  it("Testing smart contract function processItem() that allows a farmer to process coffee", async () => {
    const supplyChain = await SupplyChain.deployed();
    await supplyChain.processItem(upc, { from: originFarmerID });
    const processedEvents = await supplyChain.getPastEvents("Processed");
    assert.equal(processedEvents.length, 1);
    assert.equal(processedEvents[0].event, "Processed");
    const product = await supplyChain.fetchItemBufferTwo(upc, {
      from: originFarmerID,
    });
    expect(new BigNumber(product.itemState)).to.be.bignumber.equal("1");
  });

  it("Testing smart contract function packItem() that is farmerOnly", async () => {
    const supplyChain = await SupplyChain.deployed();
    // calling function using distributorId
    try {
      await supplyChain.packItem(upc, { from: distributorID });
      // tx should fail
      assert.fail(`${distributorID} is not a farmer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need farmer role");
    }
    // calling function using retailerID
    try {
      await supplyChain.packItem(upc, { from: retailerID });
      // tx should fail
      assert.fail(`${retailerID} is not a farmer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need farmer role");
    }

    // calling function using consumerId
    try {
      await supplyChain.packItem(upc, { from: consumerID });
      // tx should fail
      assert.fail(`${consumerID} is not a farmer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need farmer role");
    }
  });
  it("Testing smart contract function packItem() that is isOriginFarmer", async () => {
    const supplyChain = await SupplyChain.deployed();
    try {
      await supplyChain.packItem(upc, { from: accounts[-1] });
      assert.fail();
    } catch (error) {
      assert.equal(error.reason, "invalid caller");
    }
  });
  it("Testing smart contract function packItem() that allows a farmer to pack coffee", async () => {
    const supplyChain = await SupplyChain.deployed();
    await supplyChain.packItem(upc, { from: originFarmerID });
    const packedEvents = await supplyChain.getPastEvents("Packed");
    assert.equal(packedEvents.length, 1);
    assert.equal(packedEvents[0].event, "Packed");
    const product = await supplyChain.fetchItemBufferTwo(upc, {
      from: originFarmerID,
    });
    expect(new BigNumber(product.itemState)).to.be.bignumber.equal("2");
  });

  it("Testing smart contract function sellItem() that is farmerOnly", async () => {
    const supplyChain = await SupplyChain.deployed();
    // calling function using distributorId
    try {
      await supplyChain.sellItem(upc, productPrice, { from: distributorID });
      // tx should fail
      assert.fail(`${distributorID} is not a farmer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need farmer role");
    }
    // calling function using retailerID
    try {
      await supplyChain.sellItem(upc, productPrice, { from: retailerID });
      // tx should fail
      assert.fail(`${retailerID} is not a farmer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need farmer role");
    }

    // calling function using consumerId
    try {
      await supplyChain.sellItem(upc, productPrice, { from: consumerID });
      // tx should fail
      assert.fail(`${consumerID} is not a farmer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need farmer role");
    }
  });
  it("Testing smart contract function sellItem() that allows a farmer to sell coffee", async () => {
    const supplyChain = await SupplyChain.deployed();
    await supplyChain.sellItem(upc, productPrice, { from: originFarmerID });
    const forSaleEvents = await supplyChain.getPastEvents("ForSale");
    assert.equal(forSaleEvents.length, 1);
    assert.equal(forSaleEvents[0].event, "ForSale");
    const product = await supplyChain.fetchItemBufferTwo(upc, {
      from: originFarmerID,
    });
    expect(new BigNumber(product.itemState)).to.be.bignumber.equal("3");
  });

  it("Testing smart contract function  buyItem() that is distributorOnly", async () => {
    const supplyChain = await SupplyChain.deployed();
    // calling function using farmerId
    try {
      await supplyChain.buyItem(upc, {
        from: originFarmerID,
        value: productPrice,
      });
      // tx should fail
      assert.fail(`${originFarmerID} is not a distributor`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need distributor role");
    }
    // calling function using retailerID
    try {
      await supplyChain.buyItem(upc, { from: retailerID, value: productPrice });
      // tx should fail
      assert.fail(`${retailerID} is not a distributor`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need distributor role");
    }

    // calling function using consumerId
    try {
      await supplyChain.buyItem(upc, { from: consumerID, value: productPrice });
      // tx should fail
      assert.fail(`${consumerID} is not a distributor`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need distributor role");
    }
  });

  it("Testing smart contract function  buyItem() that request a minimumn amount equal to the product price", async () => {
    const supplyChain = await SupplyChain.deployed();
    // calling function using distributorId
    try {
      await supplyChain.buyItem(upc, {
        from: distributorID,
        value: 1000,
      });
      // tx should fail
      assert.fail(`${consumerID} `);
    } catch (error) {
      // check reason provided match
      //console.log(error)
      assert.equal(error.reason, "not paid enough");
    }
  });
  it("Testing smart contract function buyItem() that allows a distributor to buy coffee", async () => {
    const supplyChain = await SupplyChain.deployed();
    await supplyChain.buyItem(upc, {
      from: distributorID,
      value: productPrice,
    });
    const soldEvents = await supplyChain.getPastEvents("Sold");
    assert.equal(soldEvents.length, 1);
    assert.equal(soldEvents[0].event, "Sold");
    const product = await supplyChain.fetchItemBufferTwo(upc, {
      from: originFarmerID,
    });
    expect(new BigNumber(product.itemState)).to.be.bignumber.equal("4");
  });

  it("Testing smart contract function  shipItem() that is distributorOnly", async () => {
    const supplyChain = await SupplyChain.deployed();
    // calling function using farmerId
    try {
      await supplyChain.shipItem(upc, {
        from: originFarmerID,
      });
      // tx should fail
      assert.fail(`${originFarmerID} is not a distributor`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need distributor role");
    }
    //calling function using retailerID
    try {
      await supplyChain.shipItem(upc, {
        from: retailerID,
      });
      // tx should fail
      assert.fail(`${retailerID} is not a distributor`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need distributor role");
    }
    // calling function using consumerId
    try {
      await supplyChain.shipItem(upc, {
        from: consumerID,
      });
      // tx should fail
      assert.fail(`${consumerID} is not a distributor`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need distributor role");
    }
  });
  it("Testing smart contract function shipItem() that allows a distributor to ship coffee", async () => {
    const supplyChain = await SupplyChain.deployed();
    await supplyChain.shipItem(upc);
    const shippedEvents = await supplyChain.getPastEvents("Shipped");
    assert.equal(shippedEvents.length, 1);
    assert.equal(shippedEvents[0].event, "Shipped");
    const product = await supplyChain.fetchItemBufferTwo(upc, {
      from: originFarmerID,
    });
    expect(new BigNumber(product.itemState)).to.be.bignumber.equal("5");
  });

  it("Testing smart contract function  receiveItem() that is retailerOnly", async () => {
    const supplyChain = await SupplyChain.deployed();
    // calling function using farmerId
    try {
      await supplyChain.receiveItem(upc, {
        from: originFarmerID,
      });
      // tx should fail
      assert.fail(`${originFarmerID} is not a retailer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need retailer role");
    }
    // calling function using distributorId
    try {
      await supplyChain.receiveItem(upc, {
        from: distributorID,
      });
      // tx should fail
      assert.fail(`${distributorID} is not a retailer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need retailer role");
    }

    // calling function using consumerId
    try {
      await supplyChain.receiveItem(upc, {
        from: consumerID,
      });
      // tx should fail
      assert.fail(`${consumerID} is not a retailer`);
    } catch (error) {
      // check reason provided match
      assert.equal(error.reason, "need retailer role");
    }
  });
  it("Testing smart contract function receiveItem() that allows a retailer to mark coffee received", async () => {
    const supplyChain = await SupplyChain.deployed();
    await supplyChain.receiveItem(upc, { from: retailerID });
    const receivedEvents = await supplyChain.getPastEvents("Received");
    assert.equal(receivedEvents.length, 1);
    assert.equal(receivedEvents[0].event, "Received");
    const product = await supplyChain.fetchItemBufferTwo(upc, {
      from: originFarmerID,
    });
    expect(new BigNumber(product.itemState)).to.be.bignumber.equal("6");
  });

  it("Testing smart contract function purchaseItem() that is consumerOnly", async () => {
    const supplyChain = await SupplyChain.deployed();
  });

  it("Testing smart contract function purchaseItem() that allows a consumer to purchase coffee", async () => {
    const supplyChain = await SupplyChain.deployed();
    await supplyChain.purchaseItem(upc, { from: consumerID });
    const purchasedEvents = await supplyChain.getPastEvents("Purchased");
    assert.equal(purchasedEvents.length, 1);
    assert.equal(purchasedEvents[0].event, "Purchased");
    const product = await supplyChain.fetchItemBufferTwo(upc, {
      from: originFarmerID,
    });
    expect(new BigNumber(product.itemState)).to.be.bignumber.equal("7");
  });

  it("Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain", async () => {
    const supplyChain = await SupplyChain.deployed();

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const productFetchedFromFarmer = await supplyChain.fetchItemBufferOne(upc, {
      from: originFarmerID,
    });
    const productFetchedFromDistributor = await supplyChain.fetchItemBufferOne(
      upc,
      {
        from: distributorID,
      }
    );
    const productFetchedFromRetailer = await supplyChain.fetchItemBufferOne(
      upc,
      {
        from: retailerID,
      }
    );

    const productFetchedFromConsumer = await supplyChain.fetchItemBufferOne(
      upc,
      {
        from: consumerID,
      }
    );
    const mandatoryKeys = [
      "itemSKU",
      "itemUPC",
      "ownerID",
      "originFarmerID",
      "originFarmName",
      "originFarmInformation",
      "originFarmLatitude",
      "originFarmLongitude",
    ];

    // Verify the result set:
    assert.hasAnyKeys(productFetchedFromFarmer, mandatoryKeys);
    assert.hasAnyKeys(productFetchedFromDistributor, mandatoryKeys);
    assert.hasAnyKeys(productFetchedFromRetailer, mandatoryKeys);
    assert.hasAnyKeys(productFetchedFromConsumer, mandatoryKeys);
    // check sku
    expect(new BigNumber(productFetchedFromFarmer.itemSKU)).to.be.bignumber.equal(`${sku}`);
    expect(new BigNumber(productFetchedFromDistributor.itemSKU)).to.be.bignumber.equal(`${sku}`);
    expect(new BigNumber(productFetchedFromRetailer.itemSKU)).to.be.bignumber.equal(`${sku}`);
    expect(new BigNumber(productFetchedFromConsumer.itemSKU)).to.be.bignumber.equal(`${sku}`);
    // check upc
    expect(new BigNumber(productFetchedFromFarmer.itemUPC)).to.be.bignumber.equal(`${upc}`);
    expect(new BigNumber(productFetchedFromDistributor.itemUPC)).to.be.bignumber.equal(`${upc}`);
    expect(new BigNumber(productFetchedFromRetailer.itemUPC)).to.be.bignumber.equal(`${upc}`);
    expect(new BigNumber(productFetchedFromConsumer.itemUPC)).to.be.bignumber.equal(`${upc}`);
    // check ownerId
    expect(productFetchedFromFarmer.ownerID).to.be.equal(consumerID);
    expect(productFetchedFromDistributor.ownerID).to.be.equal(consumerID);
    expect(productFetchedFromRetailer.ownerID).to.be.equal(consumerID);
    expect(productFetchedFromConsumer.ownerID).to.be.equal(consumerID);
    // originFarmerID
    expect(productFetchedFromFarmer.originFarmerID).to.be.equal(originFarmerID);
    expect(productFetchedFromDistributor.originFarmerID).to.be.equal(originFarmerID);
    expect(productFetchedFromRetailer.originFarmerID).to.be.equal(originFarmerID);
    expect(productFetchedFromConsumer.originFarmerID).to.be.equal(originFarmerID);
    // originFarmName
    expect(productFetchedFromFarmer.originFarmName).to.be.equal(originFarmName);
    expect(productFetchedFromDistributor.originFarmName).to.be.equal(originFarmName);
    expect(productFetchedFromRetailer.originFarmName).to.be.equal(originFarmName);
    expect(productFetchedFromConsumer.originFarmName).to.be.equal(originFarmName);
    // originFarmInformation
    expect(productFetchedFromFarmer.originFarmInformation).to.be.equal(originFarmInformation);
    expect(productFetchedFromDistributor.originFarmInformation).to.be.equal(originFarmInformation);
    expect(productFetchedFromRetailer.originFarmInformation).to.be.equal(originFarmInformation);
    expect(productFetchedFromConsumer.originFarmInformation).to.be.equal(originFarmInformation);
    // originFarmLatitude
    expect(productFetchedFromFarmer.originFarmLatitude).to.be.equal(originFarmLatitude);
    expect(productFetchedFromDistributor.originFarmLatitude).to.be.equal(originFarmLatitude);
    expect(productFetchedFromRetailer.originFarmLatitude).to.be.equal(originFarmLatitude);
    expect(productFetchedFromConsumer.originFarmLatitude).to.be.equal(originFarmLatitude);
    // originFarmLongitude
    expect(productFetchedFromFarmer.originFarmLongitude).to.be.equal(originFarmLongitude);
    expect(productFetchedFromDistributor.originFarmLongitude).to.be.equal(originFarmLongitude);
    expect(productFetchedFromRetailer.originFarmLongitude).to.be.equal(originFarmLongitude);
    expect(productFetchedFromConsumer.originFarmLongitude).to.be.equal(originFarmLongitude);
  });

  it("Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain", async () => {
    const supplyChain = await SupplyChain.deployed();

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const productFetchedFromFarmer = await supplyChain.fetchItemBufferTwo(upc, {
      from: originFarmerID,
    });
    const productFetchedFromDistributor = await supplyChain.fetchItemBufferTwo(
      upc,
      {
        from: distributorID,
      }
    );
    const productFetchedFromRetailer = await supplyChain.fetchItemBufferTwo(
      upc,
      {
        from: retailerID,
      }
    );

    const productFetchedFromConsumer = await supplyChain.fetchItemBufferTwo(
      upc,
      {
        from: consumerID,
      }
    );
    const mandatoryKeys = [
      "itemSKU",
      "itemUPC",
      "productID",
      "productNotes",
      "productPrice",
      "itemState",
      "distributorID",
      "retailerID",
      "consumerID",
      "farmerDocumentId"
    ];
    
    // Verify the result set:
    assert.hasAnyKeys(productFetchedFromFarmer, mandatoryKeys);
    assert.hasAnyKeys(productFetchedFromDistributor, mandatoryKeys);
    assert.hasAnyKeys(productFetchedFromRetailer, mandatoryKeys);
    assert.hasAnyKeys(productFetchedFromConsumer, mandatoryKeys);

    // check sku
    expect(new BigNumber(productFetchedFromFarmer.itemSKU)).to.be.bignumber.equal(`${sku}`);
    expect(new BigNumber(productFetchedFromDistributor.itemSKU)).to.be.bignumber.equal(`${sku}`);
    expect(new BigNumber(productFetchedFromRetailer.itemSKU)).to.be.bignumber.equal(`${sku}`);
    expect(new BigNumber(productFetchedFromConsumer.itemSKU)).to.be.bignumber.equal(`${sku}`);
    // check upc
    expect(new BigNumber(productFetchedFromFarmer.itemUPC)).to.be.bignumber.equal(`${upc}`);
    expect(new BigNumber(productFetchedFromDistributor.itemUPC)).to.be.bignumber.equal(`${upc}`);
    expect(new BigNumber(productFetchedFromRetailer.itemUPC)).to.be.bignumber.equal(`${upc}`);
    expect(new BigNumber(productFetchedFromConsumer.itemUPC)).to.be.bignumber.equal(`${upc}`);
    // productID
    expect(new BigNumber(productFetchedFromFarmer.productID)).to.be.bignumber.equal(`${productID}`);
    expect(new BigNumber(productFetchedFromDistributor.productID)).to.be.bignumber.equal(`${productID}`);
    expect(new BigNumber(productFetchedFromRetailer.productID)).to.be.bignumber.equal(`${productID}`);
    expect(new BigNumber(productFetchedFromConsumer.productID)).to.be.bignumber.equal(`${productID}`);
    // productNotes
    expect(productFetchedFromFarmer.productNotes).to.be.equal(`${productNotes}`);
    expect(productFetchedFromDistributor.productNotes).to.equal(`${productNotes}`);
    expect(productFetchedFromRetailer.productNotes).to.be.equal(`${productNotes}`);
    expect(productFetchedFromConsumer.productNotes).to.be.equal(`${productNotes}`);
    // productPrice
    expect(new BigNumber(productFetchedFromFarmer.productPrice)).to.be.bignumber.equal(`${productPrice}`);
    expect(new BigNumber(productFetchedFromDistributor.productPrice)).to.be.bignumber.equal(`${productPrice}`);
    expect(new BigNumber(productFetchedFromRetailer.productPrice)).to.be.bignumber.equal(`${productPrice}`);
    expect(new BigNumber(productFetchedFromConsumer.productPrice)).to.be.bignumber.equal(`${productPrice}`);
    // itemState
    expect(new BigNumber(productFetchedFromFarmer.itemState)).to.be.bignumber.equal(`${7}`);
    expect(new BigNumber(productFetchedFromDistributor.itemState)).to.be.bignumber.equal(`${7}`);
    expect(new BigNumber(productFetchedFromRetailer.itemState)).to.be.bignumber.equal(`${7}`);
    expect(new BigNumber(productFetchedFromConsumer.itemState)).to.be.bignumber.equal(`${7}`);
    // distributorID
    expect(productFetchedFromFarmer.distributorID).to.be.equal(`${distributorID}`);
    expect(productFetchedFromDistributor.distributorID).to.equal(`${distributorID}`);
    expect(productFetchedFromRetailer.distributorID).to.be.equal(`${distributorID}`);
    expect(productFetchedFromConsumer.distributorID).to.be.equal(`${distributorID}`);
    // retailerID
    expect(productFetchedFromFarmer.retailerID).to.be.equal(`${retailerID}`);
    expect(productFetchedFromDistributor.retailerID).to.equal(`${retailerID}`);
    expect(productFetchedFromRetailer.retailerID).to.be.equal(`${retailerID}`);
    expect(productFetchedFromConsumer.retailerID).to.be.equal(`${retailerID}`);
    // consumerID
    expect(productFetchedFromFarmer.consumerID).to.be.equal(`${consumerID}`);
    expect(productFetchedFromDistributor.consumerID).to.equal(`${consumerID}`);
    expect(productFetchedFromRetailer.consumerID).to.be.equal(`${consumerID}`);
    expect(productFetchedFromConsumer.consumerID).to.be.equal(`${consumerID}`);
    // farmerDocumentID
    expect(productFetchedFromFarmer.farmerDocumentID).to.be.equal(`${farmerDocumentId}`);
    expect(productFetchedFromDistributor.farmerDocumentID).to.equal(`${farmerDocumentId}`);
    expect(productFetchedFromRetailer.farmerDocumentID).to.be.equal(`${farmerDocumentId}`);
    expect(productFetchedFromConsumer.farmerDocumentID).to.be.equal(`${farmerDocumentId}`);
  });

  it("test the consistence of the log of event for a specific product", async ()=>{
    const supplyChain = await SupplyChain.deployed()
    // 1 harvested product
    await supplyChain.harvestItem(
      upc + 1,
      originFarmerID,
      originFarmName,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      productNotes,
      farmerDocumentId,
      { from: originFarmerID }
    );

    // 2 processed product
    await supplyChain.processItem(upc+1, {from : originFarmerID})
    // 3 packed product
    await supplyChain.packItem(upc+1, {from : originFarmerID})
    // 4 ForSale product
    await supplyChain.sellItem(upc+1, productPrice, {from : originFarmerID})
    // 5 sold product
    await supplyChain.buyItem(upc+1, {from: distributorID, value: productPrice})
    // 6 shipped product
    await supplyChain.shipItem(upc+1, {from: distributorID})
    // 7 received product
    await supplyChain.receiveItem(upc+1, {from: retailerID})
    // 8 purchased product
    await supplyChain.purchaseItem(upc+1, {from: consumerID});


    const eventsLog = await supplyChain.getPastEvents('allEvents', {fromBlock: 0, filter: {upc: upc+1}});

  });
});
