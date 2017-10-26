'use strict';

class CamCnvs extends VidCnvs {

  constructor(callback = undefined,
    mediaOptions = CamCnvs.defaultMediaOptions,
    vidId = CamCnvs.defaultVideoId,
    styleWidth = Cnvs.defaultStyleWidth,
    styleHeight = Cnvs.defaultStyleHeight,
    imageRendering = Cnvs.defaultImageRendering,
    imageSmoothing = Cnvs.defaultImageSmoothingEnabled,
    imageSmoothingQuality = Cnvs.defaultImageSmoothingQuality,
    cnvsId = CamCnvs.defaultCanvasId) {

    super(null, undefined, vidId, styleWidth, styleHeight, imageRendering, imageSmoothing, imageSmoothingQuality, cnvsId);
    this._vid.removeEventListener('loadedmetadata', 0);

    // If user-media is not supported, throw an error.
    if (!navigator.getUserMedia) {
      throw 'navigator.getUserMedia not available.';
    }

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
          this.resize(this._vid.videoWidth, this._vid.videoHeight);

          // Upon completion, call the callback function.
          // This allows setup functions to resume once
          // the video element has loaded asynchronously.
          if (callback) {
            this.onLoad = callback;
            this.onLoad();
          }
        }.bind(this));
      }.bind(this),
      function(e) {
        console.error(e);
      });
  }
}

CamCnvs.defaultCanvasId = 'camcanvas';
CamCnvs.defaultMediaOptions = {
  video: true
};
CamCnvs.defaultVideoId = 'webcam';
