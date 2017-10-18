'use strict';

// Simplify cross-browser naming conventions.
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL;

class CamCnvs extends Cnvs {

  constructor(callback, mediaOptions = CamCnvs.defaultMediaOptions, vidId = CamCnvs.defaultVideoId, styleWidth = Cnvs.defaultStyleWidth, styleHeight = Cnvs.defaultStyleHeight, imageRendering = Cnvs.defaultImageRendering, imageSmoothing = Cnvs.defaultImageSmoothingEnabled, imageSmoothingQuality = Cnvs.defaultImageSmoothingQuality, cnvsId = CamCnvs.defaultCanvasId) {

    // Call parent constructor.
    // Width and height will be determined by the video element.
    // Defaults to 2D rendering context with no alpha.
    super(Cnvs.defaultWidth, Cnvs.defaultHeight, styleWidth, styleHeight, imageRendering, CamCnvs.defaultRenderingContext, CamCnvs.defaultContextAttributes, imageSmoothing, imageSmoothingQuality, cnvsId);

    // If user-media is not supported, throw an error.
    if (!navigator.getUserMedia) {
      throw 'navigator.getUserMedia not available.';
    }

    // Create DOM element.
    this._vid = document.createElement('video');

    // Set video properties.
    this._vid.id = vidId;

    // Get User Media takes three arguments:
    // 1. Media options;
    // 2. A callback function to handle media retrieval.
    // 3. A callback function to handle errors.
    navigator.getUserMedia(mediaOptions, function(e) {

        // Assign stream as video source.
        this._vid.src = window.URL.createObjectURL(e);

        // The width and height of the video will not
        // be known until its metadata has loaded.
        this._vid.addEventListener('loadedmetadata', function(e) {

          // Update the parent canvas's width and height.
          this.width = this._vid.videoWidth;
          this.height = this._vid.videoHeight;

          // Upon completion, call the callback function.
          // This allows setup functions to resume once
          // the video element has loaded asynchronously.
          callback();

          // 'this', which refers to the object, must be
          // bound to each callback so the callback can
          // edit the object's instance properties.
        }.bind(this));
      }.bind(this),
      function(e) {
        console.error(e);
      });
  }

  get vid() {
    return this._vid;
  }

  updateImageData() {
    if (this._vid.readyState === this._vid.HAVE_ENOUGH_DATA) {
      this._ctx.drawImage(this._vid, 0, 0, this._width, this._height);
      super.updateImageData();
    }
  }
}

CamCnvs.defaultRenderingContext = Cnvs.renderingContext.twod;
CamCnvs.defaultContextAttributes = {
  alpha: false
};
CamCnvs.defaultMediaOptions = {
  video: true
}
CamCnvs.defaultCanvasId = 'camcanvas';
CamCnvs.defaultVideoId = 'webcam';
