'use strict';

/* TODO MAIN LIST
 * Basis matrix of a curve.
 * Look up how 4x4matrix determinants work
 * so you can invert a matrix.
 * Look at wavefront obj spec for vts.
 * Catmull-Rom splines
 * Torsion
 * Key events / key listener / stack.
 */

function pattern(i, ld, iprc, j, rd, jprc) {
  let theta = Math.TWO_PI * jprc;
  // let scl = j % 2 === 0 ? 1 : .5;
  // let scl = Math.tri(j, 3, 0.1, 1);
  // return new Vector(Math.cos(theta) * scl, Math.sin(theta) * scl, 0);

  // Simple radial form.
  return new Vector(Math.cos(theta), Math.sin(theta), 0);
}

const curvesperspline = 5;
const lindetail = 256;
const raddetail = 4;
var spline = null;
var taper = [25, 50, 12.5, 50, 25];

const controls = [
  [`LMB`, `Adjust selected point`],
  [`RMB`, `Cycle selected point on curve`],
  [`MMB`, `Cycle selected curve on spline`],
  ['A', 'Toggle mesh display'],
  ['D', 'Mirror control points adjust'],
  ['E', 'Mouse y changes point z'],
  ['F', 'Free control points adjust'],
  ['G', 'Toggle control net'],
  ['Q', 'Screen capture (.png)'],
  ['S', 'Save mesh (.obj)'],
  ['W', 'New random curve'],
  ['V', 'Flip rotate direction'],
  ['X', 'Rotate x'],
  ['C', 'Rotate y'],
  ['Z', 'Rotate z'],
  ['\u2192 6', 'Translate right'],
  ['\u2193 2', 'Translate down'],
  ['\u2190 4', 'Translate left'],
  ['\u2191 8', 'Translate up'],
  ['Hom 7', 'Scale up'],
  ['End 1', 'Scale down'],
  ['PgUp 9', 'Fatten'],
  ['PgDn 3', 'Thin']
];

const EditModes = {
  mouseYtoY: 0,
  mouseYtoZ: 1
}
const MeshModes = {
  bezier2d: 0,
  vertices: 1,
  edges: 2,
  faces: 3
}
const rotateSpeed = .025;
const bkgcolor = 'rgb(25, 25, 25)';
const translationSpeed = 2;
const upscalar = 1.1;
const downscalar = 1 / upscalar;
const fattenSpeed = 1;

var cnvs = null;
var framecount = 0;
var center = new Vector();

// Spline editing.
var curreditcurve = 0;
var curreditpoint = 0;
var inEditingMode = false;
var adjustForward = CubicBezierSpline.alignControlPoint0;
var adjustBackward = CubicBezierSpline.alignControlPoint1;
var currEditMode = EditModes.mouseYtoY;
var showControlNet = true;
var showMesh = MeshModes.vertices;
var rotateDir = 1;

// Mesh
var crossSectionScalars = [];
var verts = [];
var indices = [];
var faces = [];
var uvs = [];
var norms = [];

// Export
var objUrl;
var fileName = 'blob.obj';

window.onload = setup

function setup(e) {

  cnvs = new TwoDCnvs(window.innerWidth, window.innerHeight);
  cnvs.append(document.body);
  cnvs.setFont('bold', 1, 'em', 'sans-serif');

  center.set(cnvs.width * .5, cnvs.height * .5, 0);
  cnvs.translate(center);

  spline = initCurve(lindetail);

  initTaper(7, 10, 80);
  initCrossSectionScalars(lindetail, taper, Math.smootherStep);
  initVertices(spline, lindetail, raddetail);
  initIndices(lindetail, raddetail);
  initFaces(lindetail, raddetail);
  // initUvs(lindetail, raddetail);
  // initNorms(lindetail, raddetail);

  initControls(document.body);

  // Append event listeners.
  window.oncontextmenu = onContextMenu;
  window.onkeydown = onKeyDown;
  window.onkeyup = onKeyUp;
  window.onmousedown = onMouseDown
  window.onmousemove = onMouseMove;
  window.onmouseup = onMouseUp;
  window.onresize = onResize;

  // Begin Draw loop.
  window.requestAnimationFrame(draw);
}

function draw(e) {
  framecount++;
  cnvs.background(bkgcolor, center);

  switch (showMesh) {
    case MeshModes.faces:
      drawQuads2dFill(cnvs.ctx, 1, 1);
      break;
    case MeshModes.edges:
      drawQuads2dStroke(cnvs.ctx, 1, 1, 1);
      break;
    case MeshModes.vertices:
      drawVertices(cnvs.ctx, 2);
      break;
    case MeshModes.bezier2d:
      spline.draw2d(cnvs.ctx);
      break;
    default:
      break;
  }

  if (showControlNet) {
    spline.drawConstruction2d(cnvs.ctx);
    spline.drawPointLabels2d(cnvs.ctx, curreditpoint, curreditcurve);
  }

  window.requestAnimationFrame(draw);
}

// This could be faster if only one color is used, but that makes it
// more difficult to see segments of the curve.
function drawQuad2dFill(ctx, v00, v10, v11, v01) {
  ctx.beginPath();
  ctx.moveTo(v00.x, v00.y);
  ctx.lineTo(v10.x, v10.y);
  ctx.lineTo(v11.x, v11.y);
  ctx.lineTo(v01.x, v01.y);
  ctx.closePath();
  ctx.fill();
}

function drawQuads2dFill(ctx, istp = 1, jstp = 1) {
  ctx.lineWidth = 0;
  // ctx.fillStyle = 'rgba(0, 51, 204, .125)'
  for (let i = 1, l = 0, j, m; i < lindetail; i += istp, l += istp) {
    ctx.fillStyle = 'hsla(' + (360 * l / lindetail) + ', 85%, 50%, .667)';
    for (j = 0, m = 1 % raddetail; j < raddetail; j += jstp, m = (j + jstp) % raddetail) {
      drawQuad2dFill(ctx, verts[l][j], verts[i][j], verts[i][m], verts[l][m]);
    }
  }
}

function drawQuad2dStroke(ctx, v00, v10, v11, v01) {
  ctx.beginPath();
  ctx.moveTo(v00.x, v00.y);
  ctx.lineTo(v10.x, v10.y);
  ctx.lineTo(v11.x, v11.y);
  ctx.lineTo(v01.x, v01.y);
  ctx.closePath();
  ctx.stroke();
}

function drawQuads2dStroke(ctx, lw = 1, istp = 1, jstp = 1) {
  ctx.lineWidth = lw;
  // ctx.strokeStyle = 'rgba(204, 0, 51, .25)';

  let v00 = null,
    v10 = null,
    v11 = null,
    v01 = null;
  for (let i = 1, l = 0, j, m; i < lindetail; i += istp, l += istp) {
    ctx.strokeStyle = 'hsla(' + (360 * l / lindetail) + ', 75%, 50%, .9)';
    for (j = 0, m = 1 % raddetail; j < raddetail; j += jstp, m = (j + jstp) % raddetail) {
      v00 = verts[l][j];
      v10 = verts[i][j];
      v11 = verts[i][m];
      v01 = verts[l][m];

      drawQuad2dStroke(ctx, v00, v10, v11, v01);
    }
  }
}

function drawVertices(ctx, ext) {
  ctx.lineWidth = 0;
  // ctx.fillStyle = 'rgba(0, 204, 51, .5)';
  for (let i = 0, j; i < lindetail; ++i) {
    ctx.fillStyle = 'hsla(' + (360 * i / lindetail) + ', 100%, 50%, 1)';
    for (j = 0; j < raddetail; ++j) {
      ctx.fillRect(verts[i][j].x - ext, verts[i][j].y - ext, ext, ext);
    }
  }
}

// function drawWalker(ctx, t) {
//   spline.transform2d(ctx, t);
//   ctx.beginPath();
//   ctx.lineWidth = 3;
//   ctx.strokeStyle = '#fff';
//   ctx.arc(0, 0, 15, Math.QUARTER_PI, Math.TWO_PI - Math.QUARTER_PI, false);
//   ctx.stroke();
//   ctx.resetTransform();
// }

function initControls(elt) {
  let panel = document.createElement('div');
  panel.id = 'controlPanel';
  panel.style.opacity = .25;

  let header = document.createElement('div');
  header.id = 'controlHeader';
  header.textContent = 'CONTROLS';
  panel.appendChild(header);

  const sz0 = controls.length;
  for (let i = 0, j; i < sz0; ++i) {
    let div = document.createElement('div');
    div.id = 'row' + i;
    div.className = 'controlRow';
    const sz1 = controls[i].length;
    for (j = 0; j < sz1; ++j) {
      let span = document.createElement('span');
      span.id = 'col' + j;
      span.className = 'controlCol'
      span.textContent = controls[i][j];
      div.appendChild(span);
    }
    panel.appendChild(div);
  }

  panel.onmouseover = function(e) {
    panel.style.opacity = 1.0;
  }
  panel.onmouseout = function(e) {
    panel.style.opacity = .125;
  }

  elt.appendChild(panel);
}

function initCrossSectionScalars(ld, tpr, func) {
  const ldf = ld - 1;
  for (let i = 0; i < ld; ++i) {
    crossSectionScalars.push(Math.easeArray(tpr, i / ldf, func));
  }
}

function initCurve(lod) {
  let rndvec = [];
  let t0, scl;
  const scl0 = 0.5 * Math.min(window.innerWidth, window.innerHeight);
  const freq = 3;
  rndvec.push(new Vector(scl, 0, 0));
  for (let i = 0; i < curvesperspline; ++i) {
    t0 = 3.0 * Math.TWO_PI * i / curvesperspline;
    scl = ((3 * i) % freq) < (freq / 2) ? scl0 * .5 : scl0;

    rndvec.push(new Vector(Math.cos(t0) * .25 * scl, Math.sin(t0) * .75 * scl, Math.sin(t0) * .667 * scl));

    rndvec.push(new Vector(Math.cos(t0) * .75 * scl, Math.sin(t0) * .25 * scl, Math.cos(t0) * .667 * scl));

    rndvec.push(new Vector(Math.cos(t0) * scl, Math.sin(t0) * scl, scl));
  }

  return new DiscreteCubicBezierLoop(rndvec, lod);
}

function initFaces(ld, rd) {
  let l = 0,
    m = 0;
  for (let i = 1, k = 0, j; i < ld; ++i) {
    l = i - 1;
    for (j = 0; j < rd; ++j) {
      m = (j + 1) % rd;
      faces.push([indices[l * rd + j],
        indices[i * rd + j],
        indices[i * rd + m],
        indices[l * rd + m]
      ]);
    }
  }
}

function initIndices(ld, rd) {
  const sz = ld * rd;
  for (let i = 0; i < sz; ++i) {
    indices.push(i + 1);
  }
}

// TODO Radial detail doesn't work.
// Same gap as usual...
// function initUvs(ld, rd) {
//   uvs = [];
//   let idf = ld;
//   let rdf = rd;
//   let iprc = 0;
//   let jprc = 0;
//   for (let i = 0, j; i < ld; ++i) {
//     iprc = (i + 1) / idf;
//     uvs.push([]);
//     for (j = 0; j < rd + 1; ++j) {
//       jprc = (j + 1) / rdf;
//       uvs[i].push(new Vector(iprc, jprc, 0));
//     }
//   }
// }

// Assumes a loop.
// function initNorms(ld, rd) {
//   norms = [];
//   let ldf = ld - 1;
//   for (let i = 0, l = 1, j; i < ld; ++i, ++l) {
//     norms.push([]);
//     for (j = 0; j < rd; ++j) {
//       norms[i].push(Vector.cross(verts[i][j], verts[l % ldf][j]).norm());
//     }
//   }
// }

function initTaper(count = 7, min = 10, max = 100) {
  taper = [];
  for (let i = 0; i < count; ++i) {
    taper.push(Math.randomRange(min, max));
  }
  taper[count - 1] = taper[0];
}

function initVertices(spl, ld, rd) {
  const ldf = ld - 1;
  let localSpace = null;
  let scl = 0;

  for (let i = 0, j; i < ld; ++i) {
    verts.push([]);

    // localSpace = spl.calcTransform(i / ldf);
    localSpace = spl.getTransform(i)
    scl = crossSectionScalars[i];
    for (j = 0; j < rd; ++j) {
      verts[i].push(pattern(i, ld, i / ldf, j, rd, j / rd).scale(scl).applyMatrix(localSpace));
    }
  }
}

// function updateNorms() {
//   for (let i = 0, l = 1, sz0 = norms.length, ldf = sz0 - 1, j, sz1; i < sz0; ++i, ++l) {
//     for (j = 0, sz1 = norms[i].length; j < sz1; ++j) {
//       norms[i][j] = Vector.cross(verts[i][j], verts[l % ldf][j]).norm();
//     }
//   }
// }

function updateCrossSectionScalars(val) {
  const sz = crossSectionScalars.length;
  for (let i = 0; i < sz; ++i) {
    crossSectionScalars[i] += val;
  }
}

function updateVertices(spl, ld, rd) {
  let localSpace = null;
  const ldf = ld - 1;
  let scl = 0;

  for (let i = 0, j; i < ld; ++i) {
    // localSpace = spl.calcTransform(i / ldf);
    localSpace = spl.getTransform(i);
    scl = crossSectionScalars[i];
    for (j = 0; j < rd; ++j) {
      verts[i][j] = pattern(i, ld, i / ldf, j, rd, j / rd).scale(scl).applyMatrix(localSpace);
    }
  }
}

function objString() {
  let rndname = spline.getClass() + '_' + String.random(5);
  fileName = rndname + '.obj';
  let result = '# Spline Generator\n# ' + new Date() +
    '\n# Verts: ' + (verts.length * verts[0].length) +
    '\n# Faces: ' + faces.length +
    '\no ' + rndname + '\n';
  result += objStringVerts();
  // result += '\n' + objStringUvs();
  // result += '\n' + objStringNorms();
  result += '\ns off\n';
  result += objStringFaces();
  return result;
}

function objStringFaces() {
  let result = [];
  let index = 0;
  for (let i = 0, sz0 = faces.length, j, sz1; i < sz0; ++i) {
    result.push([]);
    for (j = 0, sz1 = faces[i].length; j < sz1; ++j) {
      index = faces[i][j];
      // result[i].push(index + '/' + index + '/' + index);
      result[i].push(index);
    }
    result[i] = 'f ' + result[i].join(' ');
  }
  return result.join('\n');
}

// function objStringNorms() {
//   let result = [];
//   let v = null;
//   for (let i = 0, sz0 = norms.length, j, sz1; i < sz0; ++i) {
//     for (j = 0, sz1 = norms[i].length; j < sz1; ++j) {
//       v = norms[i][j];
//       result.push('vn ' +
//         v._x.toFixed(6) + ' ' +
//         v._y.toFixed(6) + ' ' +
//         v._z.toFixed(6));
//     }
//   }
//   return result.join('\n');
// }

function objStringVerts() {
  let result = [];
  let v = null;
  for (let i = 0, sz0 = verts.length, j, sz1; i < sz0; ++i) {
    for (j = 0, sz1 = verts[i].length; j < sz1; ++j) {
      v = verts[i][j];
      result.push('v ' +
        v._x.toFixed(6) + ' ' +
        v._y.toFixed(6) + ' ' +
        v._z.toFixed(6));
    }
  }
  return result.join('\n');
}

// function objStringUvs() {
//   let result = [];
//   let v = null;
//   for (let i = 0, sz0 = uvs.length, j, sz1; i < sz0; ++i) {
//     for (j = 0, sz1 = uvs[i].length; j < sz1; ++j) {
//       v = uvs[i][j];
//       result.push('vt ' + v._x.toFixed(4) + ' ' + v._y.toFixed(4));
//     }
//   }
//   return result.join('\n');
// }

function objSave() {
  const txt = objString();
  const uri = encodeURIComponent(txt);
  let elt = document.createElement('a');
  elt.setAttribute('href', 'data:text/plain;charset=utf-8,' + uri);
  elt.setAttribute('download', fileName);
  elt.click();
}

function randomCurveCartesian(lod,
  xmin = 0, xmax = window.innerWidth,
  ymin = 0, ymax = window.innerHeight,
  zmin = -window.innerWidth * 0.5, zmax = window.innerWidth * 0.5) {
  let rndvec = [];
  rndvec.push(Vector.randomCartesian(xmin, xmax, ymin, ymax, zmin, zmax));
  for (let i = 0; i < curvesperspline; ++i) {
    rndvec.push(Vector.randomCartesian(xmin, xmax, ymin, ymax, zmin, zmax));
    rndvec.push(Vector.randomCartesian(xmin, xmax, ymin, ymax, zmin, zmax));
    rndvec.push(Vector.randomCartesian(xmin, xmax, ymin, ymax, zmin, zmax));
  }
  return new DiscreteCubicBezierLoop(rndvec, lod);
}

function randomCurvePolar(lod,
  mintheta = 0, maxtheta = Math.TWO_PI,
  minphi = 0, maxphi = Math.PI,
  radius = Math.min(window.innerWidth, window.innerHeight) * 0.5,
  offset = Vector.zero) {
  let rndvec = [];
  rndvec.push(Vector.randomPolar(mintheta, maxtheta, minphi, maxphi, radius, offset));
  for (let i = 0; i < curvesperspline; ++i) {
    rndvec.push(Vector.randomPolar(mintheta, maxtheta, minphi, maxphi, radius, offset));
    rndvec.push(Vector.randomPolar(mintheta, maxtheta, minphi, maxphi, radius, offset));
    rndvec.push(Vector.randomPolar(mintheta, maxtheta, minphi, maxphi, radius, offset));
  }
  return new DiscreteCubicBezierLoop(rndvec, lod);
}

function svgSave(fill = 'transparent',
  stroke = '#000000',
  strokeWeight = taper[0]) {
  const rndname = spline.getClass() + '_' + String.random(5);
  fileName = rndname + '.svg';
  let txt = '<?xml version="1.0" encoding="utf-8"?><svg version="1.1" id="' + rndname + '" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 ' + cnvs.width + ' ' + cnvs.height + '" xml:space="preserve">';
  txt += spline.toSvgPath(fill, stroke, strokeWeight);
  txt += '</svg>';
  const uri = encodeURIComponent(txt);
  let elt = document.createElement('a');
  elt.setAttribute('href', 'data:text/plain;charset=utf-8,' + uri);
  elt.setAttribute('download', fileName);
  elt.click();
}

// Event callbacks.
function onContextMenu(e) {
  return false;
}

function onKeyDown(e) {
  // console.log(e.keyCode);

  if (e.keyCode == 67) {
    // C
    spline.rotateY(rotateSpeed * rotateDir);
    updateVertices(spline, lindetail, raddetail);
  } else if (e.keyCode === 68) {
    // D
    adjustForward = CubicBezierSpline.mirrorControlPoint0;
    adjustBackward = CubicBezierSpline.mirrorControlPoint1;
  } else if (e.keyCode === 69) {
    // E
    currEditMode = EditModes.mouseYtoZ;
  } else if (e.keyCode === 70) {
    // F
    adjustForward = null;
    adjustBackward = null;
  } else if (e.keyCode === 88) {
    // X
    spline.rotateX(rotateSpeed * rotateDir);
    updateVertices(spline, lindetail, raddetail);
  } else if (e.keyCode === 90) {
    // Z
    spline.rotateZ(rotateSpeed * rotateDir);
    updateVertices(spline, lindetail, raddetail);
  } else if (e.keyCode === 97 || e.keyCode === 35) {
    // Numpad 1, End
    spline.scale(downscalar);
    updateVertices(spline, lindetail, raddetail);
  } else if (e.keyCode === 98 || e.keyCode === 40) {
    // Numpad 2, Down arrow. Inverted for 2d Canvas.
    spline.translate(Vector.scale(Vector.up, translationSpeed));
    updateVertices(spline, lindetail, raddetail);
  } else if (e.keyCode === 99 || e.keyCode === 34) {
    // Numpad 9, PgUp
    updateCrossSectionScalars(-fattenSpeed);
    updateVertices(spline, lindetail, raddetail);
  } else if (e.keyCode === 100 || e.keyCode === 37) {
    // Numpad 4, Left arrow
    spline.translate(Vector.scale(Vector.left, translationSpeed));
    updateVertices(spline, lindetail, raddetail);
  } else if (e.keyCode === 102 || e.keyCode === 39) {
    // Numpad 6, Right arrow
    spline.translate(Vector.scale(Vector.right, translationSpeed));
    updateVertices(spline, lindetail, raddetail);
  } else if (e.keyCode == 103 || e.keyCode === 36) {
    // Numpad 7, Home
    spline.scale(upscalar);
    updateVertices(spline, lindetail, raddetail);
  } else if (e.keyCode === 104 || e.keyCode === 38) {
    // Numpad 8, Up arrow. Inverted for 2d Canvas.
    spline.translate(Vector.scale(Vector.down, translationSpeed));
    updateVertices(spline, lindetail, raddetail);
  } else if (e.keyCode === 105 || e.keyCode === 33) {
    // Numpd 9, PgUp
    updateCrossSectionScalars(fattenSpeed);
    updateVertices(spline, lindetail, raddetail);
  }
}

function onKeyUp(e) {
  if (e.keyCode === 65) {
    // A
    showMesh = (showMesh + 1) % 4;
  } else if (e.keyCode === 68) {
    // D
    adjustForward = CubicBezierSpline.alignControlPoint0;
    adjustBackward = CubicBezierSpline.alignControlPoint1;
  } else if (e.keyCode === 69) {
    // E
    currEditMode = EditModes.mouseYtoY;
  } else if (e.keyCode === 70) {
    // F
    adjustForward = CubicBezierSpline.alignControlPoint0;
    adjustBackward = CubicBezierSpline.alignControlPoint1;
  } else if (e.keyCode == 71) {
    // G
    showControlNet = !showControlNet;
  } else if (e.keyCode === 81) {
    // Q
    cnvs.screenCap('splineBrowser' + new Date().getMilliseconds());
  } else if (e.keyCode === 83) {
    // S
    objSave();
  } else if (e.keyCode === 86) {
    // V
    rotateDir *= -1;
  } else if (e.keyCode === 87) {
    // W
    spline = randomCurvePolar(lindetail);
    initTaper(7, 10, 80);
    initCrossSectionScalars(lindetail, taper, Math.smootherStep);
    updateVertices(spline, lindetail, raddetail);
  }
}

function onMouseDown(e) {
  if (e.button === 0) {
    // Left
    inEditingMode = true;
  } else if (e.button === 1) {
    // Middle
  } else if (e.button === 2) {

  }
}

function onMouseMove(e) {

  if (e.buttons === 1) {
    // Left
    let y, z;
    if (currEditMode === EditModes.mouseYtoY) {
      y = e.clientY - center.y;
      z = undefined;
    } else if (currEditMode === EditModes.mouseYtoZ) {
      y = undefined;
      z = e.clientY - center.y;
    }

    spline.adjust(curreditcurve, curreditpoint,
      e.clientX - center.x, y, z,
      adjustForward, adjustBackward);
    // spline.adjust(curreditpoint, e.clientX, y, z);

    updateVertices(spline, lindetail, raddetail);
  } else if (e.buttons === 4) {
    // Middle
  }
}

function onMouseUp(e) {
  if (e.button === 0) {
    // Left
    inEditingMode = false;
  } else if (e.button === 1) {
    // Middle
    curreditcurve = (curreditcurve + 1) % spline.getCurveCount();
  } else if (e.button === 2) {
    // Right
    curreditpoint = (curreditpoint + 1) % 4;
  }
}

function onResize(e) {
  cnvs.resize(window.innerWidth, window.innerHeight);
  cnvs.setFont('bold', '12px', 'sans-serif');
  center.set(cnvs.width * .5, cnvs.height * .5, 0);
  cnvs.translate(center);
}
