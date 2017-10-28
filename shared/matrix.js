'use strict';

class Matrix {
  // Allows you to construct a blank or empty array.
  constructor(...vs) {
    this._m = [];
    if (vs.length > 3) {
      this._m = Matrix.convert1DArrayTo2DArray(vs);
    }
  }

  add(n) {
    for (let i = 0, sz = this._m.length, j; i < sz; ++i) {
      for (j = 0; j < sz; ++j) {
        this._m[i][j] += n._m[i][j];
      }
    }
  }

  copy() {
    let n = new Matrix();
    n._m = Matrix.copy2DArray(this._m);
    return n;
  }

  // TODO Needs testing.
  equals(m, tolerance = Number.EPSILON) {
    if (this === v) {
      return true;
    }

    if (this.constructor.name !== m.constructor.name) {
      return false;
    }

    let sz = this._m.length;
    if (sz !== m._m.length) {
      return false;
    }

    for (let i = 0, j; i < sz; ++i) {
      for (j = 0; j < sz; ++j) {
        if (!this._m[i][j].approx(m._m[i][j], tolerance)) {
          return false;
        }
      }
    }
    return true;
  }

  from16Array(arr) {
    this._m = Matrix.convert1DArrayTo2DArray(arr);
    return this;
  }

  from4x4Array(arr) {
    this._m = Matrix.copy2DArray(arr);
    return this;
  }

  getClass() {
    return this.constructor.name;
  }

  getColAsArray(j) {
    return Matrix.getColFrom2DArray(this._m, j);
  }

  getRowAsArray(i) {
    return Matrix.copy1DArray(this._m[i]);
  }

  scale(v) {
    for (let i = 0, sz = this._m.length, j; i < sz; ++i) {
      for (j = 0; j < sz; ++j) {
        this._m[i][j] *= v;
      }
    }
  }

  mult(n) {
    this._m = Matrix.mult2DArrays(this._m, n._m);
    return this;
  }

  setCol(j, ...vs) {
    let sz = this._m.length;
    if (vs.length === sz) {
      for (let i = 0; i < sz; ++i) {
        this._m[i][j] = vs[i];
      }
    } else {
      console.error('Array length mismatch.');
    }
    return this;
  }

  setRow(i, ...vs) {
    let sz = this._m[i].length;
    if (vs.length === sz) {
      this._m[i] = vs;
    } else {
      console.error('Array length mismatch.');
    }
    return this;
  }

  printTable() {
    console.table(this._m);
  }

  to1DArray() {
    return Matrix.convert2DArrayTo1DArray(this._m);
  }

  to2DArray() {
    return Matrix.copy2DArray(this._m);
  }

  toString(pr = Matrix.defaultToStringFixed) {
    return Matrix.toString2DArray(this._m, pr);
  }

  transpose() {
    this._m = Matrix.transpose2DArray(this._m);
    return this;
  }
}

Matrix.add2DArrays = function(m, n) {
  let sz = m.length;
  let result = [];
  for (let i = 0, j; i < sz; ++i) {
    result.push([]);
    for (j = 0; j < sz; ++j) {
      result[i].push(m[i][j] + n[i][j]);
    }
  }
  return result;
}

Matrix.convert2DArrayTo1DArray = function(arr) {
  let result = [];
  for (let i = 0, sz = arr.length, j; i < sz; ++i) {
    for (j = 0; j < sz; ++j) {
      result.push(arr[i][j]);
    }
  }
  return result;
}

Matrix.convert1DArrayTo2DArray = function(arr) {

  // Safety check.
  // if (!Matrix.is1DArraySquare(arr)) {
  //   throw 'An array of length' +
  //     arr.length +
  //     'cannot form a uniform matrix, as its square root is not an integer: ' +
  //     sz + '.';
  // }

  let result = [];
  for (let k = 0, i = 0, sz = arr.length, j; i < sz; ++i) {
    result.push([]);
    for (j = 0; j < sz; ++j, ++k) {
      result[i].push(arr[k]);
    }
  }
  return result;
}

Matrix.copy1DArray = function(arr) {
  let result = [];
  for (let i = 0, sz = arr.length; i < sz; ++i) {
    result.push(0.0);
    result[i] += arr[i];
  }
  return result;
}

Matrix.copy2DArray = function(arr) {
  let result = [];
  for (let i = 0, sz = arr.length, j; i < sz; ++i) {
    result.push([]);
    for (j = 0; j < sz; ++j) {
      result[i].push(0.0);
      result[i][j] += arr[i][j];
    }
  }
  return result;
}

Matrix.dot1DArrays = function(a, b) {
  // Safety check a.length === b.length.
  let sum = 0;
  for (let i = 0, sz = a.length; i < sz; ++i) {
    sum += a[i] * b[i];
  }
  return sum;
}

Matrix.dot2DArray1DArray = function(arr2d, arr1d) {
  let result = [];
  // Safety check: a.length === b.length;
  for (let i = 0, sz = arr2d.length, j; i < sz; ++i) {
    result.push(0);
    for (j = 0; j < sz; ++j) {
      result[i] += arr2d[i][j] * arr1d[j];
    }
  }
  return result;
}

Matrix.getColFrom2DArray = function(arr, j) {
  let result = [];
  for (let i = 0, h = arr.length; i < h; ++i) {
    result.push(arr[i][j]);
  }
  return result;
}

Matrix.is1DArraySquare = function(arr) {
  return Number.isInteger(Math.sqrt(arr.length));
}

Matrix.mult2DArrays = function(m, n) {
  let result = [];
  for (let i = 0, sz = m.length, j; i < sz; ++i) {
    result.push([]);
    for (j = 0; j < sz; ++j) {
      result[i].push(Matrix.dot1DArrays(m[j], n[i]));
    }
  }
  return result;
}

Matrix.toString2DArray = function(arr, pr = Matrix.defaultToStringFixed) {
  let result = '[';
  for (let i = 0, sz = arr.length, szc = sz - 1, j; i < sz; ++i) {
    result += '['
    for (j = 0; j < sz; ++j) {
      result += arr[i][j].toFixed(pr);
      if (j < szc) {
        result += ', ';
      }
    }
    result += ']';
    if (i < szc) {
      result += ', ';
    }
  }
  result += ']';
  return result;
}

Matrix.transpose2DArray = function(arr) {
  let result = [];
  for (let i = 0, sz = arr.length, j; i < sz; ++i) {
    result.push([]);
    for (j = 0; j < sz; ++j) {
      result[i].push(arr[j][i]);
    }
  }
  return result;
}

Matrix.defaultDrawScale = 25;
Matrix.defaultLineWidth = .5;
Matrix.defaultXAxisColor = '#f00';
Matrix.defaultYAxisColor = '#0f0';
Matrix.defaultZAxisColor = '#00f';
Matrix.defaultToStringFixed = 2;
