'use strict';

const instructionsText = `<b>INSTRUCTIONS</b><br\>
LMB: Adjust selected point.<br\>
RMB: Cycle through points on curve.<br\>
MMB: Cycle through curves on spline.<br\><br\>
A: Toggle mesh display.<br\>
C: Rotate on Y-axis.<br\>
D: Mirrored control point adjust.<br\>
E: Mouse Y changes Point Z.<br\>
F: Free control point adjust.<br\>
G: Toggle control net.<br\>
S: Save in .obj format.<br\>
W: New random curve.<br\>
X: Rotate on X-axis.<br\>
Z: Rotate on Z-axis.
`;
const EditModes = {
  mouseYtoY: 0,
  mouseYtoZ: 1
}

var framecount = 0;
var mousex = 0;
var mousey = 0;
var rotateSpeed = .0003;

var cnvs = null;
var bkgcolor = 'rgb(30, 30, 30)';

// Spline details.
var spline = null;
var curvesperspline = 5;

// Spline editing.
var curreditcurve = 0;
var curreditpoint = 0;
var inEditingMode = false;
var adjustForward = CubicBezierSpline.alignControlPoint0;
var adjustBackward = CubicBezierSpline.alignControlPoint1;
var currEditMode = EditModes.mouseYtoY;
var showControlNet = true;
var showMesh = true;

// Walker
// var walkerstep = 0;
// var walkerspeed = curvesperspline / 800.0;
// var walkerdiv = null;

// Mesh
var lindetail = 128;
var raddetail = 8;
var verts = [];
var indices = [];
var faces = [];

// Export
var objUrl;
var fileName = 'blob.obj';

// World
var modelView = null;
var cameraInverse = null;

window.onload = setup

function setup(e) {
  cnvs = new TwoDCnvs(window.innerWidth, window.innerHeight);
  cnvs.append(document.body);

  modelView = Matrix4x4.identity.copy();
  cameraInverse = Matrix4x4.identity.copy();

  halfw = cnvs.width * .5;
  halfh = cnvs.height * .5;
  cameraInverse._m[0][3] = halfw;
  cameraInverse._m[1][3] = halfh;
  cameraInverse._m[2][3] = 0;
  modelView._m[0][3] = -halfw;
  modelView._m[1][3] = -halfh;

  randomCurve();

  spline.applyModel(Matrix4x4.identity, modelView, cameraInverse);
  // Does need to be updated on curve change.
  initVerts(lindetail, raddetail);

  // Do not need to be updated on curve change.
  initIndices(lindetail, raddetail);
  initFaces(lindetail, raddetail);

  initInstructions(document.body);

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

var halfw;
var halfh;

function draw(e) {
  framecount++;

  // Draw background.
  cnvs.ctx.fillStyle = bkgcolor;
  cnvs.ctx.fillRect(0, 0, cnvs.width, cnvs.height);

  if (showMesh) {
    drawQuads2d(cnvs.ctx);
  } else {
    spline.draw2d(cnvs.ctx);
  }

  if (showControlNet) {
    spline.drawConstruction2d(cnvs.ctx);
    spline.drawPointLabels2d(cnvs.ctx, curreditcurve, curreditpoint);
  }

  // Draw spline walker.
  // drawWalker(cnvs.ctx, (walkerstep += walkerspeed) % 1);
  // div.style.transform = spline.calcTransform(walkerstep).toCss2d();

  // Request next frame.
  window.requestAnimationFrame(draw);
}

function drawIndexLabel(ctx, label, x, y, clr) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = clr;
  ctx.fillStyle = '#000'
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.TWO_PI);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = clr;
  ctx.fillText(label, x, y);
}

function drawQuad2d(ctx, v00, v10, v11, v01,
  lw = 1, clr = '#fff') {
  ctx.lineWidth = lw;
  ctx.fillStyle = clr;
  ctx.beginPath();
  ctx.moveTo(v00.x, v00.y);
  ctx.lineTo(v10.x, v10.y);
  ctx.lineTo(v11.x, v11.y);
  ctx.lineTo(v01.x, v01.y);
  ctx.closePath();
  ctx.fill();
}

function drawQuads2d(ctx) {
  for (let i = 1, k = 0; i < lindetail; ++i) {
    let l = i - 1;
    let hue = 360 * l / lindetail;
    for (let j = 0; j < raddetail; ++j, ++k) {
      let m = (j + 1) % raddetail;
      let v00 = verts[l][j];
      let v10 = verts[i][j];
      let v11 = verts[i][m];
      let v01 = verts[l][m];
      let clr = 'hsla(' + hue + ', 100%, 50%, 667)';

      drawQuad2d(ctx, v00, v10, v11, v01, 1, clr);

      // drawIndexLabel(ctx, faces[k][0], v00._x, v00._y, clr);
      // drawIndexLabel(ctx, faces[k][1], v10._x, v10._y, clr);
      // drawIndexLabel(ctx, faces[k][2], v11._x, v11._y, clr);
      // drawIndexLabel(ctx, faces[k][3], v01._x, v01._y, clr);
    }
  }
}

function drawWalker(ctx, t) {
  spline.transform2d(ctx, t);
  ctx.beginPath();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#fff';
  ctx.arc(0, 0, 15, Math.QUARTER_PI, Math.TWO_PI - Math.QUARTER_PI, false);
  ctx.stroke();
  ctx.resetTransform();
}

function initFaces(ld, rd) {
  faces = [];
  for (let i = 1, k = 0; i < ld; ++i) {
    let l = i - 1;
    for (let j = 0; j < rd; ++j) {
      let m = (j + 1) % rd;
      faces.push([indices[l * rd + j],
        indices[i * rd + j],
        indices[i * rd + m],
        indices[l * rd + m]
      ]);
    }
  }
}

function initIndices(ld, rd) {
  let sz = ld * rd;
  for (let i = 0; i < sz; ++i) {
    indices.push(i + 1);
  }
}

function initInstructions(elt) {
  let div = document.createElement('div');
  div.innerHTML = instructionsText;
  div.id = 'instructions';
  elt.appendChild(div);
}

function initVerts(ld, rd) {
  verts = [];
  let ldf = ld - 1;
  for (let i = 0, k = 0; i < ld; ++i) {
    let l = i + 1;
    verts.push([]);
    let localSpace = spline.calcTransform(i / ldf);
    for (let j = 0; j < rd; ++j, ++k) {
      let m = (j + 1) % rd;
      let t = Math.TWO_PI * j / rd;
      verts[i].push(Matrix4x4.model(
        Math.cos(t) * 25,
        Math.sin(t) * 25,
        0,
        localSpace,
        modelView,
        cameraInverse));
    }
  }
}

function objString() {
  let rndname = spline.getClass() + '_' + String.random(5);
  fileName = rndname + '.obj';
  let result = '# Spline Generator\r\n# ' + new Date() +
    '\r\n# Verts: ' + (verts.length * verts[0].length) +
    '\r\n# Faces: ' + faces.length +
    '\r\no ' + rndname + '\r\n';
  result += objStringVerts();
  result += '\r\ns off\r\n';
  result += objStringFaces();
  return result;
}

function saveObj() {
  let txt = objString();
  let uri = encodeURIComponent(txt);
  let elt = document.createElement('a');
  elt.setAttribute('href', 'data:text/plain;charset=utf-8,' + uri);
  elt.setAttribute('download', fileName);
  elt.click();
}

function objStringFaces() {
  let result = [];
  for (let i = 0, sz0 = faces.length; i < sz0; ++i) {
    result.push([]);
    for (let j = 0, sz1 = faces[i].length; j < sz1; ++j) {
      result[i].push(faces[i][j]);
    }
    result[i] = 'f ' + result[i].join(' ');
  }
  return result.join('\r\n');
}

function objStringVerts() {
  let result = [];
  for (let i = 0, sz0 = verts.length; i < sz0; ++i) {
    for (let j = 0, sz1 = verts[i].length; j < sz1; ++j) {
      let v = verts[i][j];
      result.push('v ' + v.x.toFixed(6) + ' ' +
        v.y.toFixed(6) + ' ' +
        v.z.toFixed(6));
    }
  }
  return result.join('\r\n');
}

// function initCurve(xmin, xmax, ymin, ymax, zmin = 0, zmax = 0) {
//   let rndvec = [];
//   let cx = window.innerWidth * .5;
//   let cy = window.innerHeight * .5;
//   let rad = window.innerHeight * .5;
//   rndvec.push(new Vector(window.innerWidth, 0, 0));
//   for (let i = 0, k = 0; i < curvesperspline; ++i) {
//     for (let j = 0; j < 3; ++j, ++k) {
//       let t = Math.TWO_PI * (k / (curvesperspline * 3));
//       rndvec.push(new Vector(cx + Math.cos(t) * rad, cy + Math.cos(t) * rad), 0);
//     }
//   }
//
//   spline = new CubicBezierLoop(rndvec);
// }

function randomCurve(xmin = 0, xmax = window.innerWidth, ymin = 0, ymax = window.innerHeight, zmin = -window.innerHeight * 0.5, zmax = window.innerHeight * 0.5) {
  let rndvec = [];

  rndvec.push(Vector.random(xmin, xmax, ymin, ymax, zmin, zmax));
  for (let i = 0; i < curvesperspline; ++i) {
    rndvec.push(Vector.random(xmin, xmax, ymin, ymax, zmin, zmax));
    rndvec.push(Vector.random(xmin, xmax, ymin, ymax, zmin, zmax));
    rndvec.push(Vector.random(xmin, xmax, ymin, ymax, zmin, zmax));
  }

  spline = new CubicBezierLoop(rndvec);
  // orientCurve();
}

// Event callbacks.
function onContextMenu(e) {
  return false;
}

function onKeyDown(e) {
  if (e.keyCode === 16) {
    // Shift
  } else if (e.keyCode == 67) {
    // C
    cameraInverse.rotateY(rotateSpeed);
    spline.applyModel(Matrix4x4.identity, modelView, cameraInverse);
    // spline.applyModel(modelView, Matrix4x4.identity, cameraInverse);
    initVerts(lindetail, raddetail);
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
    cameraInverse.rotateX(rotateSpeed);
    spline.applyModel(Matrix4x4.identity, modelView, cameraInverse);
    // spline.applyModel(modelView, Matrix4x4.identity, cameraInverse);
    initVerts(lindetail, raddetail);
  } else if (e.keyCode === 90) {
    // Z
    cameraInverse.rotateZ(rotateSpeed);
    spline.applyModel(Matrix4x4.identity, modelView, cameraInverse);
    // spline.applyModel(modelView, Matrix4x4.identity, cameraInverse);
    initVerts(lindetail, raddetail);
  }
}

function onKeyUp(e) {
  if (e.keyCode === 16) {
    // Shift
  } else if (e.keyCode === 65) {
    // A
    showMesh = !showMesh;
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
  } else if (e.keyCode === 83) {
    // S
    saveObj()
  } else if (e.keyCode === 87) {
    // W
    // let halfw = cnvs.width * .5;
    // let halfh = cnvs.height * .5;
    randomCurve();
    spline.applyModel(Matrix4x4.identity, modelView, cameraInverse);
    initVerts(lindetail, raddetail);
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

  // Normalized mouse position.
  mousex = e.clientX / window.innerWidth;
  mousey = e.clientY / window.innerHeight;

  if (e.buttons === 1) {
    // Left

    let y, z;
    if (currEditMode === EditModes.mouseYtoY) {
      y = e.clientY;
      z = undefined;
    } else if (currEditMode === EditModes.mouseYtoZ) {
      y = undefined;
      z = e.clientY;
    }

    spline.adjust(curreditcurve, curreditpoint,
      e.clientX, y, z,
      adjustForward, adjustBackward);
    initVerts(lindetail, raddetail);
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
  halfw = cnvs.width * .5;
  halfh = cnvs.height * .5;
  cameraInverse._m[0][3] = halfw;
  cameraInverse._m[1][3] = halfh;
  cameraInverse._m[2][3] = 0;
  modelView._m[0][3] = -halfw;
  modelView._m[1][3] = -halfh;
}
