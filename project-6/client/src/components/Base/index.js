import $ from "jquery";

class Base {
  constructor(parentElement, id) {
    this.parentElement = parentElement;
    this.id = id;
    this.jquery = $;
  }

  // remove events between renders
  unmount() {
    this.jquery("#" + this.id).remove();
    this.jquery(window).off("click");
  }
}

export default Base;
