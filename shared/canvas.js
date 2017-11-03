'use strict';

class Cnvs {

  constructor(width = Cnvs.defaultWidth,
    height = Cnvs.defaultHeight,
    styleWidth = Cnvs.defaultStyleWidth,
    styleHeight = Cnvs.defaultStyleHeight,
    imageRendering = Cnvs.defaultImageRendering,
    renderingContext = Cnvs.defaultRenderingContext,
    contextAttributes = Cnvs.defaultContextAttributes,
    imageSmoothing = Cnvs.defaultImageSmoothingEnabled,
    imageSmoothingQuality = Cnvs.defaultImageSmoothingQuality,
    cnvsId = Cnvs.defaultCanvasId) {

    // Create DOM element.
    this._cnvs = document.createElement('canvas');

    // Set canvas properties.
    this._cnvs.id = cnvsId;
    this._cnvs.width = this._width = width;
    this._cnvs.height = this._height = height;

    // Set style properties.
    this._style = this._cnvs.style;
    this._style.width = styleWidth;
    this._style.height = styleHeight;
    this._cnvs.style.imageRendering = this._imageRendering = imageRendering;

    // Acquire context.
    this._ctx = this._cnvs.getContext(renderingContext, contextAttributes);
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled = imageSmoothing;
    this._ctx.imageSmoothingQuality = this._imageSmoothingQuality = imageSmoothingQuality;
  }

  get cnvs() {
    return this._cnvs;
  }

  get ctx() {
    return this._ctx;
  }

  get height() {
    return this._height;
  }

  get imageRendering() {
    return this._imageRendering;
  }

  get imageSmoothingEnabled() {
    return this._imageSmoothingEnabled;
  }

  get imageSmoothingQuality() {
    return this._imageSmoothingQuality;
  }

  get width() {
    return this._width;
  }

  set height(v) {
    this._cnvs.height = this._height = v;
  }

  set imageRendering(v) {
    this._style.imageRendering = this._imageRendering = v;
  }

  set imageSmoothingEnabled(v) {
    this._ctx.imageSmoothingEnabled = this._imageSmoothingEnabled = v;
  }

  set imageSmoothingQuality(v) {
    this._ctx.imageSmoothingQuality = this._imageSmoothingQuality = v;
  }

  set width(v) {
    this._cnvs.width = this._width = v;
  }

  append(elt = document.body) {
    elt.appendChild(this._cnvs);
  }

  resetTransform() {
    this._ctx.resetTransform();
  }

  resize(w, h, styleW = this._style.width, styleH = this._style.height) {
    this._cnvs.width = this._width = w;
    this._cnvs.height = this._height = h;
    this._style.width = styleW;
    this._style.height = styleH;
  }

  screenCap(filename) {
    const img = this._cnvs.toDataURL('image/png');
    let elt = document.createElement('a');
    elt.setAttribute('href', img);
    elt.setAttribute('download', filename + '.png');
    elt.click();
  }
}

Cnvs.canvasImageRendering = {
  auto: 'auto',
  crispEdges: 'crisp-edges',
  pixelated: 'pixelated'
}
Cnvs.contextImageSmoothing = {
  enabled: true,
  disabled: false
}
Cnvs.contextImageSmoothingQuality = {
  low: 'low',
  medium: 'medium',
  high: 'high'
}
Cnvs.renderingContext = {
  twod: '2d',
  webgl: 'webgl',
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
