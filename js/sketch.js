'use strict';

var cnvs = null;
var cntxt = null;
var capture = null;

// Brightness threshold beneath which a 'higlight' is
// replaced with a shadow.
var threshhold = 54;

// These are the four channels which will replace the
// original capture based on a set of rules within the
// for-loop in draw.
var r = 0,
  g = 0,
  b = 0,
  a = 245;

// Framecount is divided by a smoothening when
// calculating the sine wave which changes r, g, b, a.
var smooth1 = 1,
  smooth2 = 1,
  smooth3 = 1;

// A scalar from 0 to 1, by which the r, g, b, a values
// above will be multiplied to differentiate 'shadows'
// highlights.
var shadowDiff = 0.5;

// Sliders which allow you to control parameters.
var aSlider = null,
  threshholdSlider = null,
  shadowDiffSlider = null;

function setup() {

  // For high-definition screens.
  pixelDensity(displayDensity());

  // Create canvas.
  cnvs = createCanvas(windowWidth, windowHeight);
  background(64);

  // Disable right-click on the canvas.
  // cnvs.elt.oncontextmenu = function(e) {
  //   return false;
  // };

  // Get its drawing context in case you need to
  // use vanilla JS for canvas, e.g., in gradients.
  cntxt = cnvs.elt.getContext('2d');

  // Create a video capture.
  capture = createCapture(VIDEO);

  // Scale the capture appropriately.
  capture.size(width * displayDensity(), height * displayDensity());

  // The video on the canvas draws from a video element, which is
  // hidden by default. Comment out to see original feed.
  capture.hide();

  aSlider = createSlider(0, 255, a, 0);
  aSlider.position(160, 10);
  var label = createDiv('Transparency');
  label.position(10, 10);

  threshholdSlider = createSlider(0, 255, threshhold, 0);
  threshholdSlider.position(160, 30);
  label = createDiv('Brightness Threshhold');
  label.position(10, 30);

  shadowDiffSlider = createSlider(0, 2, shadowDiff, 0);
  shadowDiffSlider.position(160, 50);
  label = createDiv('Shadow Distinction');
  label.position(10, 50);

  smooth1 = random(30, 180);
  smooth2 = random(30, 180);
  smooth3 = random(30, 180);
}

function draw() {

  threshhold = threshholdSlider.value();
  shadowDiff = shadowDiffSlider.value();
  a = aSlider.value();

  // Change r, g, b, a value according to an arbitrary rule.
  r = map(sin(frameCount / smooth1), -1, 1, 0, 255);
  g = map(sin(frameCount / smooth2), -1, 1, 0, 255);
  b = map(sin(frameCount / smooth3), -1, 1, 0, 255);

  // r = map(mouseX / width, 0, 1, 0, 255);
  // g = map(mouseY / height, 0, 1, 0, 255);
  // b = map(noise(frameCount / 180.0), -1, 1, 0, 255);

  // Display the image on the canvas.
  // image(capture, 0, 0, width, height);

  // Load the canvas's pixels.
  loadPixels();

  // Load the capture's pixels.
  capture.loadPixels();

  // Create variables to store the information from the capture.
  var capr = 0,
    capg = 0,
    capb = 0,
    capa = 0;

  // Create variables to store diagnostic eval of the above.
  var bri = 0;

  // Loop through all the elements of the array.
  // k is the actual size of the array, which is 4 times the
  // number of the pixels on the screen. i is the index of the
  // array accounting for the 4 channels (RGBA).
  for (var y = 0, i = 0, k = 0, h = capture.height; y < h; ++y) {
    for (var x = 0, w = capture.width; x < w; ++x, i += 4, ++k) {

      // Store the capture information.
      capr = capture.pixels[i];
      capg = capture.pixels[i + 1];
      capb = capture.pixels[i + 2];
      capa = capture.pixels[i + 3];

      // Evaluate the brightness of a pixel in the capture.
      bri = (capr + capg + capb) / 3.0;

      // If brightness is greater than the threshold, select
      // highlight colors.
      if (bri > threshhold) {

        // Arbitrary rules.
        if (i % 3 == 0 &&
          (x > capture.width / 2 &&
            y > capture.height / 2 ||
            x < capture.width / 2 &&
            y < capture.height / 2)) {
          pixels[i] = r;
          pixels[i + 1] = g;
          pixels[i + 2] = b;
          pixels[i + 3] = a;
        } else if (i % 5 == 0) {
          pixels[i] = 255 - r;
          pixels[i + 1] = 255 - g;
          pixels[i + 2] = 255 - b;
          pixels[i + 3] = a;
        }

        //If brightness is less than the threshold, select
        // shadow colors.
      } else {

        // Arbitrary rules.
        if (y % 2 == 0 && x % 2 == 0) {
          pixels[i] = r * shadowDiff;
          pixels[i + 1] = g * shadowDiff;
          pixels[i + 2] = b * shadowDiff;
          pixels[i + 3] = a;
        } else if (k % 5 == 0) {
          pixels[i] = (255 - r) * shadowDiff;
          pixels[i + 1] = (255 - g) * shadowDiff;
          pixels[i + 2] = (255 - b) * shadowDiff;
          pixels[i + 3] = a;
        }
      }
    }
  }
  updatePixels();
}
