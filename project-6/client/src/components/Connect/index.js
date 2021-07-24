import Base from "../Base";
import metamaskLogo from "url:./src/img/metamask_logo.png";
import coffeeLogo from "url:./src/img/coffe_logo.png";

class Connect extends Base {
  constructor(parentElement, id) {
    super(parentElement, id);
    this.render();
  }

  render() {
    this.jquery(this.parentElement).html(
      `<div id="${this.id}" class="container d-flex align-items-center" style="min-height:100vh">
        <div class="col-12 col-lg-6 offset-lg-3">
            <div class="row mb-5">
                <div class="col d-flex align-items-center">
                    <img src="${metamaskLogo}" class="img-fluid"/>
                </div>
                <div class="col d-flex align-items-center justify-content-center">
                    <i class="fas fa-plus fa-2x"></i>
                </div>
                <div class="col d-flex align-items-center">
                    <img src="${coffeeLogo}" class="img-fluid"/>
                </div>
            </div>
            <div class="alert alert-warning text-center" role="alert">
               Please authorize Metamask to interact with our services
            </div>
        </div>
      </div>`
    );
  }
}

export default Connect;
