'use strict';

class Matrix {
  constructor(...vs) {
    this.from1DArray(vs);
  }

  from1DArray(vs) {
    let sqrt = Math.sqrt(vs.length);

    // Safety check.
    if(!Number.isInteger(sqrt)) {
      throw 'An array of length {0} cannot form a uniform matrix, as its square root is not an integer: {1}.'.format(vs.length, sqrt);
    }

    this._m = [];
    for (let k = 0, i = 0, j; i < sqrt; ++i) {
      this._m.push([]);
      for (j = 0; j < sqrt; ++j, ++k) {
        this._m[i].push(vs[k]);
      }
    }
  }
  
  getClass() {
    return this.constructor.name;
  }

  getColAsArray(j) {
    let result = [];
    for (let i = 0, h = this._m.length; i < h; ++i) {
      result.push(this._m[i][j]);
    }
    return result;
  }

  getColAsVector(j) {
    let arr = this.getColAsArray(j);
    let v = new Vector(arr[0], arr[1], arr[2]);
    let sz = arr.length;
    if (sz === 4) {
      let w = this._m[3][3];
      if (w !== 0 && w !== 1) {
        v.x /= w;
        v.y /= w;
        v.z /= w;
      }
    } else if (sz == 3) {
      if (v.z !== 0 && v.z !== 1) {
        v.x /= v.z;
        v.y /= v.z;
      }
      v.z = 0;
    }
    return v;
  }

  getRowAsArray(i) {
    let result = [];
    for (let j = 0, w = this._m[i].length; j < w; ++j) {
      result.push(this._m[i][j]);
    }
    return result;
  }

  getRowAsVector(i) {
    let arr = this.getRowAsArray(i);
    let v = new Vector(arr[0], arr[1], arr[2]);
    let sz = arr.length;
    if (sz === 4) {
      let w = this._m[3][3];
      if (w !== 0 && w !== 1) {
        v.x /= w;
        v.y /= w;
        v.z /= w;
      }
    } else if (sz == 3) {
      if (v.z !== 0 && v.z !== 1) {
        v.x /= v.z;
        v.y /= v.z;
      }
      v.z = 0;
    }
    return v;
  }

  printTable() {
    console.table(this._m);
  }

  to1DArray() {
    let result = [];
    for (let i = 0, h = this._m.length; i < h; ++i) {
      for (let j = 0, w = this._m[i].length; j < w; ++j) {
        result.push(this._m[i][j]);
      }
    }
    return result;
  }

  to2DArray() {
    let result = [];
    for (let i = 0, h = this._m.length; i < h; ++i) {
      result.push([]);
      for (let j = 0, w = this._m[i].length; j < w; ++j) {
        result[i].push(this._m[i][j]);
      }
    }
    return result;
  }

  toString(pr = 2) {
    let result = '[';
    for (let i = 0, h = this._m.length; i < h; ++i) {
      result += '['
      for (let j = 0, w = this._m[i].length; j < w; ++j) {
        result += this._m[i][j].toFixed(pr);
        if (j < w - 1) {
          result += ', ';
        }
      }
      result += ']';
      if (i < h - 1) {
        result += ', ';
      }
    }
    result += ']';
    return result;
  }
}

Matrix.defaultDrawScale = 25;
Matrix.defaultLineWidth = .5;
// Matrix.defaultDrawAlpha = .75;
// Matrix.defaultXAxisColor = 'rgba(255, 0, 0,' + Matrix.defaultDrawAlpha + ')';
// Matrix.defaultYAxisColor = 'rgba(0, 255, 0,' + Matrix.defaultDrawAlpha + ')';
// Matrix.defaultZAxisColor = 'rgba(0, 0, 255,' + Matrix.defaultDrawAlpha + ')';
Matrix.defaultXAxisColor = '#f00';
Matrix.defaultYAxisColor = '#0f0';
Matrix.defaultZAxisColor = '#00f';
