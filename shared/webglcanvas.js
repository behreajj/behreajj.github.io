'use strict'

class WebGLCnvs extends Cnvs {
  constructor(width = Cnvs.defaultWidth,
    height = Cnvs.defaultHeight,
    styleWidth = Cnvs.defaultStyleWidth,
    styleHeight = Cnvs.defaultStyleHeight,
    imageRendering = WebGLCnvs.defaultImageRendering,
    contextAttributes = WebGLCnvs.defaultContextAttributes,
    imageSmoothing = WebGLCnvs.defaultImageSmoothingEnabled,
    imageSmoothingQuality = Cnvs.defaultImageSmoothingQuality,
    cnvsId = Cnvs.defaultCanvasId) {
    super(width, height, styleWidth, styleHeight, imageRendering, Cnvs.renderingContext.webgl, contextAttributes, imageSmoothing, imageSmoothingQuality, cnvsId);

  }

  background(clr) {
    this._ctx.clearColor(clr[0], clr[1], clr[2], clr[3]);
    this._ctx.clear(this._ctx.COLOR_BUFFER_BIT);
  }

  draw(clr) {
    this.background(clr);
    this._ctx.enable(this._ctx.DEPTH_TEST);
  }

  getClass() {
    return this.constructor.name;
  }
}

WebGLCnvs.createPosBuffer = function(gl, positions) {
  let posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW);
  return posBuffer;
}

WebGLCnvs.createProgram = function(gl, shaders) {
  let program = gl.createProgram();
  for (let i = 0, sz = shaders.length; i < sz; ++i) {
    gl.attachShader(program, shaders[i]);
  }
  gl.linkProgram(program);

  // If there is a compilation problem, throw an exception.
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw gl.getProgramInfoLog(program);
  }
  return program;
}

WebGLCnvs.createShader = function(gl, srctxt, type) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, srctxt);
  gl.compileShader(shader);

  // If there is a compilation problem, throw an exception.
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw gl.getShaderInfoLog(shader);
  }
  return shader;
}

WebGLCnvs.defaultImageRendering = Cnvs.canvasImageRendering.crispEdges;
WebGLCnvs.defaultImageSmoothingEnabled = Cnvs.contextImageSmoothing.enabled;
WebGLCnvs.defaultContextAttributes = {
  antialias: true,
  preserveDrawingBuffer: true,
  alpha: true
};
