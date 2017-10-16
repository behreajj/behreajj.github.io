'use strict';

class ColorStop {
  constructor(prc, clr) {
    this.percent = prc;
    this.color = clr;
  }

  get percent() {
    return this._percent;
  }

  set percent(v) {
    this._percent = v < 0 ? 0 : v > 1 ? 1 : v;
  }

  get color() {
    return this._color;
  }

  set color(v) {
    this._color = v;
  }

  approx(cs, tolerance = Number.EPSILON) {
    return Math.abs(this._percent - cs.percent) < tolerance;
  }

  compareTo(cs) {
    return this._percent > cs.percent ? 1 :
      this._percent < cs.percent ? -1 : 0;
  }
}
