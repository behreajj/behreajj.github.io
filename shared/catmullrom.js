class Catmull {
  constructor(s) {
    let t = 1 - s;
    let u = (s - 1) * .5;
    let v = t * .5;
    this._basis = new Matrix4x4(
      u, (s + 3) * .5, (-3 - s) * .5, v,
      t, (-5 - s) * .5, s + 2.0, u,
      u, 0.0, v, 0.0,
      0.0, 1.0, 0.0, 0.0);
  }
}
