'use strict';

class DiscreteCubicBezierCurve extends CubicBezierCurve {
  constructor(ap0 = Vector.random(),
    cp0 = Vector.random(),
    cp1 = Vector.random(),
    ap1 = Vector.random(),
    lod = DiscreteCubicBezierCurve.defaultLevelOfDetail) {

    super(ap0, cp0, cp1, ap1);
    this._transforms = this.calcTransforms(lod);
    // this._transforms = this.preCalcTransforms(lod);
  }

  // TODO Exploratory.
  // Requires testing.
  // Goal is to get evenly spaced segments
  // regardless of curve velocity.
  // preCalcTransforms(lod) {
  //   let pts = this.calcPoints(lod);
  //   let tns = this.calcTangents(lod);
  //   let result = [];
  //   let lodf = lod - 1.0;
  //   let st = 0;
  //   for (let i = 0; i < lod; ++i) {
  //     st = i / lodf;
  //     result.push(Matrix4x4.calcOrientation(
  //       Vector.easeArray(pts, st, Math.lerp),
  //       Vector.easeArray(tns, st, Math.lerp).norm()));
  //   }
  //   return result;
  // }

  // TODO Requires testing.
  adjust(pointIndex,
    x, y, z = 0) {
    super.adjust(pointIndex,
      x, y, z);
    this.updateTransforms();
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
    for (let i = 0, sz = this._transforms.length; i < sz; ++i) {
      result += this._transforms.toString(pr);
      if (i < sz - 1) {
        result += ', ';
      }
    }
    result += ']';
    return result;
  }

  updateTransforms(lod = this._transforms.length) {
    this._transforms = CubicBezier.calcTransforms(this._ap0, this._cp0, this._cp1, this._ap1, lod);
    // this._transforms = this.preCalcTransforms(lod);
  }
}

DiscreteCubicBezierCurve.defaultLevelOfDetail = 16;
