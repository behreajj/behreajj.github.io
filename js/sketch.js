'use strict';

var cnvs = null;
var ctx = null;
var vid = null;
var camstream = null;
var frameCount = 0;
var mediaOptions = {audio: true, video: true};

window.onload = setup;

// Deal with cross-browser naming conventions.
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

function setup() {

  // Create canvas.
  cnvs = document.createElement('canvas');
  cnvs.id = 'canvas';
  cnvs.width = window.innerWidth;
  cnvs.height = window.innerHeight;
  document.body.appendChild(cnvs);
  ctx = cnvs.getContext('2d');

  // If media available, create video.
  if (navigator.getUserMedia) {
    vid = document.createElement('video');
    vid.style.display = "none";
    navigator.getUserMedia(mediaOptions, mediaSuccess, mediaError);
  }

  window.onresize = function(e) {
    onResize(cnvs);
  };

  window.requestAnimationFrame(draw);
}

function draw(e) {
  frameCount++;

  let h = cnvs.height;
  let w = cnvs.width;

  if(camstream) {
    ctx.drawImage(vid, 0, 0, w, h);
  }

  window.requestAnimationFrame(draw);
}

function onResize(cv, w = window.innerWidth, h = window.innerHeight) {
  cv.width = w;
  cv.height = h;
}

function mediaSuccess(e) {
  vid.src = window.URL.createObjectURL(e);
  camstream = e;
}

function mediaError(e) {
  console.log(e);
}
