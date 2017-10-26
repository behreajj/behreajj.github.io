class Matrix3x3 extends Matrix {
  constructor(
    m00 = 1, m01 = 0, m02 = 0,
    m10 = 0, m11 = 1, m12 = 0,
    m20 = 0, m21 = 0, m22 = 1) {
    super(m00, m01, m02,
      m10, m11, m12,
      m20, m21, m22);
  }

  draw(ctx,
    tanScale = ObjMatrix.defaultDrawScale,
    binormScale = ObjMatrix.defaultDrawScale,
    tanLineWidth = ObjMatrix.defaultLineWidth,
    binormLineWidth = ObjMatrix.defaultLineWidth,
    tanStrokeStyle = ObjMatrix.defaultXAxisColor,
    binormStrokeStyle = ObjMatrix.defaultYAxisColor) {
    let x = this._m[0][2];
    let y = this._m[1][2];
    let w = this._m[2][2];

    if (w != 0 && w != 1) {
      tanScale /= w;
      binormScale /= w;
    }

    // X Axis
    ctx.lineWidth = tanLineWidth;
    ctx.strokeStyle = tanStrokeStyle;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + this._m[0][0] * tanScale, y + this._m[1][0] * tanScale);
    ctx.closePath();
    ctx.stroke();

    // Y Axis
    ctx.lineWidth = binormLineWidth;
    ctx.strokeStyle = binormStrokeStyle;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + this._m[0][1] * binormScale, y + this._m[1][1] * binormScale);
    ctx.closePath();
    ctx.stroke();
  }

  copy() {
    return new Matrix3x3(
      this._m[0][0], this._m[0][1], this._m[0][2],
      this._m[1][0], this._m[1][1], this._m[1][2],
      this._m[2][0], this._m[2][1], this._m[2][2]);
  }

  getClass() {
    return this.constructor.name;
  }

  set(m00 = 1, m01 = 0, m02 = 0,
    m10 = 0, m11 = 1, m12 = 0,
    m20 = 0, m21 = 0, m22 = 1) {
    this._m[0][0] = m00;
    this._m[0][1] = m01;
    this._m[0][2] = m02;
    this._m[1][0] = m10;
    this._m[1][1] = m11;
    this._m[1][2] = m12;
    this._m[2][0] = m20;
    this._m[2][1] = m21;
    this._m[2][2] = m22;
  }

  toCss() {
    return 'matrix(' +
      this._m[0][0] + ', ' + this._m[1][0] + ', ' +
      this._m[0][1] + ', ' + this._m[1][1] + ', ' +
      this._m[0][2] + ', ' + this._m[1][2] + ')';
  }
}

Matrix3x3.identity = new Matrix3x3(
  1, 0, 0,
  0, 1, 0,
  0, 0, 1);
