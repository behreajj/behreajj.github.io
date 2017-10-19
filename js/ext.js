'use strict';

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.URL = window.URL || window.webkitURL;

Math.TWO_PI = Math.PI * 2;

Math.clamp = Math.clamp || function(v, min = 0, max = 1) {
  return Math.min(Math.max(v, min), max);
}

Math.lerp = Math.lerp || function(x, y, t) {
  return (1 - t) * x + t * y;
};

// See THREE.Math.mapLinear
Math.map = Math.map || function(v, l1, u1, l2, u2) {
  return l2 + (u2 - l2) * (v - l1) / (u1 - l1);
}

// See https://bocoup.com/blog/find-the-closest-power-of-2-with-javascript ,
// https://stackoverflow.com/questions/26965171/fast-nearest-power-of-2-in-javascript
Math.nearestPowerOfTwo = Math.nearestPowerOfTwo || function(v) {
  return Math.pow(2, Math.round(Math.log(v) / Math.log(2)));
}

Math.randomRange = Math.randomRange || function(lb, ub) {
  if (ub) {
    return lb + (ub - lb) * Math.random();
  } else {
    return lb * Math.random();
  }
}

Math.smootherStep = Math.smootherStep || function(x, y, t) {
  return x + t * t * t * (t * (t * 6 - 15) + 10) * (y - x);
};

// See https://bost.ocks.org/mike/shuffle/ ,
// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
Array.prototype.shuffle = Array.prototype.shuffle || function() {
  let m = this.length,
    t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = this[m];
    this[m] = this[i];
    this[i] = t;
  }
  return this;
}

String.random = String.random || function(len) {
  let result = "";
  for (let i = 0; i < len; ++i) {
    result += String.fromCharCode(parseInt(Math.randomRange(97, 123)));
  }
  return result;
}
