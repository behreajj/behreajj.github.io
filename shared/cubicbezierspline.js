'use strict';

class CubicBezierSpline extends CubicBezier {
  constructor(pts = [
    Vector.random(),
    Vector.random(),
    Vector.random(),
    Vector.random()
  ]) {
    super();

    let sz = pts.length > 4 ? pts.length : 4;
    let ap0 = pts[0] ? pts[0] : Vector.random();
    this._curves = [];
    for (let i = 1; i < sz; i += 3) {
      this._curves.push(new CubicBezierCurve(ap0,
        pts[i] ? pts[i] : Vector.random(),
        pts[i + 1] ? pts[i + 1] : Vector.random(),
        pts[i + 2] ? pts[i + 2] : Vector.random()));
      ap0 = pts[i + 2] ? pts[i + 2] : Vector.random();
    }
  }

  addCurve(curve) {
    curve.ap0 = this._curves[this._curves.length - 1].ap1;
    this._curves.push(curve);
  }

  addPoints(cp0, cp1, ap1) {
    this._curves.push(new CubiceBezierCurve(this._curves[this._curves.length - 1].ap1,
      cp0, cp1, ap1));
  }

  // TODO Refactor.
  adjust(curveIndex, pointIndex,
    x, y, z,
    cpforward = CubicBezierSpline.alignControlPoint0,
    cpbackward = CubicBezierSpline.alignControlPoint1,
    apforward = cpforward,
    apbackward = cpbackward) {

    this._curves[curveIndex].adjust(pointIndex, x, y, z);

    // If not the first curve on the spline...
    if (curveIndex > 0) {
      if (pointIndex === CubicBezierCurve.pointLayout.AnchorPoint0) {
        this.matchAnchorPoint1(curveIndex, curveIndex - 1);
        if (apbackward) {
          apbackward(this._curves, curveIndex, curveIndex - 1);
        }
      } else if (cpbackward && pointIndex === CubicBezierCurve.pointLayout.ControlPoint0) {
        cpbackward(this._curves, curveIndex, curveIndex - 1);
      }
    }

    // If not the last curve on the spline...
    if (curveIndex < this._curves.length - 1) {
      if (cpforward && pointIndex === CubicBezierCurve.pointLayout.ControlPoint1) {
        cpforward(this._curves, curveIndex, curveIndex + 1);
      } else if (pointIndex === CubicBezierCurve.pointLayout.AnchorPoint1) {
        this.matchAnchorPoint0(curveIndex, curveIndex + 1);
        if (apforward) {
          apforward(this._curves, curveIndex, curveIndex + 1);
        }
      }
    }
  }

  alignControlPoint0(sourceIndex, targetIndex) {
    const source = this._curves[sourceIndex];
    let target = this._curves[targetIndex];
    const ap0 = target.ap0;
    target._cp0 = Vector.sub(source._ap1, source._cp1)
      .rescale(ap0.dist(target._cp0))
      .add(ap0);
  }

  alignControlPoint1(sourceIndex, targetIndex) {
    const source = this._curves[sourceIndex];
    let target = this._curves[targetIndex];
    const ap1 = target.ap1;
    target._cp1 = Vector.sub(source._ap0, source.cp0)
      .rescale(ap1.dist(target._cp1))
      .add(ap1);
  }

  alignControlPointsBackward() {
    const sz = this._curves.length;
    if (sz > 1) {
      for (let i = 0; i < sz - 1; ++i) {
        this.alignControlPoint1(i + 1, i);
      }
    }
  }

  alignControlPointsForward() {
    const sz = this._curves.length;
    if (sz > 1) {
      for (let i = 1; i < sz; ++i) {
        this.alignControlPoint0(i - 1, i);
      }
    }
  }

  applyMatrix(m) {
    return this.apply2DArray(m._m);
  }

  apply2DArray(arr) {
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      this._curves[i].apply2DArray(arr);
    }
    return this;
  }

  calcPoint(st) {
    if (this._curves.length === 1 || st <= 0.0) {
      return this._curves[0].ap0;
    } else if (st >= 1.0) {
      return this._curves[this._curves.length - 1].ap1;
    }
    const sclst = st * this._curves.length;
    const i = Math.floor(sclst);
    return this._curves[i].calcPoint(sclst - i);
  }

  calcPoints(lod) {
    let result = [];
    const lodf = lod - 1;
    for (let i = 0; i < lod; ++i) {
      result.push(this.calcPoint(i / lodf));
    }
    return result;
  }

  calcTangent(st) {
    if (this._curves.length === 1 || st <= 0.0) {
      const c = this._curves[0];
      return Vector.sub(c._cp0, c._ap0);
    } else if (st >= 1.0) {
      const c = this._curves[this._curves.length - 1];
      return Vector.sub(c._ap1, c._cp1);
    }
    const sclst = st * this._curves.length;
    const i = Math.floor(sclst);
    return this._curves[i].calcTangent(sclst - i);
  }

  calcTangents(lod) {
    let result = [];
    const lodf = lod - 1;
    for (let i = 0; i < lod; ++i) {
      result.push(this.calcTangent(i / lodf));
    }
    return result;
  }

  calcTransform(st) {
    let c = null;
    let pt = null;
    let tn = null;
    const sz = this._curves.length;

    if (sz === 1 || st <= 0.0) {
      c = this._curves[0];
      pt = c.ap0;
      tn = c.cp0.sub(pt);
    } else if (st >= 1.0) {
      c = this._curves[sz - 1];
      pt = c.ap1;
      tn = c.ap1.sub(c.cp1);
    } else {
      let sclst = st * sz;
      const i = Math.floor(sclst);
      sclst -= i;
      c = this._curves[i];
      pt = c.calcPoint(sclst);
      tn = c.calcTangent(sclst);
    }

    tn.norm();
    return Matrix4x4.calcOrientation(pt, tn);
  }

  calcTransforms(lod) {
    let result = [];
    const lodf = lod - 1;
    for (let i = 0; i < lod; ++i) {
      result.push(this.calcTransform(i / lodf));
    }
    return result;
  }

  draw2d(ctx,
    strokeStyle = CubicBezier.defaultCurveStyle,
    lineWidth = CubicBezier.defaultCurveWidth) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    const sz = this._curves.length;
    let curve, ap0, cp0, cp1, ap1;
    for (let i = 0; i < sz; ++i) {
      curve = this._curves[i];
      ap0 = curve._ap0;
      cp0 = curve._cp0;
      cp1 = curve._cp1;
      ap1 = curve._ap1;
      ctx.moveTo(ap0.x, ap0.y);
      ctx.bezierCurveTo(cp0.x, cp0.y,
        cp1.x, cp1.y,
        ap1.x, ap1.y);
    }

    //TODO Wouldn't endpoint be ap1 already,
    // as that is where the for-loop above
    // left off?
    const endpoint = this._curves[sz - 1]._ap1;
    ctx.moveTo(endpoint.x, endpoint.y);
    ctx.closePath();
    ctx.stroke();
  }

  drawConstruction2d(ctx,
    strokeStyle = CubicBezier.defaultConstructionStyle,
    lineWidth = CubicBezier.defaultConstructionWidth) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    const sz = this._curves.length;
    let curve, ap0, cp0, cp1, ap1;
    for (let i = 0; i < sz; ++i) {
      curve = this._curves[i];
      ap0 = curve._ap0;
      cp0 = curve._cp0;
      cp1 = curve._cp1;
      ap1 = curve._ap1;
      ctx.moveTo(ap0.x, ap0.y);
      ctx.lineTo(cp0.x, cp0.y);
      ctx.lineTo(cp1.x, cp1.y);
      ctx.lineTo(ap1.x, ap1.y);
    }

    //TODO Wouldn't endpoint be ap1 already,
    // as that is where the for-loop above
    // left off?
    const endpoint = this._curves[sz - 1]._ap1;
    ctx.moveTo(endpoint.x, endpoint.y);
    ctx.closePath();
    ctx.stroke();
  }

  drawPointLabels2d(ctx, curreditpoint, curreditcurve) {
    const sz = this._curves.length;

    let j = 0;
    let clr = '#007fff';
    let curveemph = curreditcurve === 0;
    let emphasize = curveemph && curreditpoint === CubicBezierCurve.pointLayout.AnchorPoint0;
    let curve = this._curves[0];
    CubicBezier.drawPointLabel2d(ctx, 0, curve._ap0, emphasize, clr);

    for (let i = 0, j = 0; i < sz; ++i) {
      curve = this._curves[i];
      curveemph = curreditcurve === i;

      clr = '#ff007f';
      emphasize = curveemph && curreditpoint === CubicBezierCurve.pointLayout.ControlPoint0;
      CubicBezier.drawPointLabel2d(ctx, ++j, curve._cp0, emphasize, clr);

      clr = '#7f00ff';
      emphasize = curveemph && curreditpoint === CubicBezierCurve.pointLayout.ControlPoint1;
      CubicBezier.drawPointLabel2d(ctx, ++j, curve._cp1, emphasize, clr);

      clr = '#007fff';
      emphasize = curveemph && curreditpoint === CubicBezierCurve.pointLayout.AnchorPoint1;
      CubicBezier.drawPointLabel2d(ctx, ++j, curve._ap1, emphasize, clr);
    }
  }

  getClass() {
    return this.constructor.name;
  }

  getCurve(i) {
    return this._curves[i].copy();
  }

  getCurveCount() {
    return this._curves.length;
  }

  getPointCount() {
    return 1 + this._curves.length * 3;
  }

  matchAnchorPoint0(sourceIndex, targetIndex) {
    this._curves[targetIndex].ap0 = this._curves[sourceIndex].ap1;
  }

  matchAnchorPoint1(sourceIndex, targetIndex) {
    this._curves[targetIndex].ap1 = this._curves[sourceIndex].ap0;
  }

  matchAnchorPointsBackward() {
    const sz = this._curves.length;
    if (sz > 1) {
      for (let i = 0; i < sz - 1; ++i) {
        this.matchAnchorPoint1(i + 1, i);
      }
    }
  }

  machAnchorPointsForward() {
    const sz = this._curves.length;
    if (sz > 1) {
      for (let i = 1; i < sz; ++i) {
        this.matchAnchorPoint0(i - 1, i);
      }
    }
  }

  mirrorControlPoint0(sourceIndex, targetIndex) {
    const source = this._curves[sourceIndex];
    let target = this._curves[targetIndex];
    target.cp0 = target.ap0
      .add(source.ap1
        .sub(source.cp1));
  }

  mirrorControlPoint1(sourceIndex, targetIndex) {
    const source = this._curves[sourceIndex];
    let target = this._curves[targetIndex];
    target.cp1 = target.ap1
      .add(source.ap0
        .sub(source.cp0));
  }

  mirrorControlPointsBackward() {
    const sz = this._curves.length;
    if (sz > 1) {
      for (let i = 0; i < sz - 1; ++i) {
        this.mirrorControlPoint1(i + 1, i);
      }
    }
  }

  mirrorControlPointsForward() {
    const sz = this._curves.length;
    if (sz > 1) {
      for (let i = 1; i < sz; ++i) {
        this.mirrorControlPoint0(i - 1, i);
      }
    }
  }

  printTable() {
    console.table(this.to2DArray());
  }

  rotate(a, axis) {
    // No safety checks.
    // Axis should be non-zero and normalized.

    const c = Math.cos(a);
    const s = Math.sin(a);
    const t = 1.0 - c;

    const x = axis._x;
    const y = axis._y;
    const z = axis._z;

    const xsq = x * x;
    const ysq = y * y;
    const zsq = z * z;

    const txy = t * x * y;
    const txz = t * x * z;
    const tyz = t * y * z;

    const sz = s * z;
    const sy = s * y;
    const sx = s * x;

    return this.apply2DArray([
      [t * xsq + c, txy - sz, txz + sy, 0.0],
      [txy + sz, t * ysq + c, tyz - sx, 0.0],
      [txz - sy, tyz + sx, t * zsq + c, 0.0],
      [0.0, 0.0, 0.0, 1.0]
    ]);
  }

  rotateX(a) {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return this.apply2DArray([
      [1.0, 0.0, 0.0, 0.0],
      [0.0, cos, -sin, 0.0],
      [0.0, sin, cos, 0.0],
      [0.0, 0.0, 0.0, 1.0]
    ]);
  }

  rotateY(a) {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return this.apply2DArray([
      [cos, 0.0, sin, 0.0],
      [0.0, 1.0, 0.0, 0.0],
      [-sin, 0.0, cos, 0.0],
      [0.0, 0.0, 0.0, 1.0]
    ]);
  }

  // TODO Can this be made more efficient?
  rotateZ(a) {
    const sz = this._curves.length;
    for (let i = 0; i < sz; ++i) {
      this._curves[i].rotateZ(a);
    }
  }

  scale(s) {
    const sz = this._curves.length;
    for (let i = 0; i < sz; ++i) {
      this._curves[i].scale(s);
    }
  }

  setCurve(i, c) {
    this._curves[i] = c.copy();
  }

  to1DArray() {
    const sz = this._curves.length;
    let result = [this._curves[0].ap0];
    for (let i = 0; i < sz; ++i) {
      let c = this._curves[i];
      result.push(c.cp0);
      result.push(c.cp1);
      result.push(c.ap1);
    }
    return result;
  }

  to2DArray() {
    const sz = this._curves.length;
    let result = [this._curves[0].ap0.toArray()];
    let c = null;
    for (let i = 0; i < sz; ++i) {
      c = this._curves[i];
      result.push(c.cp0.toArray());
      result.push(c.cp1.toArray());
      result.push(c.ap1.toArray());
    }
    return result;
  }

  toString(pr = 2) {
    const sz = this._curves.length;
    let result = '[' + this._curves[0].ap0.toString(pr);
    for (let i = 0; i < sz; ++i) {
      let c = this._curves[i];
      result += c.cp0.toString(pr);
      result += c.cp1.toString(pr);
      result += c.ap1.toString(pr);
    }
    result += ']';
    return result;
  }

  // TODO spline toSvgPath needs testing.
  toSvgPath(fill = 'transparent',
    stroke = '#000000',
    strokeWeight = 1,
    pr = 2) {
    const sz = this._curves.length;
    let result = '';
    for (let i = 0; i < sz; ++i) {
      result += this._curves[i].toSvgPath(fill, stroke, strokeWeight, pr);
      if (i < sz - 1) {
        result += '\n';
      }
    }
    return result;
  }

  translate(v) {
    const sz = this._curves.length;
    for (let i = 0; i < sz; ++i) {
      this._curves[i].translate(v);
    }
  }
}

CubicBezierSpline.random = function(minx = -1, maxx = 1,
  miny = -1, maxy = 1,
  minz = -1, maxz = 1) {
  return new CubicBezierSpline(
    [Vector.random(minx, maxx, miny, maxy, minz, maxz),
      Vector.random(minx, maxx, miny, maxy, minz, maxz),
      Vector.random(minx, maxx, miny, maxy, minz, maxz),
      Vector.random(minx, maxx, miny, maxy, minz, maxz)
    ]);
}

CubicBezierSpline.alignControlPoint0 = function(curves, sourceIndex, targetIndex) {
  const source = curves[sourceIndex];
  let target = curves[targetIndex];
  const ap0 = target.ap0;
  target._cp0 = Vector.sub(source._ap1, source._cp1)
    .rescale(ap0.dist(target._cp0))
    .add(ap0);
}

CubicBezierSpline.alignControlPoint1 = function(curves, sourceIndex, targetIndex) {
  const source = curves[sourceIndex];
  let target = curves[targetIndex];
  const ap1 = target.ap1;
  target._cp1 = Vector.sub(source._ap0, source.cp0)
    .rescale(ap1.dist(target._cp1))
    .add(ap1);
}

CubicBezierSpline.mirrorControlPoint0 = function(curves, sourceIndex, targetIndex) {
  const source = curves[sourceIndex];
  let target = curves[targetIndex];
  target.cp0 = target.ap0
    .add(source.ap1
      .sub(source.cp1));
}

CubicBezierSpline.mirrorControlPoint1 = function(curves, sourceIndex, targetIndex) {
  const source = curves[sourceIndex];
  let target = curves[targetIndex];
  target.cp1 = target.ap1
    .add(source.ap0
      .sub(source.cp0));
}
