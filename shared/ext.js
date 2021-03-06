'use strict';

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;
window.URL = window.URL ||
  window.webkitURL;

Math.HALF_PI = Math.PI * .5;
Math.QUARTER_PI = Math.PI * .25;
Math.TWO_PI = Math.PI * 2.0;
Math.RAD_TO_DEG = 180.0 / Math.PI;
Math.DEG_TO_RAD = Math.PI / 180.0;

/* EASING FUNCTIONS */

/**
 * source: https://css-tricks.com/emulating-css-timing-functions-javascript/
 * e is the end angle in range [90, 180] [HALF_PI, PI]
 * Default is 120 degrees.
 */
Math.bounceFin = Math.bounceFin || function(a, b, t, e = 2.094395) {
  return a + (Math.sin(t * e) / Math.sin(e)) * (b - a);
}

/**
 * s is the start angle in range [-180, -90] [-PI, -HALF_PI]
 * e is the end angle in range [90, 180] [HALF_PI, PI]
 * Defaults are -120, 120 degrees.
 */
Math.bounceIniFin = Math.bounceIniFin || function(a, b, t, s = -2.094395, e = 2.094395) {
  return a + (Math.sin(t * (e - s) + s) - Math.sin(s)) / (Math.sin(e) - Math.sin(s)) * (b - a);
}

/**
 * s is the start angle in range [-180, -90] [-PI, -HALF_PI]
 * Default is -120 degrees.
 */
Math.bounceIni = Math.bounceIni || function(a, b, t, s = -2.094395) {
  return a + (Math.sin((1.0 - t) * s) / Math.sin(s)) * (b - a);
}

Math.easeIn = Math.easeIn || function(a, b, t) {
  return a + Math.pow(t, 1.675) * (b - a);
}

Math.easeInOut = Math.easeInOut || function(a, b, t) {
  return a + (0.5 * (Math.sin((t - 0.5) * Math.PI) + 1.0)) * (b - a);
}

Math.easeOut = Math.easeOut || function(a, b, t) {
  return a + (1.0 - Math.pow(1.0 - t, 1.675)) * (b - a);
}

Math.lerp = Math.lerp || function(a, b, t) {
  return (1.0 - t) * a + t * b;
};

Math.smootherStep = Math.smootherStep || function(a, b, t) {
  return a + t * t * t * (t * (t * 6.0 - 15.0) + 10.0) * (b - a);
};

/* End Easing Functions */

Math.clamp = Math.clamp || function(v, min = 0, max = 1) {
  return Math.min(Math.max(v, min), max);
}

Math.degreesToRadians = Math.degreesToRadians || function(degrees) {
  return degrees * Math.DEG_TO_RAD;
}

Math.frac = Math.frac || function(v) {
  return v - Math.floor(v);
}

Math.isAPowerOfTwo = Math.isAPowerOfTwo || function(v) {
  return v && (v & (v - 1)) === 0;
}

Math.dist = Math.dist || function(x0, x1, y0, y1, z0 = 0, z1 = 0) {
  return Math.sqrt(Math.distSq(x0, x1, y0, y1, z0, z1));
}

Math.distSq = Math.distSq || function(x0, x1, y0, y1, z0 = 0, z1 = 0) {
  const depth = z1 - z0;
  const rise = y1 - y0;
  const run = x1 - x0;
  return rise * rise + run * run + depth * depth;
}

Math.easeArray = Math.easeArray || function(arr, t, func) {
  const sz = arr.length;
  if (sz === 0) {
    return undefined;
  } else if (sz === 1 || t <= 0) {
    return arr[0];
  } else if (t >= 1) {
    return arr[sz - 1];
  }
  const sclt = t * (sz - 1);
  const i = Math.floor(sclt);
  return func(arr[i], arr[i + 1], sclt - i);
}

Math.map = Math.map || function(v, l1, u1, l2, u2) {
  return l2 + (u2 - l2) * (v - l1) / (u1 - l1);
}

/**
 * See https://bocoup.com/blog/find-the-closest-power-of-2-with-javascript ,
 * https://stackoverflow.com/questions/26965171/fast-nearest-power-of-2-in-javascript
 */
Math.nearestPowerOfTwo = Math.nearestPowerOfTwo || function(v) {
  return Math.pow(2, Math.round(Math.log(v) / Math.log(2)));
}

Math.nearestSection = Math.nearestSection || function(angle, section) {
  return section * Math.round(angle / section);
}

Math.radiansToDegrees = Math.radiansToDegrees || function(radians) {
  return radians * Math.RAD_TO_DEG;
}

Math.randomRange = Math.randomRange || function(lb, ub) {
  if (ub) {
    return lb + (ub - lb) * Math.random();
  } else {
    return lb * Math.random();
  }
}

Math.tri = Math.tri || function(phase, freq, min, max) {
  return phase % freq < freq / 2 ? max : min;
}

String.random = String.random || function(len) {
  let result = '';
  for (let i = 0; i < len; ++i) {
    result += String.fromCharCode(Math.floor(Math.randomRange(97, 123)));
  }
  return result;
}

/**
 * See https://bost.ocks.org/mike/shuffle/ ,
 * https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
 */
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

Array.prototype.step = function(t) {
  return this[this.stepToIndex(t)];
}

Array.prototype.stepToIndex = function(t) {
  const sz = this.length;
  if (sz === 0) {
    return undefined;
  } else if (sz === 1 || t <= 0) {
    return 0;
  } else if (t >= 1) {
    return sz - 1;
  }
  return Math.floor(t * (sz - 1));
}

Number.prototype.approx = Number.prototype.approx ||
  function(v, tolerance = Number.EPSILON) {
    return Math.abs(this - v) < tolerance;
  }

// Reference:
// https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
// String.prototype.format = String.prototype.format ||
//   function() {
//     let str = this.toString();
//     if (arguments.length) {
//       let t = typeof arguments[0];
//       let key;
//       let args = (`string` === t || `number` === t) ?
//         Array.prototype.slice.call(arguments) :
//         arguments[0];
//
//       for (key in args) {
//         str = str.replace(new RegExp('\\{' + key + '\\}', 'gi'), args[key]);
//       }
//     }
//     return str;
//   };
