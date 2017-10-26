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

  adjust(curveIndex, pointIndex,
    x, y, z,
    cpforward = CubicBezierSpline.alignControlPoint0,
    cpbackward = CubicBezierSpline.alignControlPoint1,
    apforward = cpforward,
    apbackward = cpbackward) {
    let sz = this._curves.length;
    let curve = this._curves[curveIndex];

    switch (pointIndex) {
      case CubicBezierCurve.pointLayout.AnchorPoint0:
        if (x) curve._ap0._x = x;
        if (y) curve._ap0._y = y;
        if (z) curve._ap0._z = z;

        if (curveIndex > 0) {
          this.matchAnchorPoint1(curveIndex, curveIndex - 1);
          if (apbackward) {
            apbackward(this._curves, curveIndex, curveIndex - 1);
          }
        }
        break;

      case CubicBezierCurve.pointLayout.ControlPoint0:
        if (x) curve._cp0._x = x;
        if (y) curve._cp0._y = y;
        if (z) curve._cp0._z = z;

        if (curveIndex > 0 && cpbackward) {
          cpbackward(this._curves, curveIndex, curveIndex - 1);
        }
        break;

      case CubicBezierCurve.pointLayout.ControlPoint1:
        if (x) curve._cp1._x = x;
        if (y) curve._cp1._y = y;
        if (z) curve._cp1._z = z;

        if (curveIndex < sz - 1 && cpforward) {
          cpforward(this._curves, curveIndex, curveIndex + 1);
        }
        break;

      case CubicBezierCurve.pointLayout.AnchorPoint1:
        if (x) curve._ap1._x = x;
        if (y) curve._ap1._y = y;
        if (z) curve._ap1._z = z;

        if (curveIndex < sz - 1) {
          this.matchAnchorPoint0(curveIndex, curveIndex + 1);
          if (apforward) {
            apforward(this._curves, curveIndex, curveIndex + 1);
          }
        }
        break;

      default:
        console.error('Invalid point index. Must be 0 (ap0), 1 (cp0), 2 (cp1) or 3 (ap1).');
    }
  }

  alignControlPoint0(sourceIndex, targetIndex) {
    let source = this._curves[sourceIndex];
    let target = this._curves[targetIndex];
    let ap0 = target.ap0;
    target._cp0 = Vector.sub(source._ap1, source._cp1)
      .rescale(ap0.dist(target._cp0))
      .add(ap0);
  }

  alignControlPoint1(sourceIndex, targetIndex) {
    let source = this._curves[sourceIndex];
    let target = this._curves[targetIndex];
    let ap1 = target.ap1;
    target._cp1 = Vector.sub(source._ap0, source.cp0)
      .rescale(ap1.dist(target._cp1))
      .add(ap1);
  }

  alignControlPointsBackward() {
    let sz = this._curves.length;
    if (sz > 1) {
      for (let i = 0; i < sz - 1; ++i) {
        this.alignControlPoint1(i + 1, i);
      }
    }
  }

  alignControlPointsForward() {
    let sz = this._curves.length;
    if (sz > 1) {
      for (let i = 1; i < sz; ++i) {
        this.alignControlPoint0(i - 1, i);
      }
    }
  }

  applyModel(local, modview, caminv) {
    let mv = modview.copy();
    mv.applyMatrix(local);
    return this.applyLocalModel(mv, caminv);
  }

  applyLocalModel(mv, caminv) {
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      this._curves[i].applyLocalModel(mv, caminv);
    }
    return this;
  }

  calcPoint(st) {
    if (this._curves.length === 1 || st <= 0.0) {
      return this._curves[0].ap0;
    } else if (st >= 1.0) {
      return this._curves[this._curves.length - 1].ap1;
    }
    let sclst = st * this._curves.length;
    let i = Math.floor(sclst);
    return this._curves[i].calcPoint(sclst - i);
  }

  calcPoints(lod) {
    let result = [];
    let lodf = lod - 1;
    for (let i = 0; i < lod; ++i) {
      result.push(this.calcPoint(i / lodf));
    }
    return result;
  }

  calcTangent(st) {
    if (this._curves.length === 1 || st <= 0.0) {
      let c = this._curves[0];
      return Vector.sub(c._cp0, c._ap0);
    } else if (st >= 1.0) {
      let c = this._curves[this._curves.length - 1];
      return Vector.sub(c._ap1, c._cp1);
    }
    let sclst = st * this._curves.length;
    let i = Math.floor(sclst);
    return this._curves[i].calcTangent(sclst - i);
  }

  calcTangents(lod) {
    let result = [];
    let lodf = lod - 1;
    for (let i = 0; i < lod; ++i) {
      result.push(this.calcTangent(i / lodf));
    }
    return result;
  }

  calcTransform(st) {
    let c = null;
    let pt = null;
    let tn = null;

    if (this._curves.length === 1 || st <= 0.0) {
      c = this._curves[0];
      pt = c.ap0;
      tn = c.cp0.sub(c.ap0);
    } else if (st >= 1.0) {
      c = this._curves[this._curves.length - 1];
      pt = c.ap1;
      tn = c.ap1.sub(c.cp1);
    } else {
      let sclst = st * this._curves.length;
      let i = Math.floor(sclst);
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
    let lodf = lod - 1;
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
    let sz = this._curves.length;
    for (let i = 0; i < sz; ++i) {
      let curve = this._curves[i];
      let ap0 = curve._ap0;
      let cp0 = curve._cp0;
      let cp1 = curve._cp1;
      let ap1 = curve._ap1;
      ctx.moveTo(ap0.x, ap0.y);
      ctx.bezierCurveTo(cp0.x, cp0.y,
        cp1.x, cp1.y,
        ap1.x, ap1.y);
    }
    let endpoint = this._curves[sz - 1]._ap1;
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
    let sz = this._curves.length;
    for (let i = 0; i < sz; ++i) {
      let curve = this._curves[i];
      let ap0 = curve._ap0;
      let cp0 = curve._cp0;
      let cp1 = curve._cp1;
      let ap1 = curve._ap1;
      ctx.moveTo(ap0.x, ap0.y);
      ctx.lineTo(cp0.x, cp0.y);
      ctx.lineTo(cp1.x, cp1.y);
      ctx.lineTo(ap1.x, ap1.y);
    }
    let endpoint = this._curves[sz - 1]._ap1;
    ctx.moveTo(endpoint.x, endpoint.y);
    ctx.closePath();
    ctx.stroke();
  }

  drawPointLabel2d(ctx,
    label,
    vec = Vector.zero,
    isEmphasized = false,
    highlightColor = '#ffffff',
    fontSize = CubicBezierSpline.defaultFontSize,
    fontFace = CubicBezierSpline.defaultFontFace) {

    if (isEmphasized) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = highlightColor;
    } else {
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000000';
    }
    ctx.fillStyle = 'rgba(0, 0, 0, .85)';

    // Draw background arc.
    ctx.beginPath();
    ctx.arc(vec.x, vec.y, fontSize, 0, Math.TWO_PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw font.
    ctx.font = fontSize + 'px ' + fontFace;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = highlightColor;
    ctx.fillText(label, vec.x, vec.y);
  }

  // TODO Emphasis not properly displayed.
  drawPointLabels2d(ctx,
    curreditcurve = 0,
    curreditpoint = 0,
    fontSize = CubicBezierSpline.defaultFontSize,
    fontFace = CubicBezierSpline.defaultFontFace) {
    let sz = this._curves.length;
    let sz2 = this.getPointCount();

    let j = 0;
    let clr = '#007fff';
    let curveemph = curreditcurve === 0;
    let emphasize = curveemph && curreditpoint === 0;
    this.drawPointLabel2d(ctx, 0, this._curves[0]._ap0, emphasize, clr);

    for (let i = 0, j = 0; i < sz; ++i) {
      let curve = this._curves[i];
      curveemph = curreditcurve === i;

      clr = '#ff007f';
      emphasize = curveemph && curreditpoint === 1;
      this.drawPointLabel2d(ctx, ++j, curve._cp0, emphasize, clr);

      clr = '#7f00ff';
      emphasize = curveemph && curreditpoint === 2;
      this.drawPointLabel2d(ctx, ++j, curve._cp1, emphasize, clr);

      clr = '#007fff';
      emphasize = curveemph && curreditpoint === 3;
      this.drawPointLabel2d(ctx, ++j, curve._ap1, emphasize, clr);
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
    let sz = this._curves.length;
    if (sz > 1) {
      for (let i = 0; i < sz - 1; ++i) {
        this.matchAnchorPoint1(i + 1, i);
      }
    }
  }

  machAnchorPointsForward() {
    let sz = this._curves.length;
    if (sz > 1) {
      for (let i = 1; i < sz; ++i) {
        this.matchAnchorPoint0(i - 1, i);
      }
    }
  }

  mirrorControlPoint0(sourceIndex, targetIndex) {
    let source = this._curves[sourceIndex];
    let target = this._curves[targetIndex];
    target.cp0 = target.ap0
      .add(source.ap1
        .sub(source.cp1));
  }

  mirrorControlPoint1(sourceIndex, targetIndex) {
    let source = this._curves[sourceIndex];
    let target = this._curves[targetIndex];
    target.cp1 = target.ap1
      .add(source.ap0
        .sub(source.cp0));
  }

  mirrorControlPointsBackward() {
    let sz = this._curves.length;
    if (sz > 1) {
      for (let i = 0; i < sz - 1; ++i) {
        this.mirrorControlPoint1(i + 1, i);
      }
    }
  }

  mirrorControlPointsForward() {
    let sz = this._curves.length;
    if (sz > 1) {
      for (let i = 1; i < sz; ++i) {
        this.mirrorControlPoint0(i - 1, i);
      }
    }
  }

  printTable() {
    console.table(this.to2DArray());
  }

  setCurve(i, c) {
    this._curves[i] = c.copy();
  }

  to1DArray() {
    let result = [this._curves[0].ap0];
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      let c = this._curves[i];
      result.push(c.cp0);
      result.push(c.cp1);
      result.push(c.ap1);
    }
    return result;
  }

  to2DArray() {
    let result = [this._curves[0].ap0.toArray()];
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      let c = this._curves[i];
      result.push(c.cp0.toArray());
      result.push(c.cp1.toArray());
      result.push(c.ap1.toArray());
    }
    return result;
  }

  toString(pr = 2) {
    let result = '[' + this._curves[0].ap0.toString(pr);
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      let c = this._curves[i];
      result += c.cp0.toString(pr);
      result += c.cp1.toString(pr);
      result += c.ap1.toString(pr);
    }
    result += ']';
    return result;
  }

  // TODO spline toSvgPath needs testing. Is there a more
  // efficient way to do this than separate paths?
  toSvgPath(pr = 2, stroke = '#000000', fill = 'transparent') {
    let result = '';
    for (let i = 0, sz = this._curves.length; i < sz; ++i) {
      result += this._curves[i].toSvgPath(pr, stroke, fill);
      if (i < sz - 1) {
        result += '\n';
      }
    }
    return result;
  }

  transform2d(ctx, st) {
    let m = this.calcTransform(st)._m;
    ctx.transform(
      m[0][2], m[1][2],
      m[0][0], m[1][0],
      m[0][3], m[1][3]);
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

CubicBezierSpline.defaultFontSize = 12;
CubicBezierSpline.defaultFontFace = 'sans-serif';

// TODO: If you create a bezier curve/spline editor, these should be removed there.
CubicBezierSpline.alignControlPoint0 = function(curves, sourceIndex, targetIndex) {
  let source = curves[sourceIndex];
  let target = curves[targetIndex];
  let ap0 = target.ap0;
  target._cp0 = Vector.sub(source._ap1, source._cp1)
    .rescale(ap0.dist(target._cp0))
    .add(ap0);
}

CubicBezierSpline.alignControlPoint1 = function(curves, sourceIndex, targetIndex) {
  let source = curves[sourceIndex];
  let target = curves[targetIndex];
  let ap1 = target.ap1;
  target._cp1 = Vector.sub(source._ap0, source.cp0)
    .rescale(ap1.dist(target._cp1))
    .add(ap1);
}

// Problem with these results.
CubicBezierSpline.mirrorControlPoint0 = function(curves, sourceIndex, targetIndex) {
  let source = curves[sourceIndex];
  let target = curves[targetIndex];
  target.cp0 = target.ap0
    .add(source.ap1
      .sub(source.cp1));
}

CubicBezierSpline.mirrorControlPoint1 = function(curves, sourceIndex, targetIndex) {
  let source = curves[sourceIndex];
  let target = curves[targetIndex];
  target.cp1 = target.ap1
    .add(source.ap0
      .sub(source.cp0));
}
