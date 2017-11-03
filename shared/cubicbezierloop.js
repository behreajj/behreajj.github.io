'use strict';

class CubicBezierLoop extends CubicBezierSpline {
  constructor(pts = [
    Vector.random(),
    Vector.random(),
    Vector.random(),
    Vector.random()
  ]) {
    super(pts);
    if (this._curves.length > 1) {
      this.matchAnchorPointsForward();
      this.mirrorControlPointsForward();
    } else {
      // TODO Deal with edge case where loop is
      // only 1 curve long.
    }
  }

  // TODO Refactor.
  // @Override
  adjust(curveIndex, pointIndex,
    x, y, z,
    cpforward = CubicBezierSpline.alignControlPoint0,
    cpbackward = CubicBezierSpline.alignControlPoint1,
    apforward = cpforward,
    apbackward = cpbackward) {

    this._curves[curveIndex].adjust(pointIndex, x, y, z);

    const sz = this._curves.length;
    const backwardCurveIndex = curveIndex === 0 ? sz - 1 : curveIndex - 1;
    const forwardCurveIndex = curveIndex === sz - 1 ? 0 : curveIndex + 1;

    if (pointIndex === CubicBezierCurve.pointLayout.AnchorPoint0) {
      this.matchAnchorPoint1(curveIndex, backwardCurveIndex);
      if (apbackward) {
        apbackward(this._curves, curveIndex, backwardCurveIndex);
      }
    } else if (cpbackward && pointIndex === CubicBezierCurve.pointLayout.ControlPoint0) {
      cpbackward(this._curves, curveIndex, backwardCurveIndex);
    } else if (cpforward && pointIndex === CubicBezierCurve.pointLayout.ControlPoint1) {
      cpforward(this._curves, curveIndex, forwardCurveIndex);
    } else if (pointIndex === CubicBezierCurve.pointLayout.AnchorPoint1) {
      this.matchAnchorPoint0(curveIndex, forwardCurveIndex);
      if (apforward) {
        apforward(this._curves, curveIndex, forwardCurveIndex);
      }
    }
  }

  alignControlPointsBackward() {
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      this.alignControlPoint1(i == sz - 1 ? 0 : i + 1, i);
    }
  }

  alignControlPointsForward() {
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      this.alignControlPoint0(i == 0 ? sz - 1 : i - 1, i);
    }
  }

  /** @override */
  drawPointLabels2d(ctx, curreditpoint, curreditcurve) {
    let sz = this._curves.length;
    let sz2 = this.getPointCount();

    let j = 0;
    let clr = '#007fff';
    let curveemph = curreditcurve === 0;
    let emphasize = (curveemph && curreditpoint === 0) ||
      (curreditcurve === (sz - 1) && curreditpoint === 3);
    CubicBezier.drawPointLabel2d(ctx, 0, this._curves[0]._ap0, emphasize, clr);

    for (let i = 0, j = 0; i < sz; ++i) {
      let curve = this._curves[i];
      curveemph = curreditcurve === i;

      clr = '#ff007f';
      emphasize = curveemph && curreditpoint === 1;
      CubicBezier.drawPointLabel2d(ctx, ++j, curve._cp0, emphasize, clr);

      clr = '#7f00ff';
      emphasize = curveemph && curreditpoint === 2;
      CubicBezier.drawPointLabel2d(ctx, ++j, curve._cp1, emphasize, clr);

      if (i == sz - 1) {
        break;
      }

      clr = '#007fff';
      emphasize = (curveemph && curreditpoint === 3) ||
        (curreditcurve === (i + 1) && curreditpoint === 0);
      CubicBezier.drawPointLabel2d(ctx, ++j, curve._ap1, emphasize, clr);
    }
  }

  /** @override */
  matchAnchorPointsBackward() {
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      this.matchAnchorPoint1(i == sz - 1 ? 0 : i + 1, i);
    }
  }

  /** @override */
  matchAnchorPointsForward() {
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      this.matchAnchorPoint0(i == 0 ? sz - 1 : i - 1, i);
    }
  }

  /** @override */
  mirrorControlPointsBackward() {
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      this.mirrorControlPoint1(i == sz - 1 ? 0 : i + 1, i);
    }
  }

  /** @override */
  mirrorControlPointsForward() {
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      this.mirrorControlPoint0(i == 0 ? sz - 1 : i - 1, i);
    }
  }

  /** @override */
  to1DArray() {
    let result = [this._curves[0].ap0];
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      let c = this._curves[i];
      result.push(c.cp0);
      result.push(c.cp1);
      if (i < sz - 1) {
        result.push(c.ap1);
      }
    }
    return result;
  }

  /** @override */
  to2DArray() {
    let result = [this._curves[0].ap0.toArray()];
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      let c = this._curves[i];
      result.push(c.cp0.toArray());
      result.push(c.cp1.toArray());
      if (i < sz - 1) {
        result.push(c.ap1.toArray());
      }
    }
    return result;
  }

  /** @override */
  toString(pr = 2) {
    let result = '[' + this._curves[0].ap0.toString(pr);
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      let c = this._curves[i];
      result += c.cp0.toString(pr);
      result += c.cp1.toString(pr);
      if (i < sz - 1) {
        result += c.ap1.toString(pr);
      }
    }
    result += ']';
    return result;
  }
}
