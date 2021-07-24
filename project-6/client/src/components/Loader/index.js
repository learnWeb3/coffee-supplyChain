import Base from "../Base";

class Loader extends Base {
  constructor(parentElement, id, color, message=null) {
    super(parentElement, id);
    this.color = color;
    this.message = message;
    this.previousContent = this.jquery(this.parentElement).html();
    this.render();
  }

  unmount() {
    this.jquery("#" + this.id).remove();
    this.jquery(this.parentElement).html(this.previousContent);
  }

  render() {
    this.jquery(this.parentElement).html(
      `<div id=${this.id} class="spinner-border text-${this.color} mx-auto" role="status">
      </div>`
    );

  }
}

export default Loader;
