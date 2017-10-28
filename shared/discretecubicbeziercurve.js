'use strict';

class DiscreteCubicBezierCurve extends CubicBezierCurve {
  constructor(ap0 = Vector.random(),
    cp0 = Vector.random(),
    cp1 = Vector.random(),
    ap1 = Vector.random(),
    lod = DiscreteCubicBezierCurve.defaultLevelOfDetail) {

    super(ap0, cp0, cp1, ap1);
    this._transforms = this.calcTransforms(lod);
  }

  // TODO Requires testing.
  adjust(pointIndex,
    x, y, z = 0) {
    super.adjust(pointIndex,
      x, y, z);
    this.updateTransforms();
  }

  // drawTransform2d(ctx, i,
  //   tanScale = Matrix.defaultDrawScale,
  //   binormScale = Matrix.defaultDrawScale,
  //   tanLineWidth = Matrix.defaultLineWidth,
  //   binormLineWidth = Matrix.defaultLineWidth,
  //   tanStrokeStyle = Matrix4x4.defaultXAxisColor,
  //   binormStrokeStyle = Matrix4x4.defaultYAxisColor) {
  //   this._transforms[i].draw2d(ctx, tanScale, binormScale, tanLineWidth, binormLineWidth, tanStrokeStyle, binormStrokeStyle);
  // }
  //
  // drawTransforms2d(ctx,
  //   tanScale = Matrix.defaultDrawScale,
  //   binormScale = Matrix.defaultDrawScale,
  //   tanLineWidth = Matrix.defaultLineWidth,
  //   binormLineWidth = Matrix.defaultLineWidth,
  //   tanStrokeStyle = Matrix4x4.defaultXAxisColor,
  //   binormStrokeStyle = Matrix4x4.defaultYAxisColor) {
  //   for (let i = 0, sz = this._transforms.length; i < sz; ++i) {
  //     this._transforms[i].draw2d(ctx, tanScale, binormScale, tanLineWidth, binormLineWidth, tanStrokeStyle, binormStrokeStyle);
  //   }
  // }

  getClass() {
    return this.constructor.name;
  }

  getDetail() {
    return this._transforms.length;
  }

  getBinormal(i) {
    return this._transforms[i].getColAsVector(0);
  }

  getNormal(i) {
    return this._transforms[i].getColAsVector(1);
  }

  getPoint(i) {
    return this._transforms[i].getColAsVector(3);
  }

  getTangent(i) {
    return this._transforms[i].getColAsVector(2);
  }

  getTransform(i) {
    return this._transforms[i].copy();
  }

  toString(pr = 2) {
    let result = '[';
    for(let i = 0, sz = this._transforms.length; i < sz; ++i) {
      result += this._transforms.toString(pr);
      if(i < sz - 1) {
        result += ', ';
      }
    }
    result += ']';
    return result;
  }

  updateTransforms(lod = this._transforms.length) {
    this._transforms = CubicBezier.calcTransforms(this._ap0, this._cp0, this._cp1, this._ap1, lod);
  }
}

DiscreteCubicBezierCurve.defaultLevelOfDetail = 16;
