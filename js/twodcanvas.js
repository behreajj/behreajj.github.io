'use strict';

class TwoDCnvs extends Cnvs {
  constructor(width = Cnvs.defaultWidth,
    height = Cnvs.defaultHeight,
    styleWidth = Cnvs.defaultStyleWidth,
    styleHeight = Cnvs.defaultStyleHeight,
    imageRendering = Cnvs.defaultImageRendering,
    contextAttributes = Cnvs.defaultContextAttributes,
    imageSmoothing = Cnvs.defaultImageSmoothingEnabled,
    imageSmoothingQuality = Cnvs.defaultImageSmoothingQuality,
    cnvsId = Cnvs.defaultCanvasId) {

    super(width, height, styleWidth, styleHeight, imageRendering, Cnvs.renderingContext.twod, contextAttributes, imageSmoothing, imageSmoothingQuality, cnvsId);

    // Acquire image data.
    this._imgData = this._ctx.getImageData(0, 0, this._width, this._height);
    this._data = this._imgData.data;
    this._buffer = new ArrayBuffer(this._data.length);
    this._buf8 = new Uint8ClampedArray(this._buffer);
    this._data = new Uint32Array(this._buffer);
  }

  get height() {
    return this._height;
  }

  get width() {
    return this._width;
  }

  set height(v) {
    this._cnvs.height = this._height = v;
    this.updateImageData();
  }

  set width(v) {
    this._cnvs.width = this._width = v;
    this.updateImageData();
  }

  resize(w, h, styleW = this._style.width, styleH = this._style.height) {
    this._cnvs.width = this._width = w;
    this._cnvs.height = this._height = h;
    this._style.width = styleW;
    this._style.height = styleH;
    this.updateImageData();
  }

  getDataLength() {
    return this._imgData.data.length;
  }

  getPixelAsCompositeBigEndian(index) {
    let px = this.pixelAsArray32(index);
    return ColorUtils.color32BigEndian(px[0], px[1], px[2], px[3]);
  }

  getPixelAsCompositeLittleEndian(index) {
    let px = this.pixelAsArray32(index);
    return ColorUtils.color32LittleEndian(px[0], px[1], px[2], px[3]);
  }

  getPixelAsArray32(index) {
    let i = index * 4;
    return [this._data[i], this._data[i + 1], this._data[i + 2], this._data[i + 3]];
  }

  updateImageData() {
    this._imgData = this._ctx.getImageData(0, 0, this._width, this._height);
    this._data = this._imgData.data;
  }

  updatePixels(buf8, imgData = this._imgData) {
    this._imgData.data.set(buf8);
    this._ctx.putImageData(imgData, 0, 0);
  }
}
