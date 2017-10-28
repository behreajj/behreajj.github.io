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

  getColAsVector(j) {
    let arr = this.getColAsArray(j);
    let v = new Vector(arr[0], arr[1], arr[2]);

    let w = this._m[3][3];
    if (w !== 0 && w !== 1) {
      v.x /= w;
      v.y /= w;
      v.z /= w;
    }

    return v;
  }

  getRowAsVector(i) {
    let arr = this.getRowAsArray(i);
    let v = new Vector(arr[0], arr[1], arr[2]);

    let w = this._m[3][3];
    if (w !== 0 && w !== 1) {
      v.x /= w;
      v.y /= w;
      v.z /= w;
    }

    return v;
  }

  // TODO Needs testing.
  // rotate(angle, v) {

  // Safety check 1.
  // if (v._x === 0 && v._y === 0 && v._z === 0) {
  //   console.error('Cannot rotate by zero vector.');
  //   return;
  // }

  // Safety check 2.
  // if(Math.abs(v.magSq() - 1) > Number.EPSILON) {
  //   v.norm();
  // }

  // let c = Math.cos(angle);
  // let s = Math.sin(angle);
  // let t = 1.0 - c;
  //
  // let xsq = v.x * v.x;
  // let ysq = v.y * v.y;
  // let zsq = v.z * v.z;
  //
  // let txy = t * v.x * v.y;
  // let txz = t * v.x * v.z;
  // let tyz = t * v.y * v.z;
  //
  // let sz = s * v.z;
  // let sy = s * v.y;
  // let sx = s * v.x;

  // this._m = Matrix.mult2DArrays(this._m, [
  //   [t * xsq + c, txy - sz, txz + sy, 0.0],
  //   [txy + sz, t * ysq + c, tyz - sx, 0.0],
  //   [txz - sy, tyz + sx, t * zsq + c, 0.0],
  //   [0.0, 0.0, 0.0, 1.0]
  // ]);
  // return this;
  // }

  // rotateX(angle) {
  //   let cos = Math.cos(angle);
  //   let sin = Math.sin(angle);
  //   this._m = Matrix.mult2DArrays(this._m, [
  //     [1.0, 0.0, 0.0, 0.0],
  //     [0.0, cos, -sin, 0.0],
  //     [0.0, sin, cos, 0.0],
  //     [0.0, 0.0, 0.0, 1.0]
  //   ]);
  //   return this;
  // }

  // rotateY(angle) {
  //   let cos = Math.cos(angle);
  //   let sin = Math.sin(angle);
  //   this._m = Matrix.mult2DArrays(this._m, [
  //     [cos, 0.0, sin, 0.0],
  //     [0.0, 1.0, 0.0, 0.0],
  //     [-sin, 0.0, cos, 0.0],
  //     [0.0, 0.0, 0.0, 1.0]
  //   ]);
  //   return this;
  // }

  // rotateZ(angle) {
  //   let cos = Math.cos(angle);
  //   let sin = Math.sin(angle);
  //   this._m = Matrix.mult2DArrays(this._m, [
  //     [cos, -sin, 0.0, 0.0],
  //     [sin, cos, 0.0, 0.0],
  //     [0.0, 0.0, 1.0, 0.0],
  //     [0.0, 0.0, 0.0, 1.0]
  //   ]);
  //   return this;
  // }

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
    Matrix.mult2DArrays(modelView._m, localSpace._m), cameraInverse._m,
    v.to4Array());
}

// TODO Screen.

Matrix4x4.identity = new Matrix4x4(
  1.0, 0.0, 0.0, 0.0,
  0.0, 1.0, 0.0, 0.0,
  0.0, 0.0, 1.0, 0.0,
  0.0, 0.0, 0.0, 1.0);
