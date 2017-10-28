class Vector {
  constructor(x = 0, y = 0, z = 0) {
    this.set(x, y, z);
  }

  get x() {
    return this._x;
  }

  get y() {
    return this._y;
  }

  get z() {
    return this._z;
  }

  set x(v) {
    this._x = v;
  }

  set y(v) {
    this._y = v;
  }

  set z(v) {
    this._z = v;
  }

  add(...vs) {
    let sz = vs.length;
    for (let i = 0; i < sz; ++i) {
      this._x += vs[i].x;
      this._y += vs[i].y;
      this._z += vs[i].z;
    }
    return this;
  }

  angleBetween(v) {
    // Safety check.
    // if ((v._x === 0 && v._y === 0 && v._z === 0) ||
    //   (this._x === 0 && this._y === 0 && this._z === 0)
    // ) {
    //   console.error('Could not find angle. Either first term {0} or second {1} is zero.'
    //     .format(this.toString(), v.toString()));
    //   return 0;
    // }

    return Math.acos(Math.clamp(this.dot(v) / this.dist(v), -1, 1));
  }

  // Was used in creating rotation matrices.
  // applyModel(local, modview, caminv) {
  //   let mv = modview.copy();
  //   mv.mult(local);
  //   return applyLocalModel(mv, caminv);
  // }

  // applyLocalModel(mv, caminv) {
  //   let c = Matrix.dot2DArray1DArray(mv._m, this.to4Array());
  //   let d = Matrix.dot2DArray1DArray(caminv._m, c);
  //   this.from4Array(d);
  //   return this;
  // }

  copy() {
    return new Vector(this._x, this._y, this._z);
  }

  cross(v) {
    let ax = this._x;
    let ay = this._y;
    let az = this._z;
    this._x = ay * b.z - az * b.y;
    this._y = az * b.x - ax * b.z;
    this._z = ax * b.y - ay * b.x;
    return this;
  }

  dist(v) {
    let xdist = v.x - this._x;
    let ydist = v.y - this._y;
    let zdist = v.z - this._z;
    return Math.sqrt(xdist * xdist + ydist * ydist + zdist * zdist);
  }

  distSq(v) {
    let xdist = v.x - this._x;
    let ydist = v.y - this._y;
    let zdist = v.z - this._z;
    return xdist * xdist + ydist * ydist + zdist * zdist;
  }

  dot(v) {
    return this._x * v.x + this._y * v.y + this._z * v.z;
  }

  ease(v, t, func = Math.lerp) {
    if (t <= 0) {
      return;
    } else if (t >= 1) {
      this._x = v.x;
      this._y = v.y;
      this._z = v.z;
    } else {
      this._x = func(this._x, v.x, t);
      this._y = func(this._y, v.x, t);
      this._z = func(this._z, v.x, t);
    }
    return this;
  }

  equals(v, tolerance = Number.EPSILON) {
    if (this === v) {
      return true;
    }
    if (this.constructor.name !== v.constructor.name) {
      return false;
    }
    return this._x.approx(v._x, tolerance) &&
      this._y.approx(v._y, tolerance) &&
      this._z.approx(v._z, tolerance);
  }

  from3Array(arr) {
    this._x = arr[0];
    this._y = arr[1];
    this._z = arr[2];
    return this;
  }

  from4Array(arr) {
    let w = arr[3];
    if (w != 0 && w != 1) {
      this._x = arr[0] / w;
      this._y = arr[1] / w;
      this._z = arr[2] / w;
    } else {
      this._x = arr[0];
      this._y = arr[1];
      this._z = arr[2];
    }
    return this;
  }

  getClass() {
    return this.constructor.name;
  }

  mag() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z);
  }

  magSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z;
  }

  norm() {
    let mag = Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z);
    if (mag != 0 && mag != 1) {
      this._x /= mag;
      this._y /= mag;
      this._z /= mag;
    }
    return this;
  }

  rescale(s) {
    this.norm();
    this._x *= s;
    this._y *= s;
    this._z *= s;
    return this;
  }

  // RETAIN.
  reset() {
    this._x = 0.0;
    this._y = 0.0;
    this._z = 0.0;
    return this;
  }

  rotateZ(a) {
    let xt = this._x;
    let cs = Math.cos(a);
    let sn = Math.sin(a);
    this._x = xt * cs - this._y * sn;
    this._y = xt * sn + this._y * cs;
  }

  scale(s) {
    this._x *= s;
    this._y *= s;
    this._z *= s;
    return this;
  }

  set(x, y, z = 0) {
    this._x = x;
    this._y = y;
    this._z = z;
    return this;
  }

  sub(...vs) {
    let sz = vs.length;
    for (let i = 0; i < sz; ++i) {
      this._x -= vs[i].x;
      this._y -= vs[i].y;
      this._z -= vs[i].z;
    }
    return this;
  }

  to3Array() {
    return [this._x, this._y, this._z];
  }

  to4Array() {
    return [this._x, this._y, this._z, 1];
  }

  toString(pr = 2) {
    return '[' + this._x.toFixed(pr) + ', ' +
      this._y.toFixed(pr) + ', ' +
      this._z.toFixed(pr) + ']';
  }
}

Vector.add = function(...vs) {
  let sz = vs.length;
  if (sz === 0) {
    return undefined;
  } else if (sz === 1) {
    return vs[0];
  }

  let x = 0;
  let y = 0;
  let z = 0;
  for (let i = 0; i < sz; ++i) {
    x += vs[i].x;
    y += vs[i].y;
    z += vs[i].z;
  }
  return new Vector(x, y, z);
}

Vector.angleBetween = function(a, b) {
  if (a.equals(Vector.zero) || b.equals(Vector.zero)) {
    console.error('Could not find angle. Either first term {0} or second {1} is zero.'
      .format(a.toString(), b.toString()));
    return 0;
  }
  return Math.acos(Math.clamp(Vector.dot(a, b) / Vector.dist(a, b), -1, 1));
}

Vector.copy = function(v) {
  return v.copy();
}

Vector.cross = function(a, b) {
  return new Vector(a.y * b.z - a.z * b.y,
    a.z * b.x - a.x * b.z,
    a.x * b.y - a.y * b.x);
}

Vector.dist = function(a, b) {
  let xdist = a.x - b.x;
  let ydist = a.y - b.y;
  let zdist = a.z - b.z;
  return Math.sqrt(xdist * xdist + ydist * ydist + zdist * zdist);
}

Vector.distSq = function(a, b) {
  let xdist = a.x - b.x;
  let ydist = a.y - b.y;
  let zdist = a.z - b.z;
  return xdist * xdist + ydist * ydist + zdist * zdist;
}

Vector.dot = function(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

Vector.ease = function(a, b, t, func = Math.lerp) {
  if (t <= 0) {
    return a.copy();
  } else if (t >= 1) {
    return b.copy();
  }
  return new Vector(func(a.x, b.x, t),
    func(a.y, b.y, t),
    func(a.z, b.z, t));
}

Vector.easeArray = function(arr, t, func = Math.lerp) {
  let sz = arr.length;
  if (sz === 0) {
    console.error('Length of vector array is 0.');
    return undefined;
  } else if (sz === 1 || t <= 0) {
    return arr[0].copy();
  } else if (t >= 1) {
    return arr[sz - 1].copy();
  }
  let sclt = t * (sz - 1);
  let i = Math.floor(sclt);
  return Vector.ease(arr[i], arr[i + 1], sclt - i, func);
}

Vector.from3Array = function(arr) {
  return new Vector(arr[0], arr[1], arr[2]);
}

Vector.from4Array = function(arr) {
  let w = arr[3];
  if (w != 0 && w != 1) {
    return new Vector(arr[0] / w, arr[1] / w, arr[2] / w);
  }
  return new Vector(arr[0], arr[1], arr[2]);
}

Vector.mag = function(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

Vector.magComparator = function(a, b) {
  let am = a.magSq();
  let bm = b.magSq();
  return am > bm ? 1 : am < bm ? -1 : 0;
}

Vector.magSq = function(v) {
  return v.x * v.x + v.y * v.y + v.z * v.z;
}

Vector.norm = function(v) {
  return v.copy().norm();
}

Vector.random = function(minx = -1, maxx = 1,
  miny = -1, maxy = 1,
  minz = -1, maxz = 1) {
  return new Vector(Math.randomRange(minx, maxx),
    Math.randomRange(miny, maxy),
    Math.randomRange(minz, maxz));
}

Vector.rescale = function(v, s) {
  return v.copy().norm().scale(s);
}

Vector.rotateX = function(v, a) {
  let cos = Math.cos(a);
  let sin = Math.sin(a);
  return new Vector(
    v.x * cos - v.y * sin,
    v.x * sin + v.y * cos,
    v.z);
}

Vector.scale = function(v, s) {
  return v.copy().scale(s);
}

Vector.sort1DArray = function(arr, comparator = Vector.defaultComparator) {
  arr.sort(comparator);
  return arr;
}

Vector.sub = function(a, ...b) {
  let sz = b.length;
  if (sz === 0) {
    return a.copy();
  }
  let c = a.copy();
  for (let i = 0; i < sz; ++i) {
    c.x -= b[i].x;
    c.y -= b[i].y;
    c.z -= b[i].z;
  }
  return c;
}

Vector.toArray = function(v) {
  return [v.x, v.y, v.z];
}

Vector.xComparator = function(a, b) {
  return a.x > b.x ? 1 : a.x < b.x ? -1 : 0;
}

Vector.xyComparator = function(a, b) {
  return a.x > b.x ? 1 : a.x < b.x ? -1 :
    a.y > b.y ? 1 : a.y < b.y ? -1 : 0;
}

Vector.yComparator = function(a, b) {
  return a.y > b.y ? 1 : a.y < b.y ? -1 : 0;
}

Vector.yxComparator = function(a, b) {
  return a.y > b.y ? 1 : a.y < b.y ? -1 :
    a.x > b.x ? 1 : a.x < b.x ? -1 : 0;
}

Vector.zComparator = function(a, b) {
  return a.z > b.z ? 1 : a.z < b.z ? -1 : 0;
}

Vector.zyxComparator = function(a, b) {
  return a.z > b.z ? 1 : a.z < b.z ? -1 :
    a.y > b.y ? 1 : a.y < b.y ? -1 :
    a.x > b.x ? 1 : a.x < b.x ? -1 : 0;
}

Vector.zxyComparator = function(a, b) {
  return a.z > b.z ? 1 : a.z < b.z ? -1 :
    a.x > b.x ? 1 : a.x < b.x ? -1 :
    a.y > b.y ? 1 : a.y < b.y ? -1 : 0;
}

Vector.defaultComparator = Vector.zyxComparator;

Vector.backward = new Vector(0, 0, -1);
Vector.down = new Vector(0, -1, 0);
Vector.forward = new Vector(0, 0, 1);
Vector.left = new Vector(-1, 0, 0);
Vector.one = new Vector(1, 1, 1);
Vector.right = new Vector(1, 0, 0);
Vector.up = new Vector(0, 1, 0);
Vector.zero = new Vector(0, 0, 0);
