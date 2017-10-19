'use strict';

var framecount = 0;
var mousex = 0;
var mousey = 0;

var camcnvs = null;
var cnvs = null;

var buffer = null;
var buf8 = null;
var data = null;

var lerpclr = undefined;

// RGBA Order.
const red = [255, 0, 0, 255];
const yellow = [255, 255, 0, 255];

const blue = [0, 0, 255, 255];
const green = [0, 255, 0, 255];

const magenta = [255, 0, 255, 255];
const cyan = [0, 255, 255, 255];

const black = ColorUtils.randomRgbColorArray();
const white = ColorUtils.randomRgbColorArray();

window.onload = initCam;
window.onmousemove = onMouseMove;

function setup(e) {

  cnvs = new TwoDCnvs(camcnvs.width, camcnvs.height);
  cnvs.append(document.body);
  buffer = new ArrayBuffer(cnvs.getDataLength());
  buf8 = new Uint8ClampedArray(buffer);
  data = new Uint32Array(buffer);

  ColorUtils.isLittleEndian = ColorUtils.testIsLittleEndian(data, buffer);
  lerpclr = ColorUtils.isLittleEndian ? ColorUtils.lerpColorCompositeLittleEndianFromArray : ColorUtils.lerpColorCompositeBigEndianFromArray;

  window.requestAnimationFrame(draw);
}

function initCam() {
  camcnvs = new CamCnvs(setup);
}

function draw(e) {
  framecount++;
  let fosc = Math.cos(framecount * .01) * .5 + .5;
  let threshold = (Math.sin(framecount * .005) * .5 + .5) * 255;
  let semithreshold = threshold * .5;
  let clr = 0x00000000;

  camcnvs.updateImageData();

  // Assumes display canvas and webcam canvas are the same dimensions.
  let h = cnvs.height;
  let w = cnvs.width;
  for (let i = 0, y = 0, x; y < h; ++y) {
    let yprc = y / h;
    let rise = yprc - mousey;
    rise *= rise;
    for (x = 0; x < w; ++x, ++i) {
      let xprc = x / w;
      let run = xprc - mousex;
      run *= run;

      clr = 0x00000000;
      if (i % 3 == 0) {
        let pxl = camcnvs.getPixelAsArray32(i);
        let val = (pxl[0] + pxl[1] + pxl[2]) / 3;

        if (val < semithreshold) {
          clr = lerpclr(red, yellow, (rise + run) / .5);
        } else if (val < threshold) {
          clr = lerpclr(blue, green, yprc);
        } else {
          clr = lerpclr(magenta, cyan, xprc);
        }
      } else {
        clr = lerpclr(black, white, fosc);
      }

      data[i] = clr;
    }
  }

  cnvs.updatePixels(buf8);

  window.requestAnimationFrame(draw);
}

function onMouseMove(e) {
  mousex = e.clientX / window.innerWidth;
  mousey = e.clientY / window.innerHeight;
}
