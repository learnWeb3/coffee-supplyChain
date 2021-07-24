import Base from "../Base";
import navigateTo from "../Router";
import signImage from "url:./src/register.png";

class SignPage extends Base {
  constructor(parentElement, id, contract, currentAddress) {
    super(parentElement, id);
    this.contract = contract;
    this.currentAddress = currentAddress;
    this.render();
  }

  _initEvents() {
    this.jquery("#register").on("click", async () => {
      try {
        const selectedAccountType = this.jquery(".btn-check:checked")[0].id;
        const { methods } = this.contract;
        const mapping = {
          farmerAccount: async () =>
            methods
              .addFarmer(this.currentAddress)
              .send({ from: this.currentAddress }),
          distributorAccount: async () =>
            methods
              .addDistributor(this.currentAddress)
              .send({ from: this.currentAddress }),
          retailerAccount: async () =>
            methods
              .addRetailer(this.currentAddress)
              .send({ from: this.currentAddress }),
          consumerAccount: async () =>
            methods
              .addConsumer(this.currentAddress)
              .send({ from: this.currentAddress }),
        };

        await mapping[selectedAccountType]();
        navigateTo("home", this.contract, this.currentAddress);
      } catch (error) {
        console.error(error);
      }
    });
  }


  render() {
    this.jquery(this.parentElement).html(
      `<main
      class="col-sm-12 col-lg-4 offset-lg-4 d-flex align-items-center"
      style="min-height: 100vh"
    >
      <section class="col-sm-12 col-lg-8 offset-lg-2 p-4 mb-lg-5">
        <img src="${signImage}" alt="register" class="img-fluid" />
        <div class="alert alert-info" role="alert">
          No account found, please register
        </div>

        <button
          type="button"
          class="btn btn-lg btn-success col-12"
          data-bs-toggle="modal"
          data-bs-target="#accountTypes"
        >
          REGISTER
        </button>

        <!-- Modal -->
        <div
          class="modal fade"
          id="accountTypes"
          tabindex="-1"
          aria-labelledby="accountTypesLabel"
          aria-hidden="true"
        >
          <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="accountTypesLabel">
                  Choose your account type
                </h5>
                <button
                  type="button"
                  class="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div class="modal-body">
                <div class="btn-group" role="group" aria-label="Basic radio toggle button group">

                  <input type="radio" class="btn-check" name="btnradio" id="farmerAccount" autocomplete="off" checked>
                  <label class="btn btn-lg btn-outline-dark" for="farmerAccount">Farmer</label>
                
                  <input type="radio" class="btn-check" name="btnradio" id="distributorAccount" autocomplete="off">
                  <label class="btn btn-lg btn-outline-dark" for="distributorAccount">Distributor</label>
                
                  <input type="radio" class="btn-check" name="btnradio" id="retailerAccount" autocomplete="off">
                  <label class="btn btn-lg btn-outline-dark" for="retailerAccount">Retailer</label>

                  <input type="radio" class="btn-check" name="btnradio" id="consumerAccount" autocomplete="off">
                  <label class="btn btn-lg btn-outline-dark" for="consumerAccount">Consumer</label>

                </div>
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-danger"
                  data-bs-dismiss="modal"
                >
                  CANCEL
                </button>
                <button id="register" type="button" class="btn btn-lg btn-primary">
                  CONFIRM
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>`
    );

    this._initEvents();
  }
}

export default SignPage;
