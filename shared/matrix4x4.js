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

  // TODO Needs testing.
  // From p5.Matrix.
  determinant() {
    const d00 = (this._m[0][0] * this._m[1][1]) - (this._m[0][1] * this._m[1][0]),
      d01 = (this._m[0][0] * this._m[1][2]) - (this._m[0][2] * this._m[1][0]),
      d02 = (this._m[0][0] * this._m[1][3]) - (this._m[0][3] * this._m[1][0]),
      d03 = (this._m[0][1] * this._m[1][2]) - (this._m[0][2] * this._m[1][1]),
      d04 = (this._m[0][1] * this._m[1][3]) - (this._m[0][3] * this._m[1][1]),
      d05 = (this._m[0][2] * this._m[1][3]) - (this._m[0][3] * this._m[1][2]),
      d06 = (this._m[2][0] * this._m[3][1]) - (this._m[2][1] * this._m[3][0]),
      d07 = (this._m[2][0] * this._m[3][2]) - (this._m[2][2] * this._m[3][0]),
      d08 = (this._m[2][0] * this._m[3][3]) - (this._m[2][3] * this._m[3][0]),
      d09 = (this._m[2][1] * this._m[3][2]) - (this._m[2][2] * this._m[3][1]),
      d10 = (this._m[2][1] * this._m[3][3]) - (this._m[2][3] * this._m[3][1]),
      d11 = (this._m[2][2] * this._m[3][3]) - (this._m[2][3] * this._m[3][2]);

    return d00 * d11 - d01 * d10 + d02 * d09 +
      d03 * d08 - d04 * d07 + d05 * d06;
  }

  // From p5.Matrix.
  invert() {
    const a00 = this._m[0][0],
      a01 = this._m[0][1],
      a02 = this._m[0][2],
      a03 = this._m[0][3],
      a10 = this._m[1][0],
      a11 = this._m[1][1],
      a12 = this._m[1][2],
      a13 = this._m[1][3],
      a20 = this._m[2][0],
      a21 = this._m[2][1],
      a22 = this._m[2][2],
      a23 = this._m[2][3],
      a30 = this._m[3][0],
      a31 = this._m[3][1],
      a32 = this._m[3][2],
      a33 = this._m[3][3],

      b00 = a00 * a11 - a01 * a10,
      b01 = a00 * a12 - a02 * a10,
      b02 = a00 * a13 - a03 * a10,
      b03 = a01 * a12 - a02 * a11,
      b04 = a01 * a13 - a03 * a11,
      b05 = a02 * a13 - a03 * a12,
      b06 = a20 * a31 - a21 * a30,
      b07 = a20 * a32 - a22 * a30,
      b08 = a20 * a33 - a23 * a30,
      b09 = a21 * a32 - a22 * a31,
      b10 = a21 * a33 - a23 * a31,
      b11 = a22 * a33 - a23 * a32;

    let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 -
      b04 * b07 + b05 * b06;

    if (!det) {
      return null;
    }
    det = 1.0 / det;

    this._m[0][0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    this._m[0][1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    this._m[0][2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    this._m[0][3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    this._m[1][0] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    this._m[1][1] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    this._m[1][2] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    this._m[1][3] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    this._m[2][0] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    this._m[2][1] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    this._m[2][2] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    this._m[2][3] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    this._m[3][0] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    this._m[3][1] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    this._m[3][2] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    this._m[3][3] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return this;
  }

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
    const tx = v.x;
    const ty = v.y;
    const tz = v.z;
    for (let i = 0; i < 4; ++i) {
      this._m[i][3] +=
        tx * this._m[i][0] +
        ty * this._m[i][1] +
        tz * this._m[i][2];
    }
    return this;
  }
}

Matrix4x4.lookAt = function(point, target) {
  return Matrix4x4.calcOrientation(point, Vector.sub(point, target).norm());
}

Matrix4x4.calcOrientation = function(point, tangent) {
  const yaxis = Vector.cross(point, tangent).norm();
  const xaxis = Vector.cross(yaxis, tangent).norm();
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

Matrix4x4.model = function(v, localSpace, modelView, cameraInverse) {
  return Matrix4x4.convertCoord(
    Matrix.mult2DArrays(modelView._m, localSpace._m),
    cameraInverse._m,
    v.to4Array());
}

// TODO Needs testing.
Matrix4x4.screen = function(v, cnvs, projection, modelView) {
  let o = Matrix4x4.convertCoord(modelView._m, projection._m, v.to4Array());
  // o.add(Vector.one);
  // o.scale(0.5);
  o._x * cnvs.width;
  o._y * cnvs.height;
  return o;
}

Matrix4x4.camera = function(position, focus = Vector.zero, up = Vector.up) {
  const forward = Vector.sub(position, focus).norm();
  // Should up be calculated or supplied?
  const right = Vector.cross(up, forward).norm();
  const up2 = Vector.cross(forward, right).norm();
  let result = new Matrix4x4(
    right.x, right.y, right.z, 0,
    up2.x, up2.y, up2.z, 0,
    forward.x, forward.y, forward.z, 0,
    0.0, 0.0, 0.0, 1.0);
  result.translate(Vector.negate(position));
  return result;
}

// TODO Needs testing.
Matrix4x4.frustum = function(left, right, bottom, top,
  near = window.innerHeight * .088602,
  far = window.innerHeight * 8.6602) {
  const n2 = 2 * near;
  const w = right - left;
  const h = top - bottom;
  const d = far - near;
  return new Matrix4x4(
    n2 / w, 0.0, (right + left) / w, 0.0,
    0.0, n2 / h, (top + bottom) / h, 0.0,
    0.0, 0.0, -(far + near) / d, -(n2 * far) / d,
    0.0, 0.0, 1.0, 0.0);
}

// TODO Needs testing, specifically whether bottom is 0 or height, top 0 or height.
Matrix4x4.orthographic = function(left, right, bottom, top,
  near = window.innerHeight * .088602,
  far = window.innerHeight * 8.6602) {
  const w = right - left;
  const h = top - bottom;
  const d = far - near;
  return new Matrix4x4(
    2.0 / w, 0.0, 0.0, -(right + left) / w,
    0.0, 2.0 / h, 0.0, -(top + bottom) / h,
    0.0, 0.0, -2.0 / d, -(far + near) / d,
    0.0, 0.0, 0.0, 1.0);
}

// TODO Needs testing, specifically appropriate near and far.
Matrix4x4.perspective = function(fov = 1.0471975511965976,
  aspect = window.innerWidth / window.innerHeight,
  near = window.innerHeight * .088602,
  far = window.innerHeight * 8.6602) {
  const ymax = near * Math.tan(fov * 0.5);
  const ymaxaspect = ymax * aspect;
  return Matrix4x4.frustum(-ymaxaspect, ymaxaspect, -ymax, ymax, near, far);
}

Matrix4x4.identity = new Matrix4x4(
  1.0, 0.0, 0.0, 0.0,
  0.0, 1.0, 0.0, 0.0,
  0.0, 0.0, 1.0, 0.0,
  0.0, 0.0, 0.0, 1.0);


// TODO Would it be more efficient to cache
// a rotation matrix and then change it when
// a rotation is requested?
// Matrix4x4.rotation = new Matrix4x4(
//   1.0, 0.0, 0.0, 0.0,
//   0.0, 1.0, 0.0, 0.0,
//   0.0, 0.0, 1.0, 0.0,
//   0.0, 0.0, 0.0, 1.0);
