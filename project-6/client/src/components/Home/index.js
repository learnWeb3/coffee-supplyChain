import Base from "../Base";
import navigateTo from "../Router/index";
import Loader from "../Loader";
import Alert from "../Alert/index";

class Home extends Base {
  constructor(parentElement, id, contract, currentAddress) {
    super(parentElement, id);
    this.contract = contract;
    this.currentAddress = currentAddress.toLowerCase();
    this.alert = { type: null, message: null };
    this.render();
  }

  // initialize blockchain websocket event listeners
  initBlockchainEvents() {
    this.contract.events
      .Harvested()
      .on("connected", () => {
        console.log("listening to Harvested events");
      })
      .on("data", () => {
        this.render();
      })
      .on("error", function (error) {
        this.initBlockchainEvents();
      });

    this.contract.events
      .Processed()
      .on("connected", () => {
        console.log("listening to Processed events");
      })
      .on("data", () => {
        this.render();
      })
      .on("error", function (error) {
        this.initBlockchainEvents();
      });

    this.contract.events
      .Packed()
      .on("connected", () => {
        console.log("listening to Packed events");
      })
      .on("data", () => {
        this.render();
      })
      .on("error", function (error) {
        this.initBlockchainEvents();
      });

    this.contract.events
      .ForSale()
      .on("connected", () => {
        console.log("listening to ForSale events");
      })
      .on("data", () => {
        this.render();
      })
      .on("error", function (error) {
        this.initBlockchainEvents();
      });

    this.contract.events
      .Sold()
      .on("connected", () => {
        console.log("listening to Sold events");
      })
      .on("data", () => {
        this.render();
      })
      .on("error", function (error) {
        this.initBlockchainEvents();
      });

    this.contract.events
      .Shipped()
      .on("connected", () => {
        console.log("listening to Shipped events");
      })
      .on("data", () => {
        this.render();
      })
      .on("error", function (error) {
        this.initBlockchainEvents();
      });

    this.contract.events
      .Received()
      .on("connected", () => {
        console.log("listening to Received events");
      })
      .on("data", () => {
        this.render();
      })
      .on("error", function (error) {
        this.initBlockchainEvents();
      });

    this.contract.events
      .Purchased()
      .on("connected", () => {
        console.log("listening to Purchased events");
      })
      .on("data", () => {
        this.render();
      })
      .on("error", function (error) {
        this.initBlockchainEvents();
      });
  }

  // format timestamps to string date
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);

    return `${date.getDate()}/${
      date.getMonth() + 1
    }/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;
  }

  // get current latitude and longitude
  getCoordinates() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.jquery("#latitude").val(position.coords.latitude);
        this.jquery("#longitude").val(position.coords.longitude);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  // get the account type to display action accordingly
  async getAccountTypes() {
    return await this.contract.methods
      .getAccountTypes()
      .call({ from: this.currentAddress });
  }

  // get timestamp of a specific event on the blockchain
  async getEvent(eventType, itemUPC) {
    const events = await this.contract.getPastEvents(eventType, {
      fromBlock: 0,
      filter: { upc: parseInt(itemUPC) },
    });
    if (events.length > 0) {
      const blockNumber = events[0].blockNumber;
      const blockDetails = await this.contract.eth.getBlock(blockNumber);
      return {
        timestamp: blockDetails.timestamp * 1000,
        txHash: events[0].transactionHash,
      };
    } else {
      return { timestamp: null, txHash: null };
    }
  }

  // get all the items created by farmers
  async getItems() {
    const self = this;
    const sku = await this.contract.methods
      .sku()
      .call({ from: this.currentAddress })
      .then((_sku) => parseInt(_sku));

    if (sku > 0) {
      const skus = Array.from(Array(sku).keys()).filter((item) => item > 0);
      return await Promise.all(
        skus.map(async (_sku) => {
          const item = await this.getItemDetails(_sku);
          const { timestamp: harvestTimestamp, txHash } = await self.getEvent(
            "Harvested",
            item.itemUPC
          );
          return {
            ...item,
            harvestTimestamp,
            txHash,
          };
        })
      );
    } else {
      return [];
    }
  }

  // change daashboard avatar icon according to accountTypes
  updateAvatar(accountTypes) {
    const { isFarmer, isDistributor, isRetailer, isConsumer } = accountTypes;
    const mappingAccountTypeToIcon = {
      farmer: "fas fa-tractor",
      distributor: "fas fa-shopping-cart",
      retailer: "fas fa-shopping-basket",
      consumer: "fas fa-user",
    };

    const currentAccountType = isFarmer
      ? "farmer"
      : isDistributor
      ? "distributor"
      : isRetailer
      ? "retailer"
      : "consumer";

    this.jquery("#avatar").addClass(
      mappingAccountTypeToIcon[currentAccountType]
    );
  }

  // get items and account types
  async getData() {
    const accountTypes = await this.getAccountTypes().then((_accountTypes) => ({
      isFarmer: _accountTypes[0],
      isDistributor: _accountTypes[1],
      isRetailer: _accountTypes[2],
      isConsumer: _accountTypes[3],
    }));
    const items = await this.getItems();
    return {
      accountTypes,
      items,
    };
  }

  // extract events for a specific item on modal
  async extractEvents(itemUPC) {
    const eventTypes = [
      "Harvested",
      "Processed",
      "Packed",
      "ForSale",
      "Sold",
      "Shipped",
      "Received",
      "Purchased",
    ];
    return await Promise.all(
      eventTypes.map(async (eventType) => {
        const { timestamp: eventTimestamp, txHash } = await this.getEvent(
          eventType,
          itemUPC
        );
        return {
          eventType,
          eventTimestamp,
          txHash,
        };
      })
    );
  }

  // get item details to be displayed on modal
  async getItemDetails(_sku) {
    const bufferOne = await this.contract.methods
      .fetchItemBufferOne(_sku)
      .call({ from: this.currentAddress });
    const bufferTwo = await this.contract.methods
      .fetchItemBufferTwo(_sku)
      .call({ from: this.currentAddress });
    const events = await this.extractEvents(bufferOne.itemUPC);
    return { ...bufferOne, ...bufferTwo, events };
  }

  // update modal item informations
  updateItemDetails(itemDetails) {
    const {
      consumerID,
      distributorID,
      itemSKU,
      itemState,
      itemUPC,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      originFarmName,
      originFarmerID,
      ownerID,
      productID,
      productNotes,
      productPrice,
      farmerDocumentID,
    } = itemDetails;

    farmerDocumentID !== "" &&
      this.jquery("#uploadedDocuments").html(
        `<a href="https://gateway.pinata.cloud/ipfs/${farmerDocumentID}">See farmer document</a>`
      );
    this.jquery("#productDetailsLabel").html(`Product ${itemUPC}`);
    this.jquery("#productCurrentOwner").val(ownerID);
    this.jquery("#productItemCode").val(`${itemSKU}`);
    this.jquery("#productFarmerId").val(originFarmerID);
    this.jquery("#productFarmName").val(originFarmName);
    this.jquery("#productLatitude").val(originFarmLatitude);
    this.jquery("#productLongitude").val(originFarmLongitude);
    this.jquery("#productState").val(parseInt(itemState));
  }

  // update modal item history
  updateItemSteps(itemDetails) {
    let { itemState, events } = itemDetails;
    const mappingEventNameToEventElement = {
      Harvested: "#harvestStep",
      Processed: "#processedStep",
      Packed: "#packedStep",
      ForSale: "#forSaleStep",
      Sold: "#soldStep",
      Shipped: "#shippedStep",
      Received: "#receivedStep",
      Purchased: "#purchasedStep",
    };
    itemState = parseInt(itemState);
    events.map((event) => {
      if (event.eventTimestamp && event.txHash) {
        const tdElement = this.jquery(
          mappingEventNameToEventElement[event.eventType]
        ).parent("td");
        const stepDateElement = tdElement.siblings(".stepDate");
        const txHashElement = tdElement.siblings(".txHash");
        this.jquery(stepDateElement).html(
          this.formatTimestamp(event.eventTimestamp)
        );
        this.jquery(txHashElement).html(
          `<a href="https://rinkeby.etherscan.io/tx/${event.txHash}">view details</a>`
        );
      }
    });
    itemState >= 0 && this.jquery("#harvestStep").addClass("completed");
    itemState >= 1 && this.jquery("#processedStep").addClass("completed");
    itemState >= 2 && this.jquery("#packedStep").addClass("completed");
    itemState >= 3 && this.jquery("#forSaleStep").addClass("completed");
    itemState >= 4 && this.jquery("#soldStep").addClass("completed");
    itemState >= 5 && this.jquery("#shippedStep").addClass("completed");
    itemState >= 6 && this.jquery("#receivedStep").addClass("completed");
    itemState >= 7 && this.jquery("#purchasedStep").addClass("completed");
  }

  // udpate user available actions on modal product
  updateAvailableActions(itemDetails, currentAddress) {
    let { itemState, originFarmerID } = itemDetails;

    itemState = parseInt(itemState);
    originFarmerID = originFarmerID.toLowerCase();

    this.jquery("#processItem")?.attr(
      "disabled",
      currentAddress === originFarmerID && itemState === 0 ? false : true
    );
    this.jquery("#packItem")?.attr(
      "disabled",
      currentAddress === originFarmerID && itemState === 1 ? false : true
    );
    this.jquery("#sellItem")?.attr(
      "disabled",
      currentAddress === originFarmerID && itemState === 2 ? false : true
    );
    this.jquery("#buyItem")?.attr("disabled", itemState === 3 ? false : true);
    this.jquery("#shipItem")?.attr("disabled", itemState === 4 ? false : true);
    this.jquery("#receiveItem")?.attr(
      "disabled",
      itemState == 5 ? false : true
    );
    this.jquery("#purchaseItem")?.attr(
      "disabled",
      itemState == 6 ? false : true
    );
  }

  // activate listener for actions on click on modal product
  makeAction(itemDetails) {
    const self = this;
    const mappingIdToAction = {
      processItem: async ({ upc }) => {
        await this.contract.methods
          .processItem(upc)
          .send({ from: this.currentAddress });
        this.alert = {
          type: "success",
          message: "item has been processed successfully",
        };
      },
      packItem: async ({ upc }) => {
        await this.contract.methods
          .packItem(upc)
          .send({ from: this.currentAddress });
        this.alert = {
          type: "success",
          message: "item has been packed successfully",
        };
      },
      sellItem: async ({ upc, price }) => {
        await this.contract.methods
          .sellItem(upc, price)
          .send({ from: this.currentAddress });
        this.alert = {
          type: "success",
          message: "item is now available for distributors",
        };
      },
      buyItem: async ({ upc, value }) => {
        await this.contract.methods
          .buyItem(upc)
          .send({ from: this.currentAddress, value: value });
        this.alert = {
          type: "success",
          message: "item has been bought successfully",
        };
      },
      shipItem: async ({ upc }) => {
        await this.contract.methods
          .shipItem(upc)
          .send({ from: this.currentAddress });
        this.alert = {
          type: "success",
          message: "item has been shipped successfully",
        };
      },
      receiveItem: async ({ upc }) =>
        await this.contract.methods
          .receiveItem(upc)
          .send({ from: this.currentAddress }),
      purchaseItem: async () => {
        await this.contract.methods
          .purchaseItem(upc)
          .send({ from: this.currentAddress });
        this.alert = {
          type: "success",
          message: "item has been purchased successfully",
        };
      },
    };
    this.jquery(window).on("click", async function (event) {
      if (mappingIdToAction[event.target.id]) {
        event.preventDefault();
        const upc = parseInt(itemDetails.itemUPC);
        const value = parseInt(itemDetails.productPrice);
        const price = parseInt(self.jquery("#itemPrice").val());
        new Loader("#productDetails .modal-dialog", "loader", "white");
        new Alert(
          "#productDetails .modal-dialog",
          "alert",
          "light",
          "We are processing your transaction, please confirm your action on the Metamask wallet extension",
          false
        );
        await mappingIdToAction[event.target.id]({ upc, value, price });
        // re render the all page
        self.render();
      }
    });
  }

  // toogle the modal on click of item
  async showModalProduct() {
    const self = this;
    self.jquery(".modalProductToogler").on("click", async function (event) {
      event.preventDefault();
      const itemDetails = await self.getItemDetails(
        event.target.dataset.productid
      );

      self.updateItemDetails(itemDetails);
      self.updateItemSteps(itemDetails);
      self.updateAvailableActions(itemDetails, self.currentAddress);
      self.makeAction(itemDetails);

      var myModal = new bootstrap.Modal(
        document.getElementById("productDetails"),
        {
          keyboard: false,
        }
      );
      myModal.show();
    });
  }

  // approve file type
  approveFileType(file) {
    const approvedFileTypes = ["application/pdf", "application/text"];
    return approvedFileTypes.includes(file.type);
  }

  // upload and pin a document on IPFS iusing pinata gateway
  async uploadDocumentToIPFS() {
    const formData = new FormData();
    const files = Array.from(document.querySelector("#document").files);
    if (files.length > 0) {
      if (this.approveFileType(files[0])) {
        formData.set("document", files[0]);
        const { IpfsHash } = await fetch("http://localhost:3000/upload", {
          method: "POST",
          body: formData,
        }).then((response) => response.json());
        return IpfsHash;
      } else {
        new Alert(
          "#alert-container",
          "alert",
          "danger",
          "File type is not approved"
        );
      }
    } else {
      return "";
    }
  }

  // create a new item in the smart contract
  async harvestItem(accountTypes) {
    const self = this;
    if (accountTypes.isFarmer) {
      self.jquery("#newItem").on("click", async function (event) {
        event.preventDefault();
        // getting form data
        const productCode = self.jquery("#productCode").val();
        const farmerId = self.jquery("#farmerId").val();
        const farmName = self.jquery("#farmName").val();
        const farmInformation = self.jquery("#farmInfos").val();
        const latitude = self.jquery("#latitude").val();
        const longitude = self.jquery("#longitude").val();
        const comments = self.jquery("#comments").val();
        if (
          productCode !== "" &&
          farmerId !== "" &&
          farmName !== "" &&
          farmInformation !== "" &&
          latitude !== "" &&
          longitude !== "" &&
          comments !== ""
        ) {
          const loader = new Loader("#newItem", "loader", "white");
          let farmerDocumentID;
          // uploading a document to IPFS if document is present
          try {
            farmerDocumentID = await self.uploadDocumentToIPFS();
          } catch (error) {
            console.log(error)
            loader.unmount();
            new Alert(
              "#alert-container",
              "alert",
              "danger",
              "Error while uploading your document"
            );
          }
          // calling smart contract method to harvest new item
          await self.contract.methods
            .harvestItem(
              parseInt(productCode),
              farmerId,
              farmName,
              farmInformation,
              latitude,
              longitude,
              comments,
              farmerDocumentID
            )
            .send({ from: self.currentAddress });
          // re render the all page
          //self.render();
        } else {
          new Alert(
            "#alert-container",
            "alert",
            "danger",
            "Please fill out all required fields before submitting the form"
          );
        }
      });
    }
  }

  // redirect to register page
  register() {
    this.jquery("#register").on("click", function (event) {
      event.preventDefault();
      navigateTo("/sign");
    });
  }

  // format the account type as a string  to be displayed on top of the main screen
  getAccountTypesLabel(accountTypes) {
    const { isFarmer, isDistributor, isRetailer, isConsumer } = accountTypes;
    return isFarmer
      ? "Farmer"
      : isDistributor
      ? "Distributor"
      : isRetailer
      ? "Retailer"
      : isConsumer
      ? "Consumer"
      : "";
  }

  // initialize events for the page
  async initEvents(accountTypes) {
    this.harvestItem(accountTypes);
    this.showModalProduct();
  }

  // rendering html string template
  async render() {
    this.unmount();
    const { items, accountTypes } = await this.getData();
    // const {lat, lon} = await this.getCoordinates();
    this.jquery(this.parentElement).html(
      `<main id="${
        this.id
      }" class="col-12 col-lg-6 offset-lg-3 p-2" style="min-height: 100vh;">
        <div class="d-flex align-items-center">
            <div class="avatar"><i id="avatar" class=""></i></div>
            <h1 class="text-left my-4">${this.getAccountTypesLabel(
              accountTypes
            )} Panel</h1>
        </div>

        <div class="alert alert-info my-4" role="alert">
            Welcome to your dashboard !! Please click on the product identifier in order to acces the product's history, details and currently available actions according to your account role
          </div>
     
      <section class="col-12 py-4" style="display: block; overflow: auto;">
        <h5 class="text-muted mb-4">Current items</h5>
        <table id="currentProducts" class="table table-hover">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">harvest date</th>
              <th scope="col">harvested</th>
              <th scope="col">processed</th>
              <th scope="col">packed</th>
              <th scope="col">for sale</th>
              <th scope="col">sold</th>
              <th scope="col">shipped</th>
              <th scope="col">received</th>
              <th scope="col">purchased</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(
              (item) => `<tr>
              <th scope="row">
                <button
                  type="button"
                  class="btn-0 modalProductToogler"
                  data-productId="${item.itemUPC}"
                >
                  ${item.itemUPC}
                </button>
              </th>
              <td>${this.formatTimestamp(item.harvestTimestamp)}</td>
              <td>${parseInt(item.itemState) >= 0 ? "&checkmark;" : ""}</td>
              <td>${parseInt(item.itemState) > 0 ? "&checkmark;" : ""}</td>
              <td>${parseInt(item.itemState) > 1 ? "&checkmark;" : ""}</td>
              <td>${parseInt(item.itemState) > 2 ? "&checkmark;" : ""}</td>
              <td>${parseInt(item.itemState) > 3 ? "&checkmark;" : ""}</td>
              <td>${parseInt(item.itemState) > 4 ? "&checkmark;" : ""}</td>
              <td>${parseInt(item.itemState) > 5 ? "&checkmark;" : ""}</td>
              <td>${parseInt(item.itemState) > 6 ? "&checkmark;" : ""}</td>
            </tr>`
            )}
            ${
              items.length === 0
                ? `<tr>
              <td colspan="10">Nothing just yet</td>
            </tr>`
                : ""
            }
          </tbody>
        </table>
      </section>

      ${
        accountTypes.isFarmer
          ? `<section class="col-12 py-4">
      <h5 class="text-muted mb-4">Available action</h5>
      <div class="row">

          <div class="col-12 bg-light p-4 ">
  
            <h4>Harvest new item</h4>
      
            <form id="newItemForm">

              <span class="small">(*) required fields</span>

              <div class="form-group my-2">
                  <label for="productCode">Product code *</label>
                  <input id="productCode" type="text" class="form-control" value="" required>
              </div>
  
              <div class="form-group my-2">
                  <label for="farmerId">Farmer network identifier *</label>
                  <input id="farmerId" type="text" class="form-control" value="${this.currentAddress}" required>
              </div>
  
              <div class="form-group my-2">
                  <label for="farmName">Farm name *</label>
                  <input id="farmName" type="text" class="form-control" required>
              </div>

              <div class="form-group my-2">
                <label for="farmInfos">Farm info *</label>
                <input id="farmInfos" type="text" class="form-control" required>
              </div>

              <div class="form-group my-2">
                  <label for="latitude">Latitude *</label>
                  <input id="latitude" type="text" class="form-control" value="" required>
              </div>

              <div class="form-group my-2">
                  <label for="longitude">Longitude *</label>
                  <input id="longitude" type="text" class="form-control" value="" required>
              </div>
              <div class="form-group my-2">
                  <label for="commments">Comments *</label>
                  <textarea id="comments" class="form-control" id="" rows="10" required></textarea>
              </div>

              <div class="form-group my-2">
                <label>Upload a document</label>
                <p class="small my-2">(*) accepted format .txt, .pdf</p>
                <input id="document" type="file" class="form-control">
              </div>
  
              <button id="newItem" type="submit" class="btn btn-md btn-success my-4 col-12 col-lg-4">confirm</button>

            </form>
  
          </div>
      </div>
    </section>`
          : ""
      }
     
    </main>

    <!-- Modal -->
    <div
      class="modal fade"
      id="productDetails"
      tabindex="-1"
      aria-labelledby="productDetailsLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable flex-column justify-content-center">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="productDetailsLabel">Product name</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">

            <div class="col-12 mb-5">
                <h5 class="text-muted mb-4">Current product owner</h5>
                <div class="form-group">
                    <label for="productCurrentOwner">Current owner network identifier</label>
                    <input id="productCurrentOwner" type="text" class="form-control" value="" readonly>
                </div>
            </div>

            <hr>

            <div class="col-12 mb-5">
                <h5 class="text-muted mb-4">General informations</h5>
                <div class="form-group">
                    <label for="productItemCode">Product code</label>
                    <input id="productItemCode" type="text" class="form-control" value="" readonly>
                </div>
            
                <div class="form-group">
                    <label for="productFarmerId">Farmer network identifier</label>
                    <input id="productFarmerId" type="text" class="form-control" value="" readonly>
                </div>
    
                <div class="form-group">
                    <label for="productFarmName">Farm name</label>
                    <input id="productFarmName" type="text" class="form-control" value="" readonly>
                </div>

                <div class="form-group">
                    <label for="productLatitude">Latitude</label>
                    <input id="productLatitude" type="text" class="form-control" value="" readonly>
                </div>

                <div class="form-group">
                    <label for="productLongitude">Longitude</label>
                    <input id="productLongitude" type="text" class="form-control" value="" readonly>
                </div>
            </div>

            <hr>

              <div class="col-12 mb-5">
              <h5 class="text-muted mb-4">Documents</h5>
              <div class="col-12" id="uploadedDocuments">
                  <p>Farmer has not uploaded any document</p>
              </div>
            </div>

            <hr>

            <div class="col-12 mb-5">
            <h5 class="text-muted mb-4">Product history</h5>
            <table id="currentProduct" class="table table-borderless align-middle table-responsive">
                <tbody>
                  <tr>
                    <td><div class="step-circle" id="harvestStep"></div></td>
                    <td>Harvested</td>
                    <td class="stepDate"></td>
                    <td class="txHash"></td>
                  </tr>
                  <tr>
                    <td><div class="step-circle" id="processedStep"></div></td>
                    <td>Processed</td>
                    <td class="stepDate"></td>
                    <td class="txHash"></td>
                  </tr>
                  <tr>
                    <td><div class="step-circle" id="packedStep"></div></td>
                    <td>Packed</td>
                    <td class="stepDate"></td>
                    <td class="txHash"></td>
                  </tr>
                  <tr>
                    <td><div class="step-circle" id="forSaleStep"></div></td>
                    <td>ForSale</td>
                    <td class="stepDate"></td>
                    <td class="txHash"></td>
                  </tr>
                  <tr>
                    <td><div class="step-circle" id="soldStep"></div></td>
                    <td>Sold</td>
                    <td class="stepDate"></td>
                    <td class="txHash"></td>
                  </tr>
                  <tr>
                    <td><div class="step-circle" id="shippedStep"></div></td>
                    <td>Shipped</td>
                    <td class="stepDate"></td>
                    <td class="txHash"></td>
                  </tr>
                  <tr>
                    <td><div class="step-circle" id="receivedStep"></div></td>
                    <td>Received</td>
                    <td class="stepDate"></td>
                    <td class="txHash"></td>
                  </tr>
                  <tr>
                  <td><div class="step-circle" id="purchasedStep"></div></td>
                  <td>purchased</td>
                  <td class="stepDate"></td>
                  <td class="txHash"></td>
                </tr>
                </tbody>
              </table>
            </div>    

              <hr>

              <div class="col-12 mb-5">
                <h5 class="text-muted mb-4">Available actions</h5>
                <div class="col-12">
                ${
                  accountTypes.isFarmer
                    ? `<h6 >Sell the product</h5>
                    <div class="form-group">
                        <input type="number" id="itemPrice" placeholder="set a price" class="form-control">
                    </div>
                    <button class="btn btn-md btn-success col-sm-12 col-lg-4 my-4" id="sellItem">CONFIRM</button>
                  </div>

                  <button class="btn btn-md btn-success col-sm-12 col-lg-3 my-2" id="processItem" >PROCESS ITEM</button>
                  <button class="btn btn-md btn-success col-sm-12 col-lg-3 my-2" id="packItem">PACK ITEM</button>`
                    : ""
                }

                ${
                  accountTypes.isDistributor
                    ? ` <button class="btn btn-md btn-success col-sm-12 col-lg-3 my-2" id="shipItem"">SHIP ITEM</button>  
                    <button class="btn btn-md btn-success col-sm-12 col-lg-3 my-2" id="buyItem"">BUY ITEM</button>`
                    : ""
                }
               
                ${
                  accountTypes.isRetailer
                    ? `<button class="btn btn-md btn-success col-sm-12 col-lg-4 my-2" id="receiveItem">MARK ITEM AS RECEIVED</button>`
                    : ""
                }
                ${
                  accountTypes.isConsumer
                    ? `<button class="btn btn-md btn-success col-sm-12 col-lg-3 my-2" id="purchaseItem">PURCHASE ITEM</button>`
                    : ""
                }
                ${
                  !accountTypes.isFarmer &&
                  !accountTypes.isDistributor &&
                  !accountTypes.isRetailer &&
                  !accountTypes.isConsumer
                    ? `<p>Unable to perform action ? <a href="" id="register">Register a new account !</a></p>`
                    : ""
                }
              </div>
          </div>
        </div>
      </div>
    </div>

    <div id="alert-container">
    </div>

    ${
      this.alert.type && this.alert.message
        ? `<div id="flash" class="alert alert-${this.alert?.type} alert-dismissible fade show" role="alert">
        ${this.alert?.message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`
        : ""
    }`
    );

    this.updateAvatar(accountTypes);
    this.getCoordinates();
    this.initEvents(accountTypes);
    this.initBlockchainEvents();
    document.querySelector("body").setAttribute("style", "overflow: auto");
  }
}

export default Home;
