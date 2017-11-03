'use strict';

class Vector {
  constructor(x = 0, y = 0, z = 0) {
    this._x = x;
    this._y = y;
    this._z = z;
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
    const sz = vs.length;
    for (let i = 0; i < sz; ++i) {
      this._x += vs[i].x;
      this._y += vs[i].y;
      this._z += vs[i].z;
    }
    return this;
  }

  /**
   * Measures the angle between this vector and another.
   * Neither this nor the vector supplied should be < 0, 0, 0 >.
   *
   * @param {Vector} v
   * @returns {Number} the Euler angle, in radians
   */
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

  /**
   * Sets this vector to the dot product of itself - as a 1x4 array -
   * and a 4x4 Matrix.
   *
   * @param {Matrix4x4} m
   * @returns {Vector} this
   * @chainable
   */
  applyMatrix(m) {
    return this.apply2DArray(m._m);
  }

  /**
   * Sets this vector to the dot product of itself - as a 1x4 array -
   * and a 4x4 array.
   *
   * @param {Array} arr a 4x4 array
   * @returns {Vector} this
   * @chainable
   */
  apply2DArray(arr) {
    this.from4Array(Matrix.dot2DArray1DArray(arr, this.to4Array()));
    return this;
  }

  /**
   * Raises each vector component to the next integer.
   *
   * @returns {Vector} this
   * @chainable
   */
  ceil() {
    this._x = Math.ceil(this._x);
    this._y = Math.ceil(this._y);
    this._z = Math.ceil(this._z);
    return this;
  }

  /**
   * Returns a copy of this vector.
   *
   * @returns {Vector} a new vector with the same components as this.
   * @chainable
   */
  copy() {
    return new Vector(this._x, this._y, this._z);
  }

  /**
   * @param {Vector} v
   * @returns {Vector} this
   * @chainable
   */
  cross(v) {
    const ax = this._x;
    const ay = this._y;
    const az = this._z;
    this._x = ay * b.z - az * b.y;
    this._y = az * b.x - ax * b.z;
    this._z = ax * b.y - ay * b.x;
    return this;
  }

  /**
   * Calculates straight-line distance with Pythagorean theorem.
   * Uses Math.sqrt, which is expensive. Where possible, use
   * distance-squared instead.
   *
   * @param {Vector} v
   * @returns {Number} distance
   */
  dist(v) {
    const xdist = v.x - this._x;
    const ydist = v.y - this._y;
    const zdist = v.z - this._z;
    return Math.sqrt(xdist * xdist + ydist * ydist + zdist * zdist);
  }

  /**
   * Calculates straight-line distance with Pythagorean theorem.
   *
   * @param {Vector} v
   * @returns {Number} distance-squared
   */
  distSq(v) {
    const xdist = v.x - this._x;
    const ydist = v.y - this._y;
    const zdist = v.z - this._z;
    return xdist * xdist + ydist * ydist + zdist * zdist;
  }

  /**
   * Sums the products of each element of the vector (the dot product).
   *
   * @param {Vector} v
   * @returns {Number} dot product
   */
  dot(v) {
    return this._x * v.x + this._y * v.y + this._z * v.z;
  }

  /**
   * Eases the vector toward another by a given percent.
   *
   * @param {Vector} v destination
   * @param {Number} t the step by which to ease, in a range of 0 .. 1.
   * @param {Function} func the easing function, default Math.lerp
   * @returns {Vector} this
   * @chainable
   */
  ease(v, t, func = Math.lerp) {
    if (t <= 0) {
      return this;
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

  /**
   *
   * @returns {Vector} this
   * @chainable
   */
  floor() {
    this._x = Math.floor(this._x);
    this._y = Math.floor(this._y);
    this._z = Math.floor(this._z);
    return this;
  }

  /**
   * Sets the vector components to array elements, where
   * <x, y, z> := [0, 1, 2]
   *
   * @param {Array} arr source array, 3 elements long
   * @returns {Vector} this
   * @chainable
   */
  from3Array(arr) {
    this._x = arr[0];
    this._y = arr[1];
    this._z = arr[2];
    return this;
  }

  /**
   * Sets the vector components to array elements, where
   * the array is assumed to be the product of matrix
   * operations and arr[3] is the w or identity component
   * of the vector. Where w is not equal to 1, all other
   * components are divided by w.
   *
   * @param {Array} arr source array, 4 elements long
   * @returns this
   * @chainable
   */
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

  /**
   * Returns the constructor name of the class as a String, "Vector".
   *
   * @returns {String} the constructor name
   */
  getClass() {
    return this.constructor.name;
  }

  /**
   *
   * @returns {Vector} this
   * @chainable
   */
  invert() {
    this._x = 1.0 / this._x;
    this._y = 1.0 / this._y;
    this._z = 1.0 / this._z;
    return this;
  }

  /**
   * If the magitude of the vector exceeds the limit, then the vector
   * is normalized and rescaled to the limit.
   *
   * @param {Number} max limit to the vector's magnitude.
   * @returns {Vector} this
   * @chainable
   */
  limit(max) {
    let mag = this._x * this._x + this._y * this._y + this._z * this._z;
    if (mag > max * max) {

      // Normalize
      if (mag != 0 && mag != 1) {
        mag = Math.sqrt(mag);
        this._x /= mag;
        this._y /= mag;
        this._z /= mag;
      }

      // Scale
      this._x *= max;
      this._y *= max;
      this._z *= max;
    }
    return this;
  }

  mag() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z);
  }

  magSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z;
  }

  /**
   * Switches the sign of each vector component.
   *
   * @returns {Vector} this
   * @chainable
   */
  negate() {
    this._x = -this._x;
    this._y = -this._y;
    this._z = -this._z;
    return this;
  }

  /**
   *
   * @returns {Vector} this
   * @chainable
   */
  norm() {
    let mag = this._x * this._x + this._y * this._y + this._z * this._z;
    if (mag != 0 && mag != 1) {
      mag = Math.sqrt(mag);
      this._x /= mag;
      this._y /= mag;
      this._z /= mag;
    }
    return this;
  }

  /**
   *
   * @returns {Vector} this
   * @chainable
   */
  rescale(s) {
    let mag = this._x * this._x + this._y * this._y + this._z * this._z;
    if (mag != 0 && mag != 1) {
      mag = Math.sqrt(mag);
      this._x /= mag;
      this._y /= mag;
      this._z /= mag;
    }
    this._x *= s;
    this._y *= s;
    this._z *= s;
    return this;
  }

  /**
   *
   * @returns {Vector} this
   * @chainable
   */
  reset() {
    this._x = 0.0;
    this._y = 0.0;
    this._z = 0.0;
    return this;
  }

  /**
   * Rotates this vector by an angle along an axis.
   * Neither this nor the vector supplied should be < 0, 0, 0 >.
   * The axis vector should be normalized.
   *
   * @param {Number} a the Euler angle, in radians
   * @param {Vector} axis the normalized, non-zero vector
   * @returns {Vector} this
   */
  rotate(a, axis) {
    // Safety check 1.
    // if ((axis._x === 0 && axis._y === 0 && axis._z === 0) ||
    //   (this._x === 0 && this._y === 0 && this._z === 0)) {
    //   console.error('Cannot rotate by zero vector.');
    //   return;
    // }

    // Safety check 2.
    // if(Math.abs(v.magSq() - 1) > Number.EPSILON) {
    //   v.norm();
    // }

    const c = Math.cos(a);
    const s = Math.sin(a);
    const t = 1.0 - c;

    const x = axis.x;
    const y = axis.y;
    const z = axis.z;

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
    const xt = this._x;
    this._x = xt * cos - this._y * sin;
    this._y = xt * sin + this._y * cos;
    return this;

    /* Rotation matrix not necessary.
     *     [[cos, -sin, 0.0, 0.0],
     *     [sin, cos, 0.0, 0.0],
     *     [0.0, 0.0, 1.0, 0.0],
     *     [0.0, 0.0, 0.0, 1.0]]
     */
  }

  /**
   *
   * @returns {Vector} this
   * @chainable
   */
  round() {
    this._x = Math.round(this._x);
    this._y = Math.round(this._y);
    this._z = Math.round(this._z);
    return this;
  }

  /**
   * Multiplies the x, y and z component of the vector by a scalar.
   *
   * @param {Number} s the scalar value
   * @returns {Vector} this
   * @chainable
   */
  scale(s) {
    this._x *= s;
    this._y *= s;
    this._z *= s;
    return this;
  }

  /**
   * Sets the x, y and z components of the vector.
   *
   * @param {Number} x
   * @param {Number} y
   * @param {Number} z
   * @returns {Vector} this
   */
  set(x, y, z = 0) {
    this._x = x;
    this._y = y;
    this._z = z;
    return this;
  }

  sub(...vs) {
    const sz = vs.length;
    for (let i = 0; i < sz; ++i) {
      this._x -= vs[i].x;
      this._y -= vs[i].y;
      this._z -= vs[i].z;
    }
    return this;
  }

  /**
   * Returns a one-dimensional array with 4 elements: [x, y, z, w], where w = 1.
   * Used in matrix-vector operations.
   *
   * @returns {Array} [x, y, z, w = 1]
   */
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
  const sz = vs.length;
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
  // Safety check.
  // if ((a._x === 0 && a._y === 0 && a._z === 0) ||
  //   (b._x === 0 && b._y === 0 && b._z === 0)) {
  //   console.error('Could not find angle. Either first term {0} or second {1} is zero.'
  //     .format(a.toString(), b.toString()));
  //   return 0;
  // }
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
  const xdist = a.x - b.x;
  const ydist = a.y - b.y;
  const zdist = a.z - b.z;
  return Math.sqrt(xdist * xdist + ydist * ydist + zdist * zdist);
}

Vector.distSq = function(a, b) {
  const xdist = a.x - b.x;
  const ydist = a.y - b.y;
  const zdist = a.z - b.z;
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
  const sz = arr.length;
  // if (sz === 0) {
  //   console.error('Length of vector array is 0.');
  //   return undefined;
  // } else
  if (sz === 1 || t <= 0) {
    return arr[0].copy();
  } else if (t >= 1) {
    return arr[sz - 1].copy();
  }
  const sclt = t * (sz - 1);
  const i = Math.floor(sclt);
  return Vector.ease(arr[i], arr[i + 1], sclt - i, func);
}

Vector.from3Array = function(arr) {
  return new Vector(arr[0], arr[1], arr[2]);
}

Vector.from4Array = function(arr) {
  const w = arr[3];
  if (w != 0 && w != 1) {
    return new Vector(arr[0] / w, arr[1] / w, arr[2] / w);
  }
  return new Vector(arr[0], arr[1], arr[2]);
}

/**
 * When phi equals PI / 2, 3D and 2D polar coordinates are the same, as sin(phi) = 1.
 * References: Lengyel, Mathematics for 3D Game Programming, 3d. ed., pps. 516 - 519
 * Three.js THREE.Vector3.setFromSpherical
 * @param {Number} theta θ azimuth, longitude, in a range 0 .. 2PI
 * @param {Number} phi φ inclination, polar angle, latitude, in a range 0 .. PI
 * @param {Number} radius scalar by which to multiply the vector's components
 * @param {Vector} offset offset to add to the vector's components
 * @returns {Vector} a new vector
 */
Vector.fromAngle = function(theta, phi = Math.HALF_PI, radius = 1.0, offset = Vector.zero) {
  const sinphirad = Math.sin(phi) * radius;
  return new Vector(offset.x + Math.cos(theta) * sinphirad,
    offset.y + Math.sin(theta) * sinphirad,
    offset.z + Math.cos(phi) * radius);
}

Vector.mag = function(v) {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

Vector.magComparator = function(a, b) {
  const am = a.magSq();
  const bm = b.magSq();
  return am > bm ? 1 : am < bm ? -1 : 0;
}

Vector.magSq = function(v) {
  return v.x * v.x + v.y * v.y + v.z * v.z;
}

Vector.negate = function(v) {
  return new Vector(-v.x, -v.y, -v.z);
}

Vector.norm = function(v) {
  return v.copy().norm();
}

Vector.randomCartesian = function(minx = -1, maxx = 1,
  miny = -1, maxy = 1,
  minz = -1, maxz = 1) {
  return new Vector(Math.randomRange(minx, maxx),
    Math.randomRange(miny, maxy),
    Math.randomRange(minz, maxz));
}

Vector.randomPolar = function(mintheta = 0, maxtheta = Math.TWO_PI,
  minphi = 0, maxphi = Math.PI,
  radius = 1.0, offset = Vector.zero) {
  return Vector.fromAngle(
    Math.randomRange(mintheta, maxtheta),
    Math.randomRange(minphi, maxphi),
    radius, offset);
}

/**
 * Alias
 */
Vector.random = Vector.randomCartesian;

Vector.rescale = function(v, s) {
  return v.copy().norm().scale(s);
}

Vector.scale = function(v, s) {
  return v.copy().scale(s);
}

Vector.sort1DArray = function(arr, comparator = Vector.defaultComparator) {
  arr.sort(comparator);
  return arr;
}

Vector.sub = function(a, ...b) {
  const sz = b.length;
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

Vector.to4Array = function(v) {
  return [v.x, v.y, v.z, 1];
}

/**
 * Sorting comparators.
 */

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
