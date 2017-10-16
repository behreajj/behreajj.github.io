'use strict';

var framecount = 0;
var mousex = 0;
var mousey = 0;
var cnvswidth = 0;
var cnvsheight = 0;
var camcnvs = null;
var cnvs = null;
var ctx = null;
var imgData = null;
var buffer = null;
var buf8 = null;
var data = null;

var lerpclr = undefined;

// RGBA Order.
const red = [255, 0, 0, 255];
const yellow = [255, 255, 0, 255];

const blue = [0, 0, 255, 255];
const green = [0, 255, 0, 255];

const purple = [255, 0, 255, 255];
const turquoise = [0, 255, 255, 255];

const black = [0, 0, 0, 255];
const white = [255, 255, 255, 255];

window.onload = initCam;
window.onmousemove = onMouseMove;

function setup() {
  cnvs = document.createElement('canvas');
  cnvswidth = cnvs.width = camcnvs.width;
  cnvsheight = cnvs.height = camcnvs.height;
  cnvs.style.width = '100%';
  cnvs.style.height = '100%';
  document.body.appendChild(cnvs);

  ctx = cnvs.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  // ctx.imageSmoothingQuality = 'low';
  imgData = ctx.getImageData(0, 0, cnvs.width, cnvs.height);
  buffer = new ArrayBuffer(imgData.data.length);
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
  let threshold = mousex * 255;
  let semithreshold = threshold * .5;

  camcnvs.update();

  // Assumes display canvas and webcam canvas are the same dimensions.
  // Upscaling is done via CSS.
  for (let i = 0, y = 0, x; y < cnvsheight; ++y) {
    let yprc = y / cnvsheight;
    for (x = 0; x < cnvswidth; ++x, ++i) {
      let xprc = x / cnvswidth;
      let clr = 0;
      if (i % 3 == 0) {
        let pxl = camcnvs.pixelAsArray32(i);
        let val = (pxl[0] + pxl[1] + pxl[2]) / 3;

        if (val < semithreshold) {
          clr = lerpclr(red, yellow, xprc);
        } else if (val < threshold) {
          clr = lerpclr(blue, green, yprc);
        } else {
          clr = lerpclr(purple, turquoise, mousey);
        }
      } else {
        clr = lerpclr(black, white, fosc);
      }

      data[i] = clr;
    }
  }

  imgData.data.set(buf8);
  ctx.putImageData(imgData, 0, 0);

  window.requestAnimationFrame(draw);
}

function onMouseMove(e) {
  mousex = e.clientX / window.innerWidth;
  mousey = e.clientY / window.innerHeight;
}
