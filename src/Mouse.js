export default class Mouse {

  constructor() {
    this.x = 0;
    this.y = 0;

    window.addEventListener('mousemove', (event) => {
      this.x = event.pageX;
      this.y = event.pageY;

      if (this._moveHandler) {
        this._moveHandler(this.x, this.y);
      }
    });

    window.addEventListener('touchmove', (event) => {
      event.preventDefault();

      this.x = event.changedTouches[0].pageX;
      this.y = event.changedTouches[0].pageY;

      if (this._moveHandler) {
        this._moveHandler(this.x, this.y);
      }
    });
  }

  setMoveHandler(handler) {
    this._moveHandler = handler;
  }

}