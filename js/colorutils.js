Math.lerp = Math.lerp || function(x, y, t) {
  return (1 - t) * x + t * y;
};

Math.smootherStep = Math.smootherStep || function(x, y, t) {
  return x + t * t * t * (t * (t * 6 - 15) + 10) * (y - x);
};

class ColorUtils {

}

ColorUtils.isLittleEndian = true;

ColorUtils.array32BigEndian = function(clr) {
  return [(clr >> 24) & 0xff, (clr >> 16) & 0xff, (clr >> 8) & 0xff, clr & 0xff];
}

ColorUtils.array32LittleEndian = function(clr) {
  return [clr & 0xff, (clr >> 8) & 0xff, (clr >> 16) & 0xff, (clr >> 24) & 0xff];
}

ColorUtils.array32 = function(clr, littleEndian = ColorUtils.isLittleEndian) {
  if (littleEndian) {
    return ColorUtils.array32LittleEndian(clr);
  }
  return ColorUtils.array32BigEndian(clr);
}

ColorUtils.color32BigEndian = function(r, g, b, a = 255) {
  return (r << 24) | (g << 16) | (b << 8) | a;
}

ColorUtils.color32LittleEndian = function(r, g, b, a = 255) {
  return (a << 24) | (b << 16) | (g << 8) | r;
}

ColorUtils.color32 = function(r, g, b, a = 255, littleEndian = ColorUtils.isLittleEndian) {
  if (littleEndian) {
    return ColorUtils.color32LittleEndian(r, g, b, a);
  }
  return ColorUtils.color32BigEndian(r, g, b, a);
}

ColorUtils.hsbToRgb = function(hue, sat, bri) {
  let r = 0;
  let g = 0;
  let b = 0;

  // Optional: ensure range 0 .. 1.
  hue = hue < 0 ? 0 : hue > 1 ? 1 : hue;
  sat = sat < 0 ? 0 : sat > 1 ? 1 : sat;
  bri = bri < 0 ? 0 : bri > 1 ? 1 : bri;

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
  return [r, g, b];
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

ColorUtils.lerpColorArray = function(x, y, t) {
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return [Math.lerp(x[0], y[0], t), Math.lerp(x[1], y[1], t), Math.lerp(x[2], y[2], t), Math.lerp(x[3], y[3], t)];
}

ColorUtils.lerpColorComposite = function(x, y, t, littleEndian = ColorUtils.isLittleEndian) {
  if (littleEndian) {
    return ColorUtils.lerpColorCompositeLittleEndianFromArray(ColorUtils.array32LittleEndian(x), ColorUtils.array32LittleEndian(y), t);
  }
  return ColorUtils.lerpColorCompositeBigEndianFromArray(ColorUtils.array32BigEndian(x), ColorUtils.array32BigEndian(y), t);
}

ColorUtils.lerpColorCompositeFromArray = function(x, y, t, littleEndian = ColorUtils.isLittleEndian) {
  if (littleEndian) {
    return ColorUtils.lerpColorCompositeLittleEndianFromArray(x, y, t);
  }
  return ColorUtils.lerpColorCompositeBigEndianFromArray(x, y, t);
}

ColorUtils.lerpColorCompositeBigEndian = function(x, y, t) {
  return ColorUtils.lerpColorCompositeBigEndianFromArray(ColorUtils.array32BigEndian(x), ColorUtils.array32BigEndian(y), t);
}

ColorUtils.lerpColorCompositeBigEndianFromArray = function(x, y, t) {
  let arr = ColorUtils.lerpColorArray(x, y, t);
  return ColorUtils.color32BigEndian(arr[0], arr[1], arr[2], arr[3]);
}

ColorUtils.lerpColorCompositeLittleEndian = function(x, y, t) {
  return ColorUtils.lerpColorCompositeLittleEndianFromArray(ColorUtils.array32LittleEndian(x), ColorUtils.array32LittleEndian(y), t);
}

ColorUtils.lerpColorCompositeLittleEndianFromArray = function(x, y, t) {
  let arr = ColorUtils.lerpColorArray(x, y, t);
  return ColorUtils.color32LittleEndian(arr[0], arr[1], arr[2], arr[3]);
}
