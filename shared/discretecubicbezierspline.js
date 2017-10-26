'use strict';

class DiscreteCubicBezierSpline extends CubicBezierSpline {
  constructor(pts = [
      Vector.random(),
      Vector.random(),
      Vector.random(),
      Vector.random()
    ],
    lod = DiscreteCubicBezierSpline.defaultLevelOfDetail) {
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

  //TODO How to fix extreme torsion on negative curves?
  // easeAxis(j, func = Vector.lerp) {
  //   let sz = this._transforms.length;
  //   let szf = sz - 1;
  // let start = this._transforms[0].getColAsArray(0);
  // let stop = this._transforms[szf].getColAsArray(0);
  //   let start = this._transforms[0].getColAsVector(0);
  //   let stop = this._transforms[szf].getColAsVector(0);
  //   for (let i = 1; i < sz; ++i) {
  //     let v = Vector.ease(start, stop, i / szf, func);
  //     this._transforms[i]._m[0][j] = v.x;
  //     this._transforms[i]._m[1][j] = v.y;
  //     this._transforms[i]._m[2][j] = v.z;
  //   }
  // }

  drawTransform2d(ctx, i,
    tanScale = Matrix.defaultDrawScale,
    normScale = Matrix.defaultDrawScale,
    tanLineWidth = Matrix.defaultLineWidth,
    normLineWidth = Matrix.defaultLineWidth,
    tanStrokeStyle = Matrix4x4.defaultXAxisColor,
    normStrokeStyle = Matrix4x4.defaultYAxisColor) {
    this._transforms[i].draw2d(ctx, tanScale, normScale, tanLineWidth, normLineWidth, tanStrokeStyle, normStrokeStyle);
  }

  drawTransforms2d(ctx,
    tanScale = Matrix.defaultDrawScale,
    normScale = Matrix.defaultDrawScale,
    tanLineWidth = Matrix.defaultLineWidth,
    normLineWidth = Matrix.defaultLineWidth,
    tanStrokeStyle = Matrix4x4.defaultXAxisColor,
    normStrokeStyle = Matrix4x4.defaultYAxisColor) {
    for (let i = 0, sz = this._transforms.length; i < sz; ++i) {
      this._transforms[i].draw2d(ctx, tanScale, normScale, tanLineWidth, normLineWidth, tanStrokeStyle, normStrokeStyle);
    }
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
    this._transforms = this.calcTransforms(lod);
  }
}

DiscreteCubicBezierSpline.defaultLevelOfDetail = 16;

DiscreteCubicBezierCurve.random = function(
  lod = DiscreteCubicBezierSpline.defaultLevelOfDetail,
  minx = -1, maxx = 1,
  miny = -1, maxy = 1,
  minz = -1, maxz = 1) {
  return new DiscreteCubicBezierCurve(
    [Vector.random(minx, maxx, miny, maxy, minz, maxz),
      Vector.random(minx, maxx, miny, maxy, minz, maxz),
      Vector.random(minx, maxx, miny, maxy, minz, maxz),
      Vector.random(minx, maxx, miny, maxy, minz, maxz)
    ],
    lod);
}
