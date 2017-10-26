'use strict';

class VidCnvs extends TwoDCnvs {

  constructor(src,
    callback = undefined,
    vidId = VidCnvs.defaultVideoId,
    styleWidth = Cnvs.defaultStyleWidth,
    styleHeight = Cnvs.defaultStyleHeight,
    imageRendering = Cnvs.defaultImageRendering,
    imageSmoothing = Cnvs.defaultImageSmoothingEnabled,
    imageSmoothingQuality = Cnvs.defaultImageSmoothingQuality,
    cnvsId = CamCnvs.defaultCanvasId) {

    // Call parent constructor.
    // Width and height will be determined by the video element.
    // Defaults to 2D rendering context with no alpha.
    super(Cnvs.defaultWidth, Cnvs.defaultHeight, styleWidth, styleHeight, imageRendering, VidCnvs.defaultContextAttributes, imageSmoothing, imageSmoothingQuality, cnvsId);

    this._vid = document.createElement('video');
    this._vid.id = vidId;

    // In the case of a webcam, the source will not yet be loaded.
    if (src) {
      this._vid.src = src;
      this._vid.addEventListener('loadedmetadata', function(e) {
        this.resize(this._vid.videoWidth, this._vid.videoHeight);
        this._duration = this._vid.duration;
        if (callback) {
          this.onLoad = callback;
          this.onLoad();
        }
      }.bind(this));
    }
  }

  get duration() {
    return this._duration;
  }

  get vid() {
    return this._vid;
  }

  getClass() {
    return this.constructor.name;
  }

  updateImageData() {
    if (this._vid.readyState === this._vid.HAVE_ENOUGH_DATA) {
      this._ctx.drawImage(this._vid, 0, 0, this._width, this._height);
      super.updateImageData();
    }
  }
}

VidCnvs.defaultContextAttributes = {
  alpha: false
};
VidCnvs.defaultVideoId = 'vid';
VidCnvs.defaultCanvasId = 'vidcanvas';
