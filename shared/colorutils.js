class ColorUtils {

}

ColorUtils.isLittleEndian = true;

ColorUtils.array = function(clr, littleEndian = ColorUtils.isLittleEndian) {
  return littleEndian ? ColorUtils.arrayLittleEndian(clr) : ColorUtils.arrayBigEndian(clr);
}

ColorUtils.arrayBigEndian = function(clr) {
  return [((clr >> 24) & 0xff) / 255, ((clr >> 16) & 0xff) / 255, ((clr >> 8) & 0xff) / 255, (clr & 0xff) / 255];
}

ColorUtils.arrayLittleEndian = function(clr) {
  return [(clr & 0xff) / 255, ((clr >> 8) & 0xff) / 255, ((clr >> 16) & 0xff) / 255, ((clr >> 24) & 0xff) / 255];
}

ColorUtils.array32BigEndian = function(clr) {
  return [(clr >> 24) & 0xff, (clr >> 16) & 0xff, (clr >> 8) & 0xff, clr & 0xff];
}

ColorUtils.array32LittleEndian = function(clr) {
  return [clr & 0xff, (clr >> 8) & 0xff, (clr >> 16) & 0xff, (clr >> 24) & 0xff];
}

ColorUtils.array32 = function(clr, littleEndian = ColorUtils.isLittleEndian) {
  return littleEndian ? ColorUtils.array32LittleEndian(clr) : ColorUtils.array32BigEndian(clr);
}

ColorUtils.color32BigEndian = function(r, g, b, a = 255) {
  return (r << 24) | (g << 16) | (b << 8) | a;
}

ColorUtils.color32LittleEndian = function(r, g, b, a = 255) {
  return (a << 24) | (b << 16) | (g << 8) | r;
}

ColorUtils.color32 = function(r, g, b, a = 255, littleEndian = ColorUtils.isLittleEndian) {
  return littleEndian ? ColorUtils.color32LittleEndian(r, g, b, a) : ColorUtils.color32BigEndian(r, g, b, a);
}

ColorUtils.easeColorArray = function(x, y, t, func = Math.lerp) {
  if (t <= 0) {
    return x;
  } else if (t >= 1) {
    return y;
  }
  return [func(x[0], y[0], t), func(x[1], y[1], t), func(x[2], y[2], t), func(x[3], y[3], t)];
}

ColorUtils.easeColorComposite = function(x, y, t, littleEndian = ColorUtils.isLittleEndian, func = Math.lerp) {
  return littleEndian ? ColorUtils.easeColorCompositeLittleEndianFromArray(ColorUtils.array32LittleEndian(x), ColorUtils.array32LittleEndian(y), t, func) : ColorUtils.easeColorCompositeBigEndianFromArray(ColorUtils.array32BigEndian(x), ColorUtils.array32BigEndian(y), t, func);
}

ColorUtils.easeColorCompositeBigEndian = function(x, y, t, func = Math.lerp) {
  return ColorUtils.easeColorCompositeBigEndianFromArray(ColorUtils.array32BigEndian(x), ColorUtils.array32BigEndian(y), t, func);
}

ColorUtils.easeColorCompositeBigEndianFromArray = function(x, y, t, func = Math.lerp) {
  let arr = ColorUtils.easeColorArray(x, y, t, func);
  return ColorUtils.color32BigEndian(arr[0], arr[1], arr[2], arr[3]);
}

ColorUtils.easeColorCompositeLittleEndian = function(x, y, t, func = Math.lerp) {
  return ColorUtils.easeColorCompositeLittleEndianFromArray(ColorUtils.array32LittleEndian(x), ColorUtils.array32LittleEndian(y), t, func);
}

ColorUtils.easeColorCompositeLittleEndianFromArray = function(x, y, t, func = Math.lerp) {
  let arr = ColorUtils.easeColorArray(x, y, t, func);
  return ColorUtils.color32LittleEndian(arr[0], arr[1], arr[2], arr[3]);
}

ColorUtils.easeColorCompositeFromArray = function(x, y, t, littleEndian = ColorUtils.isLittleEndian, func = Math.lerp) {
  return littleEndian ? ColorUtils.easeColorCompositeLittleEndianFromArray(x, y, t, func) : ColorUtils.easeColorCompositeBigEndianFromArray(x, y, t, func);
}

// For chopping off the alpha and using '#', you'd need to know which endian you have.
ColorUtils.hexString = function(n) {
  return '0x' + (n >>> 0).toString(16);
}

ColorUtils.hexStringFromArrayLittleEndian = function(r, g, b, a = 255) {
  return ColorUtils.hexString(ColorUtils.color32LittleEndian(r, g, b, a));
}

ColorUtils.hexStringFromArrayBigEndian = function(r, g, b, a = 255) {
  return ColorUtils.hexString(ColorUtils.color32BigEndian(r, g, b, a));
}

ColorUtils.hsbToRgb32 = function(hue, sat, bri) {
  let r = 0;
  let g = 0;
  let b = 0;

  // Optional: ensure range 0 .. 1.
  hue = Math.clamp(hue, 0, 1);
  sat = Math.clamp(sat, 0, 1);
  bri = Math.clamp(bri, 0, 1);

  if (sat === 0) {
    r = g = b = bri;
  } else {
    hue *= 6;
    let sector = Math.floor(hue);
    let tint1 = bri * (1 - sat);
    let tint2 = bri * (1 - sat * (hue - sector));
    let tint3 = bri * (1 - sat * (1 + sector - hue));

    if (sector === 1) {
      r = tint2;
      g = bri;
      b = tint1;
    } else if (sector === 2) {
      r = tint1;
      g = bri;
      b = tint3;
    } else if (sector === 3) {
      r = tint1;
      g = tint2;
      b = bri;
    } else if (sector === 4) {
      r = tint3;
      g = tint1;
      b = bri;
    } else if (sector === 5) {
      r = bri;
      g = tint1;
      b = tint2;
    } else {
      r = bri;
      g = tint3;
      b = tint1;
    }
  }
  return [r * 255, g * 255, b * 255];
}

ColorUtils.rgbaStrFromArray = function(arr) {
  return 'rgba({0}, {1}, {2}, {3})'.format(
    arr[0], arr[1], arr[2], (arr[3] / 255).toFixed(2));
}

// Cf. http://jsfiddle.net/andrewjbaker/Fnx2w/
ColorUtils.testIsLittleEndian = function(data, buf) {
  let ile = true;
  let temp = data[1];
  data[1] = 0x0a0b0c0d;
  if (buf[4] === 0x0a && buf[5] === 0x0b && buf[6] === 0x0c &&
    buf[7] === 0x0d) {
    ile = false;
  }
  data[1] = temp;
  return ile;
}

ColorUtils.randomRgbColorArray = function(rMin = 0, rMax = 255, gMin = 0, gMax = 255, bMin = 0, bMax = 255, aMin = 255, aMax = 255) {
  return [Math.randomRange(rMin, rMax), Math.randomRange(gMin, gMax), Math.randomRange(bMin, bMax), Math.randomRange(aMin, aMax)];
}
