<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta http-equiv="X-UA-Compatible" content="chrome=1">
<link href="http://fonts.googleapis.com/css?family=Open+Sans:300" rel="stylesheet" type="text/css">
<link href="css/common.css" rel="stylesheet" type="text/css">
<link rel="stylesheet" type="text/css" href="css/style.css" />
<link rel="stylesheet" type="text/css" href="css/style2.css" />

<style>
@-webkit-keyframes glowRed {
  from {
    box-shadow: rgba(255, 0, 0, 0) 0 0 0;
  }
  50% {
    box-shadow: rgba(255, 0, 0, 1) 0 0 15px 1px;
  }
  to {
    box-shadow: rgba(255, 0, 0, 0) 0 0 0;
  }
}
html, body {
  overflow: hidden;
  margin: 0;
  padding: 0;
}
body {
  display: -webkit-flex;
  -webkit-align-items: center;
  -webkit-justify-content: center;
  box-sizing: border-box;
}
article {
  text-align: center;
}
#monitor {
  /*-webkit-transform: scaleX(-1);*/
  height: 300px;
  /*-webkit-box-reflect: below 20px -webkit-linear-gradient(top, transparent, transparent 80%, rgba(255,255,255,0.2));*/
}
#live {
  position: absolute;
  z-index: 1;
  color: white;
  font-weight: 600;
  font-family: Arial;
  font-size: 16pt;
  right: 35px;
  top: 20px;
  text-shadow: 1px 1px red;
  letter-spacing: 1px;
}
#live:before {
  content: '';
  border-radius: 50%;
  width: 15px;
  height: 15px;
  background: red;
  position: absolute;
  left: -20px;
  margin-top: 5px;
}
#gallery img {
  position: absolute;
  z-index: -1;
  height: 75px;
}
#gallery img {
  float: left;
  height: 75px;
}
.container {
  padding: 10px 25px 5px 25px;
  background: black;
  border-radius: 4px;
  display: inline-block;
  position: relative;
}
h1 {
  font-weight: 300;
}
.blur {
  -webkit-filter: blur(3px);
}
.brightness {
  -webkit-filter: brightness(5);
}
.contrast {
  -webkit-filter: contrast(8);
}
.hue-rotate {
  -webkit-filter: hue-rotate(90deg);
}
.hue-rotate2 {
  -webkit-filter: hue-rotate(180deg);
}
.hue-rotate3 {
  -webkit-filter: hue-rotate(270deg);
}
.saturate {
  -webkit-filter: saturate(10);
}
.grayscale {
  -webkit-filter: grayscale(1);
}
.sepia {
  -webkit-filter: sepia(1);
}
.invert {
  -webkit-filter: invert(1)
}

canvas {
    display: none;
}
video, img {
    display: block;
    float: left;
    border: 10px solid #fff;
    border-radius: 10px;
	width: 380px;
    height: 290px;
	margin-left:90px;
}

#container {
    overflow: hidden;
    width: 880px;
    margin: 20px auto;
}
</style>
</head>
<body id="body">
  <div id="main">
		
  <div id="header" ></div>
 
<video id="video" onclick="changeFilter(this)"></video>
<canvas id="canvas"></canvas>
<img src="http://placekitten.com/g/200/150" id="photo" alt="photo" style="margin-left:90px;">
<button id="btn" onclick="init(this)">Take photo</button>
<script>
(function() {

  var streaming = false,
      video        = document.querySelector('#video'),
      cover        = document.querySelector('#cover'),
      canvas       = document.querySelector('#canvas'),
      photo        = document.querySelector('#photo'),
      startbutton  = document.querySelector('#btn'),
      width = 200,
      height = 0;


  navigator.getMedia = ( navigator.getUserMedia || 
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);

  navigator.getMedia(
    { 
      video: true, 
      audio: false 
    },
    function(stream) {
      if (navigator.mozGetUserMedia) { 
        video.mozSrcObject = stream;
      } else {
        var vendorURL = window.URL || window.webkitURL;
        video.src = vendorURL ? vendorURL.createObjectURL(stream) : stream;
      }
      video.play();
    },
    function(err) {
      console.log("An error occured! " + err);
    }
  );

  video.addEventListener('canplay', function(ev){
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth/width);
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  }, false);

  function takepicture() {
    canvas.width = width;
    canvas.height = height;
    canvas.getContext('2d').drawImage(video, 0, 0, width, height);
    var data = canvas.toDataURL('image/png');
    photo.setAttribute('src', data);
  }

  startbutton.addEventListener('click', function(ev){
      takepicture();
    ev.preventDefault();
  }, false);

})();

var app = document.getElementById('app');
var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var effect = document.getElementById('effect');
var gallery = document.getElementById('gallery');
var ctx = canvas.getContext('2d');
var intervalId = null;
var idx = 0;
var filters = [
  'grayscale',
  'sepia',
  'blur',
  'brightness',
  'contrast',
  'hue-rotate', 'hue-rotate2', 'hue-rotate3',
  'saturate',
  'invert',
  ''
];

function init(el) {
  if (!navigator.getUserMedia) {
    document.getElementById('errorMessage').innerHTML = 'Sorry. <code>navigator.getUserMedia()</code> is not available.';
    return;
  }
  el.onclick = capture;
  navigator.getUserMedia({video: true}, gotStream, noStream);
}

function capture() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    return;
  }
}

window.addEventListener('keydown', function(e) {
  if (e.keyCode == 27) { // ESC
    document.querySelector('details').open = false;
  }
}, false);

function changeFilter(el) {
  el.className = '';
  var effect = filters[idx++ % filters.length];
  if (effect) {
    el.classList.add(effect);
  }
}


</script>
<script>
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-22014378-1']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
</script>
</div>
</body>

</html>