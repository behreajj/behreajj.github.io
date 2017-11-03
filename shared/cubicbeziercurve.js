'use strict';

class CubicBezierCurve extends CubicBezier {
  constructor(ap0 = Vector.random(),
    cp0 = Vector.random(),
    cp1 = Vector.random(),
    ap1 = Vector.random()) {
    super();

    this._ap0 = ap0.copy();
    this._cp0 = cp0.copy();
    this._cp1 = cp1.copy();
    this._ap1 = ap1.copy();
  }

  // TODO The problem with these is that curve.ap0.set(0, 0, 0)
  // no longer works, while curve.ap0 = new Vector(0, 0, 0) Requires
  // a new object to be created.
  get ap0() {
    return this._ap0.copy();
  }

  get ap1() {
    return this._ap1.copy();
  }

  get cp0() {
    return this._cp0.copy();
  }

  get cp1() {
    return this._cp1.copy();
  }

  set ap0(v) {
    this._ap0.set(v.x, v.y, v.z);
  }

  set ap1(v) {
    this._ap1.set(v.x, v.y, v.z);
  }

  set cp0(v) {
    this._cp0.set(v.x, v.y, v.z);
  }

  set cp1(v) {
    this._cp1.set(v.x, v.y, v.z);
  }

  // TODO Requires testing.
  adjust(pointIndex, x, y, z) {
    let pt = null;
    switch (pointIndex) {
      case CubicBezierCurve.pointLayout.AnchorPoint0:
        pt = this._ap0;
        break;
      case CubicBezierCurve.pointLayout.ControlPoint0:
        pt = this._cp0;
        break;
      case CubicBezierCurve.pointLayout.ControlPoint1:
        pt = this._cp1;
        break;
      case CubicBezierCurve.pointLayout.AnchorPoint1:
        pt = this._ap1;
        break;
      default:
        console.error('Invalid point index. Must be 0 (ap0), 1 (cp0), 2 (cp1) or 3 (ap1).');
        return false;
    }

    if (x) {
      pt.x = x;
    }
    if (y) {
      pt.y = y;
    }
    if (z) {
      pt.z = z;
    }
    return true;
  }

  applyMatrix(m) {
    return this.apply2DArray(m._m);
  }

  apply2DArray(arr) {
    this._ap0.apply2DArray(arr);
    this._cp0.apply2DArray(arr);
    this._cp1.apply2DArray(arr);
    this._ap1.apply2DArray(arr);
    return this;
  }

  calcPoint(st) {
    return CubicBezier.calcPoint(this._ap0, this._cp0, this._cp1, this._ap1, st);
  }

  calcPoints(lod) {
    return CubicBezier.calcPoints(this._ap0, this._cp0, this._cp1, this._ap1, lod);
  }

  calcTangent(st) {
    return CubicBezier.calcTangent(this._ap0, this._cp0, this._cp1, this._ap1, st);
  }

  calcTangents(lod) {
    return CubicBezier.calcTangents(this._ap0, this._cp0, this._cp1, this._ap1, lod);
  }

  calcTransform(st) {
    return CubicBezier.calcTransform(this._ap0, this._cp0, this._cp1, this._ap1, st);
  }

  calcTransforms(lod) {
    return CubicBezier.calcTransforms(this._ap0, this._cp0, this._cp1, this._ap1, lod);
  }

  copy() {
    return new CubicBezierCurve(this._ap0, this._cp0, this._cp1, this._ap0);
  }

  draw2d(ctx,
    strokeStyle = CubicBezier.defaultCurveStyle,
    lineWidth = CubicBezier.defaultCurveWidth) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(this._ap0.x, this._ap0.y);
    ctx.bezierCurveTo(
      this._cp0.x, this._cp0.y,
      this._cp1.x, this._cp1.y,
      this._ap1.x, this._ap1.y);
    ctx.moveTo(this._ap1.x, this._ap1.y);
    ctx.closePath();
    ctx.stroke();
  }

  drawConstruction2d(ctx,
    strokeStyle = CubicBezier.defaultConstructionStyle,
    lineWidth = CubicBezier.defaultConstructionWidth) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(this._ap0.x, this._ap0.y);
    ctx.lineTo(this._cp0.x, this._cp0.y);
    ctx.lineTo(this._cp1.x, this._cp1.y);
    ctx.lineTo(this._ap1.x, this._ap1.y);
    ctx.moveTo(this._ap1.x, this._ap1.y);
    ctx.closePath();
    ctx.stroke();
  }

  drawPointLabels2d(ctx, curreditpoint) {
    CubicBezier.drawPointLabel2d(ctx, 'AP0', this._ap0, curreditpoint === CubicBezierCurve.pointLayout.AnchorPoint0, '#00ff7f');

    CubicBezier.drawPointLabel2d(ctx, 'CP0', this._cp0, curreditpoint === CubicBezierCurve.pointLayout.ControlPoint0, '#ff007f');

    CubicBezier.drawPointLabel2d(ctx, 'CP1', this._cp1, curreditpoint === CubicBezierCurve.pointLayout.ControlPoint1, '#7f00ff');

    CubicBezier.drawPointLabel2d(ctx, 'AP1', this._ap1, curreditpoint === CubicBezierCurve.pointLayout.AnchorPoint1, '#007fff');
  }

  // TODO Needs testing.
  equals(v) {
    if (this === v) {
      return true;
    }

    if (this.constructor.name !== m.constructor.name) {
      return false;
    }

    return this._ap0.equals(v._ap0) &&
      this._cp0.equals(v._cp0) &&
      this._cp1.equals(v._cp1) &&
      this._ap1.equals(v._ap1);
  }

  getClass() {
    return this.constructor.name;
  }

  reset() {
    this._ap0.reset();
    this._cp0.reset();
    this._cp1.reset();
    this._ap1.reset();
    return this;
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

  rotateZ(a) {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    let pt, xt;

    pt = this._ap0;
    xt = pt._x;
    pt._x = xt * cos - pt._y * sin;
    pt._y = xt * sin + pt._y * cos;

    pt = this._cp0;
    xt = pt._x;
    pt._x = xt * cos - pt._y * sin;
    pt._y = xt * sin + pt._y * cos;

    pt = this._cp1;
    xt = pt._x;
    pt._x = xt * cos - pt._y * sin;
    pt._y = xt * sin + pt._y * cos;

    pt = this._ap1;
    xt = pt._x;
    pt._x = xt * cos - pt._y * sin;
    pt._y = xt * sin + pt._y * cos;

    return this;
  }

  scale(s) {
    this._ap0.scale(s);
    this._cp0.scale(s);
    this._cp1.scale(s);
    this._ap1.scale(s);
  }

  set(ap0, cp0, cp1, ap1) {
    this._ap0.set(ap0.x, ap0.y, ap0.z);
    this._cp0.set(cp0.x, cp0.y, cp0.z);
    this._cp1.set(cp1.x, cp1.y, cp1.z);
    this._ap1.set(ap1.x, ap1.y, ap1.z);
    return this;
  }

  toArray() {
    return [this._ap0.copy(),
      this._cp0.copy(),
      this._cp1.copy(),
      this._ap1.copy()
    ];
  }

  toSvgPath(fill = 'transparent',
    stroke = '#000000',
    strokeWeight = 1,
    pr = 2) {
    return '<path d="M ' + this._ap0.x.toFixed(pr) + ' ' + this._ap0.y.toFixed(pr) +
      ' C ' + this._cp0.x.toFixed(pr) + ' ' + this._cp0.y.toFixed(pr) + ', ' +
      this._cp1.x.toFixed(pr) + ' ' + this._cp1.y.toFixed(pr) + ', ' +
      this._ap1.x.toFixed(pr) + ' ' + this._ap1.y.toFixed(pr) +
      '" fill="' + fill +
      '" stroke="' + stroke +
      '" stroke-width="' + strokeWeight +
      '" stroke-linecap="round" stroke-linejoin="round" />';
  }

  toString(pr = 2) {
    return '[' +
      this._ap0.toString(pr) + ', ' +
      this._cp0.toString(pr) + ', ' +
      this._cp1.toString(pr) + ', ' +
      this._ap1.toString(pr) + ']';
  }

  translate(v) {
    this._ap0.add(v);
    this._cp0.add(v);
    this._cp1.add(v);
    this._ap1.add(v);
  }
}

CubicBezierCurve.random = function(minx = -1, maxx = 1,
  miny = -1, maxy = 1,
  minz = -1, maxz = 1) {
  return new CubicBezierCurve(
    Vector.random(minx, maxx, miny, maxy, minz, maxz),
    Vector.random(minx, maxx, miny, maxy, minz, maxz),
    Vector.random(minx, maxx, miny, maxy, minz, maxz),
    Vector.random(minx, maxx, miny, maxy, minz, maxz));
}

CubicBezierCurve.pointLayout = {
  AnchorPoint0: 0,
  AnchorPoint1: 3,
  ControlPoint0: 1,
  ControlPoint1: 2
}
