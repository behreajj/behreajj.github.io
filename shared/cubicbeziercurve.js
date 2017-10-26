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
  adjust(pointIndex,
    x, y, z = 0) {
    switch (pointIndex) {
      case CubicBezierCurve.pointLayout.AnchorPoint0:
        this._ap0.set(x, y, z);
        break;
      case CubicBezierCurve.pointLayout.ControlPoint0:
        curve._cp0.set(x, y, z);
        break;
      case CubicBezierCurve.pointLayout.ControlPoint1:
        curve._cp1.set(x, y, z);
      case CubicBezierCurve.pointLayout.AnchorPoint1:
        curve._ap1.set(x, y, z);
        break;
      default:
        console.error('Invalid point index. Must be 0 (ap0), 1 (cp0), 2 (cp1) or 3 (ap1).');
    }
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
    ctx.lineTo(this._ap1.x, this._ap1.y);
    ctx.lineTo(this._cp1.x, this._cp1.y);
    ctx.lineTo(this._cp0.x, this._cp0.y);
    ctx.closePath();
    ctx.stroke();
  }

  equals(v) {
    return this._ap0.equals(v.ap0) &&
      this._cp0.equals(v.cp0) &&
      this._cp1.equals(v.cp1) &&
      this._ap1.equals(v.ap1);
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

  set(ap0, cp0, cp1, ap1) {
    this._ap0.set(ap0.x, ap0.y, ap0.z);
    this._cp0.set(cp0.x, cp0.y, cp0.z);
    this._cp1.set(cp1.x, cp1.y, cp1.z);
    this._ap1.set(ap1.x, ap1.y, ap1.z);
    return this;
  }

  applyModel(local, modview, caminv) {
    let mv = modview.copy();
    mv.applyMatrix(local);
    return this.applyLocalModel(mv, caminv);
  }

  applyLocalModel(mv, caminv) {
    this._ap0.applyLocalModel(mv, caminv);
    this._cp0.applyLocalModel(mv, caminv);
    this._cp1.applyLocalModel(mv, caminv);
    this._ap1.applyLocalModel(mv, caminv);
    return this;
  }

  toArray() {
    return [this._ap0.copy(),
      this._cp0.copy(),
      this._cp1.copy(),
      this._ap1.copy()
    ];
  }

  // TODO toSvgPath Needs testing.
  toSvgPath(pr = 2, stroke = '#000000', fill = 'transparent') {
    return '<path d="M ' + this._ap0.x.toFixed(pr) + ' ' + this._ap0.y.toFixed(pr) +
      ' C ' + this._cp0.x.toFixed(pr) + ' ' + this._cp0.y.toFixed(pr) + ', ' +
      this._cp1.x.toFixed(pr) + ' ' + this._cp1.y.toFixed(pr) + ', ' +
      this._ap1.x.toFixed(pr) + ' ' + this._ap1.y.toFixed(pr) +
      '" stroke="' + stroke +
      '" fill="' + fill + '" />';
  }

  toString(pr = 2) {
    return '[{0}, {1}, {2}, {3}]'.format(
      this._ap0.toString(pr),
      this._cp0.toString(pr),
      this._cp1.toString(pr),
      this._ap1.toString(pr)
    );
  }

  transform2d(ctx, st) {
    let m = this.calcTransform(st)._m;
    ctx.transform(
      m[0][2], m[1][2],
      m[0][0], m[1][0],
      m[0][3], m[1][3]);
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
