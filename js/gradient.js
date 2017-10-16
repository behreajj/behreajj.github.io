'use strict';

class Gradient {
  constructor(sts, intr = Gradient.defaultInterpolant) {
    this._stops = sts;
    this._interpolant = intr;

    // Sort the color stops by percent,
    // then remove duplicates.
    if (this._stops.length > 1) {
      this._stops.sort(Gradient.comparator);
      this.removeDuplicates();
    }
  }

  eval(percent) {
    let sz = this._stops.length;
    if (sz === 0) {
      return 0x00000000;
    }
    if (percent <= 0) {
      return this._stops[0].color;
    }
    if (percent >= 1) {
      return this._stops[sz - 1].color;
    }

    let diff;
    let fraction;
    let current;
    let prev;
    for (let i = 0; i < sz; ++i) {
      current = this._stops[i];
      if (percent < current.percent) {
        prev = this._stops[i - 1 < 0 ? 0 : i - 1];
        diff = prev.percent - current.percent;
        fraction = diff === 0 ? 0 :
          (percent - current.percent) / diff;
        return this._interpolant(current.color, prev.color, fraction);
      }
    }
    return this._stops[sz - 1].color;
  }

  removeDuplicates(tolerance = Gradient.defaultTolerance) {
    for (let sz = this._stops.length, i = sz - 1; i > 0; --i) {
      if (this._stops[i].approx(this._stops[i - 1], tolerance)) {
        console.log("Removed color stop");
        this._stops.splice(i);
      }
    }
  }
}

Gradient.defaultInterpolant = ColorUtils.lerpColorCompositeLittleEndian;
Gradient.defaultTolerance = .009;

Gradient.comparator = function(a, b) {
  return a.compareTo(b);
}
