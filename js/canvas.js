'use strict';

class Cnvs {

  constructor(width = Cnvs.defaultWidth, height = Cnvs.defaultHeight, styleWidth = Cnvs.defaultStyleWidth, styleHeight = Cnvs.defaultStyleHeight, imageRendering = Cnvs.defaultImageRendering, renderingContext = Cnvs.defaultRenderingContext, contextAttributes = Cnvs.defaultContextAttributes, imageSmoothing = Cnvs.defaultImageSmoothingEnabled, imageSmoothingQuality = Cnvs.defaultImageSmoothingQuality, cnvsId = Cnvs.defaultCanvasId) {

    // Create DOM element.
    this._cnvs = document.createElement('canvas');

    // Set canvas properties.
    this._cnvs.id = cnvsId;
    this._cnvs.width = this._width = width;
    this._cnvs.height = this._height = height;

    // Set style properties.
    this._cnvs.style.width = this._styleWidth = styleWidth;
    this._cnvs.style.height = this._styleHeight = styleHeight;
    this._cnvs.style.imageRendering = this._imageRendering = imageRendering;

    // Acquire context.
    this._ctx = this._cnvs.getContext(renderingContext, contextAttributes);
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled = imageSmoothing;
    this._ctx.imageSmoothingQuality = this._imageSmoothingQuality = imageSmoothingQuality;

    // Acquire image data.
    this._imgData = this._ctx.getImageData(0, 0, this._width, this._height);
    this._data = this._imgData.data;
    this._buffer = new ArrayBuffer(this._data.length);
    this._buf8 = new Uint8ClampedArray(this._buffer);
    this._data = new Uint32Array(this._buffer);
  }

  get cnvs() {
    return this._cnvs;
  }

  get height() {
    return this._height;
  }

  get imageRendering() {
    return this._imageRendering;
  }

  get imageSmoothingEnabled() {
    return this._imageSmoothing;
  }

  get imageSmoothingQuality() {
    return this._imageSmoothingQuality;
  }

  get styleHeight() {
    return this._styleHeight;
  }

  get styleWidth() {
    return this._styleWidth;
  }

  get width() {
    return this._width;
  }

  set height(v) {
    this._cnvs.height = this._height = v;
    this.updateImageData();
  }

  set imageRendering(v) {
    this._cnvs.style.imageRendering = this._imageRendering = v;
  }

  set imageSmoothingEnabled(v) {
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled = v;
  }

  set imageSmoothingQuality(v) {
    this._ctx.imageSmoothingQuality = this._imageSmoothingQuality = v;
  }

  set styleHeight(v) {
    this._cnvs.style.height = this._styleHeight = v;
  }

  set styleWidth(v) {
    this._cnvs.style.width = this._styleWidth = v;
  }

  set width(v) {
    this._cnvs.width = this._width = v;
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

  updatePixels(buf8) {
    this._imgData.data.set(buf8);
    this._ctx.putImageData(this._imgData, 0, 0);
  }
}

// See https://developer.mozilla.org/en-US/docs/Web/CSS/image-rendering
Cnvs.canvasImageRendering = {
  auto: 'auto',
  crispEdges: 'crisp-edges',
  pixelated: 'pixelated'
}

// See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingEnabled
Cnvs.contextImageSmoothing = {
  enabled: true,
  disabled: false
}

// See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingQuality
Cnvs.contextImageSmoothingQuality = {
  low: 'low',
  medium: 'medium',
  high: 'high'
}

// See https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
Cnvs.renderingContext = {
  bitmapRenderer: 'bitmaprenderer',
  experimentalWebgl: 'experimental-webgl',
  twod: '2d',
  webgl: 'webgl',
  webgl2: 'webgl2'
}

Cnvs.defaultCanvasId = 'canvas';
Cnvs.defaultContextAttributes = {
  alpha: true
};
Cnvs.defaultRenderingContext = Cnvs.renderingContext.twod;
Cnvs.defaultStyleWidth = '100%';
Cnvs.defaultStyleHeight = '100%';
Cnvs.defaultWidth = 512;
Cnvs.defaultHeight = 512;
Cnvs.defaultImageRendering = Cnvs.canvasImageRendering.pixelated;
Cnvs.defaultImageSmoothingEnabled = Cnvs.contextImageSmoothing.disabled;
Cnvs.defaultImageSmoothingQuality = Cnvs.contextImageSmoothingQuality.high;
