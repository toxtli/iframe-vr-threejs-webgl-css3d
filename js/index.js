var camera, scene, renderer;
var controls, spinner, noSleep;

var stereoEnabled = false;
var currentView = 'table';
var objects = [];
var globals = {};
var loadTime = 0;
var db = null;

function run() {
	init();
}

function loadIframe(url) {
	var gridX = 5;
	var gridY = 5;
	var duration = 500;
	var timeOut = 100;
	var element = document.createElement( 'div' );
	element.className = 'element';
	element.style.width = '1024px';
	element.style.height = '768px';
	element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
	var iframe = document.createElement( 'iframe' );
	iframe.style.backgroundColor = '#ffffff';
	iframe.style.width = '1024px';
	iframe.style.height = '768px';
	loadTime = (new Date()).getTime();
	iframe.src = url;
	iframe.onload = function(e) {
		var diff = (new Date()).getTime() - loadTime;
		if (diff < timeOut) {
			iframe.src = "data:text/html;charset=utf-8," + escape('<h1>XSS</h1>');
		}
	};
	element.appendChild( iframe );
	
	var object = new THREE.CSS3DObject( element );
	object.position.x = Math.random() * 4000 - 2000;
	object.position.y = Math.random() * 4000 - 2000;
	object.position.z = Math.random() * 4000 - 2000;
	var target = new THREE.Object3D();
	target.position.x = 0;
	target.position.y = 0;
	scene.add( object );

	if (stereoEnabled) {
		renderer = new THREE.CSS3DStereoRenderer();
	} else {
		renderer = new THREE.CSS3DRenderer();
	}
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.style.position = 'absolute';
	document.getElementById( 'container' ).appendChild( renderer.domElement );

	if (stereoEnabled) {
		controls = new THREE.TrackballAndOrientationControls( camera, renderer.domElement );
	} else {
		controls = new THREE.TrackballControls( camera, renderer.domElement );
	}
	controls.rotateSpeed = 0.5;
	controls.minDistance = 500;
	controls.maxDistance = 6000;
	controls.addEventListener( 'change', render );

	window.addEventListener( 'resize', onWindowResize, false );

	TWEEN.removeAll();
	new TWEEN.Tween( object.position )
		.to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
		.easing( TWEEN.Easing.Exponential.InOut )
		.start();
	new TWEEN.Tween( object.rotation )
		.to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
		.easing( TWEEN.Easing.Exponential.InOut )
		.start();
	new TWEEN.Tween( this )
		.to( {}, duration * 2 )
		.onUpdate( render )
		.start();

	animate();
}

function initControls() {
	if (stereoEnabled) {
		$("#vrbutton").text("VR is On");
		$("#graph").hide();
		noSleep.enable();
	} else {
		$("#vrbutton").text("VR is Off");
	}
	$("#container").on("touchstart", function(){
		if (stereoEnabled) {
			$("#menu").toggle();
		}
	});
	$("#vrbutton").on("click", function(e) {
		if (stereoEnabled) {
			window.location.href = "#3d";
			window.location.reload(true);
		} else {
			window.location.href = "#vr";
			window.location.reload(true);
		}
	});
	$("#fullscreen").on("click", function(e) {
		toggleFullScreen();
		console.log(navigator.standalone);
	});
}

function toggleFullScreen() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
}

function enableNoSleep() {
  noSleep.enable();
  document.removeEventListener('click', enableNoSleep, false);
}

function init() {
	var param = window.location.hash?window.location.hash.replace("#",""):"";
	stereoEnabled = param.toLowerCase() == "vr"? true: false;
	noSleep = new NoSleep();
	document.addEventListener('click', enableNoSleep, false);
	initControls();
	init3D(stereoEnabled);
	loadIframe("https://www.youtube.com/embed/eRsGyueVLvQ");
	$(".loader").hide();
}

function init3D(stereoEnabled) {
	if (stereoEnabled) {
		THREE.CSS3DObject = function ( element ) {

			THREE.Object3D.call( this );

			this.elementL = element.cloneNode( true );
			this.elementL.style.position = 'absolute';

			this.elementR = element.cloneNode( true );
			this.elementR.style.position = 'absolute';

			this.addEventListener( 'removed', function ( event ) {

				if ( this.elementL.parentNode !== null ) {

					this.elementL.parentNode.removeChild( this.elementL );

				}

				if ( this.elementR.parentNode !== null ) {

					this.elementR.parentNode.removeChild( this.elementR );

				}

			} );

		};

		THREE.CSS3DObject.prototype = Object.create( THREE.Object3D.prototype );
		THREE.CSS3DObject.prototype.constructor = THREE.CSS3DObject;

		THREE.CSS3DSprite = function ( element ) {

			THREE.CSS3DObject.call( this, element );

		};

		THREE.CSS3DSprite.prototype = Object.create( THREE.CSS3DObject.prototype );
		THREE.CSS3DSprite.prototype.constructor = THREE.CSS3DSprite;

	} else {

		THREE.CSS3DObject = function ( element ) {

			THREE.Object3D.call( this );

			this.element = element;
			this.element.style.position = 'absolute';

			this.addEventListener( 'removed', function () {

				if ( this.element.parentNode !== null ) {

					this.element.parentNode.removeChild( this.element );

				}

			} );

		};

		THREE.CSS3DObject.prototype = Object.create( THREE.Object3D.prototype );
		THREE.CSS3DObject.prototype.constructor = THREE.CSS3DObject;

		THREE.CSS3DSprite = function ( element ) {

			THREE.CSS3DObject.call( this, element );

		};

		THREE.CSS3DSprite.prototype = Object.create( THREE.CSS3DObject.prototype );
		THREE.CSS3DSprite.prototype.constructor = THREE.CSS3DSprite;
	}
	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 3000;
	scene = new THREE.Scene();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	render();
}

function animate() {
	requestAnimationFrame( animate );
	TWEEN.update();
	controls.update();
}

function render() {
	renderer.render( scene, camera );
}

run();
