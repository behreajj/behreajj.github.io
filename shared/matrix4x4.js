'use strict';

class Matrix4x4 extends Matrix {
  constructor(m00 = 1, m01 = 0, m02 = 0, m03 = 0,
    m10 = 0, m11 = 1, m12 = 0, m13 = 0,
    m20 = 0, m21 = 0, m22 = 1, m23 = 0,
    m30 = 0, m31 = 0, m32 = 0, m33 = 1) {
    super(m00, m01, m02, m03,
      m10, m11, m12, m13,
      m20, m21, m22, m23,
      m30, m31, m32, m33);
  }

  apply(n00, n01, n02, n03,
    n10, n11, n12, n13,
    n20, n21, n22, n23,
    n30, n31, n32, n33) {

    // Is this more efficient than just accessing the array?
    let m00 = this._m[0][0];
    let m01 = this._m[0][1];
    let m02 = this._m[0][2];
    let m03 = this._m[0][3];

    let m10 = this._m[1][0];
    let m11 = this._m[1][1];
    let m12 = this._m[1][2];
    let m13 = this._m[1][3];

    let m20 = this._m[2][0];
    let m21 = this._m[2][1];
    let m22 = this._m[2][2];
    let m23 = this._m[2][3];

    let m30 = this._m[3][0];
    let m31 = this._m[3][1];
    let m32 = this._m[3][2];
    let m33 = this._m[3][3];

    return this.set(
      m00 * n00 + m01 * n10 + m02 * n20 + m03 * n30,
      m00 * n01 + m01 * n11 + m02 * n21 + m03 * n31,
      m00 * n02 + m01 * n12 + m02 * n22 + m03 * n32,
      m00 * n03 + m01 * n13 + m02 * n23 + m03 * n33,

      m10 * n00 + m11 * n10 + m12 * n20 + m13 * n30,
      m10 * n01 + m11 * n11 + m12 * n21 + m13 * n31,
      m10 * n02 + m11 * n12 + m12 * n22 + m13 * n32,
      m10 * n03 + m11 * n13 + m12 * n23 + m13 * n33,

      m20 * n00 + m21 * n10 + m22 * n20 + m23 * n30,
      m20 * n01 + m21 * n11 + m22 * n21 + m23 * n31,
      m20 * n02 + m21 * n12 + m22 * n22 + m23 * n32,
      m20 * n03 + m21 * n13 + m22 * n23 + m23 * n33,

      m30 * n00 + m31 * n10 + m32 * n20 + m33 * n30,
      m30 * n01 + m31 * n11 + m32 * n21 + m33 * n31,
      m30 * n02 + m31 * n12 + m32 * n22 + m33 * n32,
      m30 * n03 + m31 * n13 + m32 * n23 + m33 * n33);
  }

  applyMatrix(m) {
    return this.apply(
      m._m[0][0], m._m[0][1], m._m[0][2], m._m[0][3],
      m._m[1][0], m._m[1][1], m._m[1][2], m._m[1][3],
      m._m[2][0], m._m[2][1], m._m[2][2], m._m[2][3],
      m._m[3][0], m._m[3][1], m._m[3][2], m._m[3][3]);
  }

  copy() {
    return new Matrix4x4(
      this._m[0][0], this._m[0][1], this._m[0][2], this._m[0][3],
      this._m[1][0], this._m[1][1], this._m[1][2], this._m[1][3],
      this._m[2][0], this._m[2][1], this._m[2][2], this._m[2][3],
      this._m[3][0], this._m[3][1], this._m[3][2], this._m[3][3]);
  }

  // Unclear that this is effective in finding the proper
  // direction of a CSS Div.
  draw2d(ctx,
    tanScale = Matrix.defaultDrawScale,
    normScale = Matrix.defaultDrawScale,
    tanLineWidth = Matrix.defaultLineWidth,
    normLineWidth = Matrix.defaultLineWidth,
    tanStrokeStyle = Matrix.defaultXAxisColor,
    normStrokeStyle = Matrix.defaultYAxisColor) {
    let x = this._m[0][3];
    let y = this._m[1][3];
    let w = this._m[3][3];

    if (w != 0 && w != 1) {
      tanScale /= w;
      normScale /= w;
    }

    ctx.lineWidth = tanLineWidth;
    ctx.strokeStyle = tanStrokeStyle;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + this._m[0][2] * tanScale, y + this._m[1][2] * tanScale);
    ctx.closePath();
    ctx.stroke();

    ctx.lineWidth = normLineWidth;
    ctx.strokeStyle = normStrokeStyle;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + this._m[0][0] * normScale, y + this._m[1][0] * normScale);
    ctx.closePath();
    ctx.stroke();
  }

  getClass() {
    return this.constructor.name;
  }

  mult(arr) {
    let result = [];

    // Safety check.
    // let x = arr[0] ? arr[0] : 0;
    // let y = arr[1] ? arr[1] : 0;
    // let z = arr[2] ? arr[2] : 0;
    // let w = arr[3] ? arr[3] : 1;
    let x = arr[0];
    let y = arr[1];
    let z = arr[2];
    let w = arr[3];

    result[0] = this._m[0][0] * x + this._m[0][1] * y + this._m[0][2] * z + this._m[0][3] * w;
    result[1] = this._m[1][0] * x + this._m[1][1] * y + this._m[1][2] * z + this._m[1][3] * w;
    result[2] = this._m[2][0] * x + this._m[2][1] * y + this._m[2][2] * z + this._m[2][3] * w;
    result[3] = this._m[3][0] * x + this._m[3][1] * y + this._m[3][2] * z + this._m[3][3] * w;
    return result;
  }

  // TODO Needs testing.
  // Assumes a normalized, non-zero vector.
  rotate(angle, v) {
    let c = cos(angle);
    let s = sin(angle);
    let t = 1.0 - c;

    let tv0 = t * v.x;
    let tv1 = t * v.y;

    let sv0 = s * v.x;
    let sv1 = s * v.y;
    let sv2 = s * v.z;

    let tv0v1 = tv0 * tv1;
    let tv1v2 = tv1 * v2;
    let tv0v2 = tv0 * v2;

    this.apply(
      tv0 * v.x + c, tv0tv1 - sv2, tv0v2 + sv1, 0.0,
      tv0tv1 + sv2, tv1 * v.y + c, tv1v2 - sv0, 0.0,
      tv0v2 - sv1, tv1v2 + sv0, (t * v.y * v.y) + c, 0.0,
      0.0, 0.0, 0.0, 1.0);

      // Reference
      // float c = cos(angle);
      // float s = sin(angle);
      // float t = 1.0f - c;
      //
      // apply((t*v0*v0) + c, (t*v0*v1) - (s*v2), (t*v0*v2) + (s*v1), 0,
      //       (t*v0*v1) + (s*v2), (t*v1*v1) + c, (t*v1*v2) - (s*v0), 0,
      //       (t*v0*v2) - (s*v1), (t*v1*v2) + (s*v0), (t*v2*v2) + c, 0,
      //       0, 0, 0, 1);
  }

  rotateX(angle) {
    let c = Math.cos(angle);
    let s = Math.sin(angle);
    this.apply(1.0, 0.0, 0.0, 0.0,
      0.0, c, -s, 0.0,
      0.0, s, c, 0.0,
      0.0, 0.0, 0.0, 1.0);
  }

  rotateY(angle) {
    let c = Math.cos(angle);
    let s = Math.sin(angle);
    this.apply(
      c, 0.0, s, 0.0,
      0.0, 1.0, 0.0, 0.0, -s, 0.0, c, 0.0,
      0.0, 0.0, 0.0, 1.0);
  }

  rotateZ(angle) {
    let c = Math.cos(angle);
    let s = Math.sin(angle);
    this.apply(
      c, -s, 0.0, 0.0,
      s, c, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0);
  }

  set(m00 = 1, m01 = 0, m02 = 0, m03 = 0,
    m10 = 0, m11 = 1, m12 = 0, m13 = 0,
    m20 = 0, m21 = 0, m22 = 1, m23 = 0,
    m30 = 0, m31 = 0, m32 = 0, m33 = 1) {
    this._m[0][0] = m00;
    this._m[0][1] = m01;
    this._m[0][2] = m02;
    this._m[0][3] = m03;

    this._m[1][0] = m10;
    this._m[1][1] = m11;
    this._m[1][2] = m12;
    this._m[1][3] = m13;

    this._m[2][0] = m20;
    this._m[2][1] = m21;
    this._m[2][2] = m22;
    this._m[2][3] = m23;

    this._m[3][0] = m30;
    this._m[3][1] = m31;
    this._m[3][2] = m32;
    this._m[3][3] = m33;

    return this;
  }

  // Unclear that this is effective in finding the proper
  // direction of a CSS Div.
  toCss2d() {
    return 'matrix(' +
      this._m[0][2] + ', ' + this._m[1][2] + ', ' +
      this._m[0][0] + ', ' + this._m[1][0] + ', ' +
      this._m[0][3] + ', ' + this._m[1][3] + ')';
  }

  toCss3d() {
    return 'matrix3d(' + this._m.toString() + ')';
  }
}

Matrix4x4.calcOrientation = function(point, tangent) {
  let yaxis = Vector.cross(point, tangent).norm();
  let xaxis = Vector.cross(yaxis, tangent).norm();
  return new Matrix4x4(xaxis.x, yaxis.x, tangent.x, point.x,
    xaxis.y, yaxis.y, tangent.y, point.y,
    xaxis.z, yaxis.z, tangent.z, point.z,
    0.0, 0.0, 0.0, 1.0);
}

Matrix4x4.convertCoord = function(a, b, arr) {
  let c = a.mult(arr);
  let d = b.mult(c);
  let w = d[3];
  if (w != 0 && w != 1) {
    d[0] /= w;
    d[1] /= w;
    d[2] /= w;
  }
  return new Vector(d[0], d[1], d[2]);
}

Matrix4x4.model = function(x, y, z, localSpace,
  modelView = Matrix4x4.identity,
  cameraInverse = Matrix4x4.identity) {
  let mv = modelView.copy();
  mv.applyMatrix(localSpace);
  return Matrix4x4.convertCoord(mv, cameraInverse, [x, y, z, 1]);
}

Matrix4x4.identity = new Matrix4x4(
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1);
