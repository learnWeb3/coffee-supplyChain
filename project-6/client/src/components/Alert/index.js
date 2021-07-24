import Base from "../Base";

class Alert extends Base {
  constructor(
    parentElement,
    id,
    type = "success",
    message = null,
    autoUnmount = true
  ) {
    super(parentElement, id);
    this.type = type;
    this.message = message;
    this.autoUnmount = autoUnmount;
    this.render();
  }

  unmount() {
    this.jquery("#" + this.id).remove();
  }

  render() {
    this.jquery(this.parentElement).append(
      `<div id="${this.id}" class="alert alert-${this.type} my-4" role="alert">
        ${this.message}
    </div>`
    );
    if (this.autoUnmount) {
      setTimeout(() => {
        this.unmount();
      }, 3000);
    }
  }
}

export default Alert;
