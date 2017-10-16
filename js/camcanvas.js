'use strict';

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

class CamCnvs {
  constructor(callback, mediaOptions = CamCnvs.defaultMediaOptions, cnvsId = CamCnvs.defaultCanvasId, vidId = CamCnvs.defaultVideoId) {

    if (!navigator.getUserMedia) {
      throw 'navigator.getUserMedia not available.';
    }

    // Initialize webcam element.
    this._vid = document.createElement('video');
    this._vid.id = vidId;
    this._mediaOptions = mediaOptions;
    this._mediaStream = null;
    this._width = 0;
    this._height = 0;

    // Get User Media takes three arguments:
    // The media options (whether or not to use audio, etc.)
    // A callback function for successful media retrieval.
    // A callback function to deal with errors.

    // 'this' is contextual, and will not hold within the
    // callback as it does within the constructor without
    // supplying its current context to the bind function.
    navigator.getUserMedia(this._mediaOptions, function(e) {
        this._vid.src = window.URL.createObjectURL(e);
        this._mediaStream = e;

        this._vid.addEventListener('loadedmetadata', function(e) {

          // Find the source dimensions of the webcam feed.
          this._width = this._vid.videoWidth;
          this._height = this._vid.videoHeight;

          // Initialize canvas element.
          this._cnvs = document.createElement('canvas');
          this._cnvs.id = cnvsId;
          this._cnvs.width = this._width;
          this._cnvs.height = this._height;

          // Cache drawing context.
          this._ctx = this._cnvs.getContext('2d');
          this._ctx.imageSmoothingEnabled = CamCnvs.defaultImageSmoothEnabled;
          this._ctx.imageSmoothingQuality = CamCnvs.defaultImageSmoothQuality;
          this._imgData = this._ctx.getImageData(0, 0, this._width, this._height);
          this._pixels = this._imgData.data;

          // Upon completion, call the callback function.
          callback();
        }.bind(this));
      }.bind(this),
      function(e) {
        console.error(e);
      });
  }

  get height() {
    return this._height;
  }

  get width() {
    return this._width;
  }

  // For convenience only. Functions which alter their behavior
  // based on boolean parameters are considered improper style.
  // Use more specific functions that follow for better performance.
  pixel(index, asArray = true, normalized = false, littleEndian = ColorUtils.isLittleEndian) {
    if (asArray) {
      return this.pixelAsArray(index, normalized);
    }
    return this.pixelAsComposite(index, littleEndian);
  }

  pixelAsArray(index, normalized = false) {
    if (normalized) {
      return this.pixelAsArrayNormalized(index);
    }
    return this.pixelAsArray32(index);
  }

  pixelAsArray32(index) {
    index *= 4;
    return [this._pixels[index], this._pixels[index + 1], this._pixels[index + 2], this._pixels[index + 3]];
  }

  pixelAsArrayNormalized(index) {
    let px = this.pixelAsArray32(index);
    return [px[0] / 255, px[1] / 255, px[2] / 255, px[3] / 255];
  }

  pixelAsComposite(index, littleEndian = ColorUtils.isLittleEndian) {
    let px = this.pixelAsArray32(index);
    return ColorUtils.color32(px[0], px[1], px[2], px[3], littleEndian);
  }

  pixelAsCompositeBigEndian(index) {
    let px = this.pixelAsArray32(index);
    return ColorUtils.color32BigEndian(px[0], px[1], px[2], px[3]);
  }

  pixelAsCompositeLittleEndian(index) {
    let px = this.pixelAsArray32(index);
    return ColorUtils.color32LittleEndian(px[0], px[1], px[2], px[3]);
  }

  update() {
    if (this._mediaStream) {
      this._ctx.drawImage(this._vid, 0, 0, this._width, this._height);
      this._imgData = this._ctx.getImageData(0, 0, this._width, this._height);
      this._pixels = this._imgData.data;
    }
  }
}

CamCnvs.defaultMediaOptions = {
  audio: false,
  video: true
}
CamCnvs.defaultCanvasId = 'camcanvas';
CamCnvs.defaultVideoId = 'webcam';
CamCnvs.defaultImageSmoothEnabled = false;
CamCnvs.defaultImageSmoothQuality = 'low';
