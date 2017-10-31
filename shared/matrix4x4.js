'use strict';

class Matrix4x4 extends Matrix {
  constructor(m00 = 1.0, m01 = 0.0, m02 = 0.0, m03 = 0.0,
    m10 = 0.0, m11 = 1.0, m12 = 0.0, m13 = 0.0,
    m20 = 0.0, m21 = 0.0, m22 = 1.0, m23 = 0.0,
    m30 = 0.0, m31 = 0.0, m32 = 0.0, m33 = 1.0) {
    super();
    this._m = [
      [m00, m01, m02, m03],
      [m10, m11, m12, m13],
      [m20, m21, m22, m23],
      [m30, m31, m32, m33]
    ];
  }

  copy() {
    let n = new Matrix4x4(
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0);
    n._m = Matrix.copy2DArray(this._m);
    return n;
  }

  // determinant() {

  // return d00 * d11 - d01 * d10 + d02 * d09 +
  // d03 * d08 - d04 * d07 + d05 * d06;

  //   var d00 = (this.mat4[0] * this.mat4[5]) - (this.mat4[1] * this.mat4[4]),
  //   d01 = (this.mat4[0] * this.mat4[6]) - (this.mat4[2] * this.mat4[4]),
  //   d02 = (this.mat4[0] * this.mat4[7]) - (this.mat4[3] * this.mat4[4]),
  //   d03 = (this.mat4[1] * this.mat4[6]) - (this.mat4[2] * this.mat4[5]),
  //   d04 = (this.mat4[1] * this.mat4[7]) - (this.mat4[3] * this.mat4[5]),
  //   d05 = (this.mat4[2] * this.mat4[7]) - (this.mat4[3] * this.mat4[6]),
  //   d06 = (this.mat4[8] * this.mat4[13]) - (this.mat4[9] * this.mat4[12]),
  //   d07 = (this.mat4[8] * this.mat4[14]) - (this.mat4[10] * this.mat4[12]),
  //   d08 = (this.mat4[8] * this.mat4[15]) - (this.mat4[11] * this.mat4[12]),
  //   d09 = (this.mat4[9] * this.mat4[14]) - (this.mat4[10] * this.mat4[13]),
  //   d10 = (this.mat4[9] * this.mat4[15]) - (this.mat4[11] * this.mat4[13]),
  //   d11 = (this.mat4[10] * this.mat4[15]) - (this.mat4[11] * this.mat4[14]);
  // }

  getColAsVector(j) {
    return Vector.from4Array(this.getColAsArray(j));
  }

  getRowAsVector(i) {
    return Vector.from4Array(this.getRowAsArray(i));
  }

  reset() {
    this.set(1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, 0.0, 1.0);
    return this;
  }

  set(n00 = 1.0, n01 = 0.0, n02 = 0.0, n03 = 0.0,
    n10 = 0.0, n11 = 1.0, n12 = 0.0, n13 = 0.0,
    n20 = 0.0, n21 = 0.0, n22 = 1.0, n23 = 0.0,
    n30 = 0.0, n31 = 0.0, n32 = 0.0, n33 = 1.0) {

    this._m[0][0] = n00;
    this._m[0][1] = n01;
    this._m[0][2] = n02;
    this._m[0][3] = n03;

    this._m[1][0] = n10;
    this._m[1][1] = n11;
    this._m[1][2] = n12;
    this._m[1][3] = n13;

    this._m[2][0] = n20;
    this._m[2][1] = n21;
    this._m[2][2] = n22;
    this._m[2][3] = n23;

    this._m[3][0] = n30;
    this._m[3][1] = n31;
    this._m[3][2] = n32;
    this._m[3][3] = n33;

    return this;
  }

  toCss() {
    return 'matrix3d(' + this._m.toString() + ')';
  }

  translate(v) {
    let tx = v.x;
    let ty = v.y;
    let tz = v.z;
    for (let i = 0; i < 4; ++i) {
      this._m[i][3] +=
        tx * this._m[i][0] +
        ty * this._m[i][1] +
        tz * this._m[i][2];
    }
    return this;
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

Matrix4x4.convertCoord = function(m, n, arr1d) {
  return Vector.from4Array(
    Matrix.dot2DArray1DArray(m,
      Matrix.dot2DArray1DArray(n, arr1d))
  );
}

Matrix4x4.model = function(v, localSpace,
  modelView = Matrix4x4.identity,
  cameraInverse = Matrix4x4.identity) {
  return Matrix4x4.convertCoord(
    Matrix.mult2DArrays(modelView._m, localSpace._m),
    cameraInverse._m,
    v.to4Array());
}

// TODO Needs testing.
// Matrix4x4.screen = function(v, cnvs,
//   modelView = Matrix4x4.identity,
//   projection = Matrix4x4.identity) {
//   let o = Matrix4x4.convertCoord(modelView._m, projection._m, v.to4Array());
//   o.add([Vector.identity]);
//   o.scale(.5);
//   o._x * cnvs.width;
//   o._y * cnvs.height;
//   return o;
// }

// TODO Needs testing, specifically whether bottom is 0 or height, top 0 or height.
Matrix4x4.orthographic = function(left = 0, right = window.innerWidth,
  bottom = 0, top = window.innerHeight,
  near = window.innerHeight * .086602,
  far = window.innerHeight * 8.6602) {
  const lr = 1.0 / (left - right);
  const bt = 1.0 / (bottom - top);
  const nf = 1.0 / (near - far);
  return new Matrix4x4(-2.0 * lr, 0.0, 0.0, 0.0,
    0.0, -2.0 * bt, 0.0, 0.0,
    0.0, 0.0, 2.0 * nf, 0.0,
    (left + right) * lr, (top + bottom) * bt, (far + near) * nf, 1.0);
}

Matrix4x4.perspective = function(fovy = Math.PI / 3.0,
  aspect = window.innerWidth / window.innerHeight,
  near = window.innerHeight * .086602,
  far = window.innerHeight * 8.6602) {
  const f = 1.0 / Math.tan(fovy * 0.5);
  const nf = 1.0 / (near - far);
  return new Matrix4x4(f / aspect, 0.0, 0.0, 0.0,
    0.0, f, 0.0, 0.0,
    0.0, 0.0, (far + near) * nf, -1.0,
    0.0, 0.0, 2.0 * far * near * nf, 0.0);
}

Matrix4x4.identity = new Matrix4x4(
  1.0, 0.0, 0.0, 0.0,
  0.0, 1.0, 0.0, 0.0,
  0.0, 0.0, 1.0, 0.0,
  0.0, 0.0, 0.0, 1.0);
