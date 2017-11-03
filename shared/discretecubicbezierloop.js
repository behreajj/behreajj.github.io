'use strict';

class DiscreteCubicBezierLoop extends CubicBezierLoop {
  constructor(pts = [
      Vector.random(),
      Vector.random(),
      Vector.random(),
      Vector.random()
    ],
    lod = DiscreteCubicBezierLoop.defaultLevelOfDetail) {
    super(pts);
    this._transforms = this.calcTransforms(lod);
  }

  adjust(curveIndex, pointIndex,
    x, y, z = 0,
    cpforward = CubicBezierSpline.alignControlPoint0,
    cpbackward = CubicBezierSpline.alignControlPoint1,
    apforward = cpforward,
    apbackward = cpbackward) {
    super.adjust(curveIndex, pointIndex,
      x, y, z,
      apforward, apbackward,
      cpforward, cpbackward);
    this.updateTransforms();
  }

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

  getTangent(i) {
    return this._transforms[i].getColAsVector(2);
  }

  getTranslation(i) {
    return this._transforms[i].getColAsVector(3);
  }

  getTransform(i) {
    return this._transforms[i].copy();
  }

  /** @override */
  rotate(a, axis) {
    super.rotate(a, axis);
    this.updateTransforms(this._transforms.length);
  }

  /** @override */
  rotateX(a) {
    super.rotateX(a);
    this.updateTransforms(this._transforms.length);
  }

  /** @override */
  rotateY(a) {
    super.rotateY(a);
    this.updateTransforms(this._transforms.length);
  }

  /** @override */
  rotateZ(a) {
    super.rotateZ(a);
    this.updateTransforms(this._transforms.length);
  }

  /** @override */
  scale(s) {
    super.scale(s);
    this.updateTransforms(this._transforms.length);
  }

  /** @override */
  toString(pr = 2) {
    let result = '[';
    for (let i = 0, sz = this._transforms.length; i < sz - 1; ++i) {
      result += this._transforms.toString(pr);

      if (i < sz - 2) {
        result += ',\n';
      }
    }
    result += ']';
    return result;
  }

  /** @override */
  translate(v) {
    super.translate(v);
    this.updateTransforms(this._transforms.length);
  }

  updateTransforms(lod = this._transforms.length) {
    this._transforms = this.calcTransforms(lod);
  }
}

DiscreteCubicBezierLoop.defaultLevelOfDetail = 32;

DiscreteCubicBezierLoop.random = function(
  lod = DiscreteCubicBezierSpline.defaultLevelOfDetail,
  minx = -1, maxx = 1,
  miny = -1, maxy = 1,
  minz = -1, maxz = 1) {
  return new DiscreteCubicBezierLoop(
    [Vector.random(minx, maxx, miny, maxy, minz, maxz),
      Vector.random(minx, maxx, miny, maxy, minz, maxz),
      Vector.random(minx, maxx, miny, maxy, minz, maxz),
      Vector.random(minx, maxx, miny, maxy, minz, maxz)
    ],
    lod);
}
