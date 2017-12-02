var camera, scene, renderer;
var controls, spinner, noSleep;
var Graph;

var stereoEnabled = false;
var currentView = 'table';
var objects = [];
var targets = { table: [], sphere: [], helix: [], grid: [] };
var globals = {};
var loadTime = 0;
var db = null;

function run() {
	init();
	loadNews();
}

function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

function openElement(id) {
	var obj = objects[id];
	var element = document.createElement( 'div' );
	element.className = 'element';
	element.style.width = '1024px';
	element.style.height = '818px';
	element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
	var header = document.createElement( 'div' );
	header.style.width = '1024px';
	header.style.height = '50px';
	var titleBar = document.createElement( 'div' );
	titleBar.style.display = 'inline';
	titleBar.style.float = 'left';
	titleBar.style.width = '900px';
	titleBar.style.height = '50px';
	titleBar.innerHTML = '<a style="color:#ffffff;font-size:24px" href="' + obj.extra.url + '" target="_blank">' + obj.extra.title + '</a>';
	header.appendChild( titleBar );
	var closeButton = document.createElement( 'div' );
	closeButton.style.display = 'inline';
	closeButton.style.float = 'right';
	closeButton.style.width = '124px';
	closeButton.style.height = '50px';
	closeButton.innerHTML = "X";
	header.appendChild( closeButton );
	element.appendChild( header );
	var iframe = document.createElement( 'iframe' );
	iframe.style.backgroundColor = '#ffffff';
	iframe.style.width = '1024px';
	iframe.style.height = '768px';
	loadTime = (new Date()).getTime();
	iframe.src = obj.extra.url;
	iframe.onload = function(e) {
		var diff = (new Date()).getTime() - loadTime;
		if (diff < 900) {
			iframe.src = "data:text/html;charset=utf-8," + escape('<div style="font-size:48px;">' + obj.extra.description + '</div>');
		}
	};
	element.appendChild( iframe );
	var duration = 500;
	var object = new THREE.CSS3DObject( element );
	object.rotation.x = 0;
	object.rotation.y = 1.5;
	object.rotation.z = 0;
	object.position.x = obj.position.x;
	object.position.y = obj.position.y;
	object.position.z = obj.position.z;
	closeButton.addEventListener('click', function(){
		scene.remove(object);
	});
	var target = new THREE.Object3D();
	target.rotation.x = obj.rotation.x;
	target.rotation.y = obj.rotation.y;
	target.rotation.z = obj.rotation.z;
	target.position.x = obj.position.x;
	target.position.y = obj.position.y;
	target.position.z = obj.position.z + ( Math.random() * 200 + 200 );
	scene.add( object );
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
	// openInNewTab(objects[id].extra.url);
}

function loadData(table) {
	globals.dataLoaded = table;
	for ( var i = 0; i < table.length; i++) {
		var obj = table[i];
		var element = document.createElement( 'div' );
		element.className = 'element';
		element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
		var number = document.createElement( 'div' );
		number.className = 'number';
		number.textContent = obj.date;
		element.appendChild( number );
		var symbol = document.createElement( 'div' );
		symbol.className = 'symbol';
		symbol.innerHTML = '<a href="javascript:openElement('+i+')"><img src="' + obj.img + '"></a>';
		element.appendChild( symbol );
		var details = document.createElement( 'div' );
		details.className = 'details';
		details.innerHTML = obj.title;
		element.appendChild( details );
		var object = new THREE.CSS3DObject( element );
		object.position.x = Math.random() * 4000 - 2000;
		object.position.y = Math.random() * 4000 - 2000;
		object.position.z = Math.random() * 4000 - 2000;
		object.extra = obj;
		scene.add( object );
		objects.push( object );
		//
		var object = new THREE.Object3D();
		object.position.x = ( obj.col * 140 ) - 1330;
		object.position.y = - ( obj.row * 180 ) + 990;
		targets.table.push( object );
	}
	renderView();
	animate();
}

function renderView() {
	// sphere

	var vector = new THREE.Vector3();
	var spherical = new THREE.Spherical();

	for ( var i = 0, l = objects.length; i < l; i ++ ) {
		var phi = Math.acos( -1 + ( 2 * i ) / l );
		var theta = Math.sqrt( l * Math.PI ) * phi;
		var object = new THREE.Object3D();
		spherical.set( 800, phi, theta );
		object.position.setFromSpherical( spherical );
		vector.copy( object.position ).multiplyScalar( 2 );
		object.lookAt( vector );
		targets.sphere.push( object );
	}

	// helix

	var vector = new THREE.Vector3();
	var cylindrical = new THREE.Cylindrical();

	for ( var i = 0, l = objects.length; i < l; i ++ ) {
		var theta = i * 0.175 + Math.PI;
		var y = - ( i * 8 ) + 450;
		var object = new THREE.Object3D();
		cylindrical.set( 900, theta, y );
		object.position.setFromCylindrical( cylindrical );
		vector.x = object.position.x * 2;
		vector.y = object.position.y;
		vector.z = object.position.z * 2;
		object.lookAt( vector );
		targets.helix.push( object );
	}

	// grid

	for ( var i = 0; i < objects.length; i ++ ) {
		var object = new THREE.Object3D();
		object.position.x = ( ( i % 5 ) * 400 ) - 800;
		object.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
		object.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;
		targets.grid.push( object );
	}
	//
	if (stereoEnabled) {
		renderer = new THREE.CSS3DStereoRenderer();
	} else {
		renderer = new THREE.CSS3DRenderer();
	}
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.style.position = 'absolute';
	document.getElementById( 'container' ).appendChild( renderer.domElement );
	/*
	controls = new THREE.DeviceOrientationControls( camera );
	transform( targets.table, 5000 );
	*/
	if (stereoEnabled) {
		controls = new THREE.TrackballAndOrientationControls( camera, renderer.domElement );
	} else {
		controls = new THREE.TrackballControls( camera, renderer.domElement );
	}
	controls.rotateSpeed = 0.5;
	controls.minDistance = 500;
	controls.maxDistance = 6000;
	controls.addEventListener( 'change', render );

	var button = document.getElementById( 'table' );
	button.addEventListener( 'click', function ( event ) {
		transform( targets.table, 2000 );
	}, false );
	var button = document.getElementById( 'sphere' );
	button.addEventListener( 'click', function ( event ) {
		transform( targets.sphere, 2000 );
	}, false );
	var button = document.getElementById( 'helix' );
	button.addEventListener( 'click', function ( event ) {
		transform( targets.helix, 2000 );
	}, false );
	var button = document.getElementById( 'grid' );
	button.addEventListener( 'click', function ( event ) {
		transform( targets.grid, 2000 );
	}, false );
	transform( targets.table, 2000 );
	//
	window.addEventListener( 'resize', onWindowResize, false );
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
	$("#graph").on("click", function(e) {
		$("#3d-graph").remove();
		$("body").prepend('<div id="3d-graph"></div>');
		initGraph();
	});
	$(".hideGraph").on("click", function(e) {
		$("#3d-graph").remove();
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

function transform( targets, duration ) {
	TWEEN.removeAll();
	for ( var i = 0; i < objects.length; i ++ ) {
		var object = objects[ i ];
		var target = targets[ i ];
		new TWEEN.Tween( object.position )
			.to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();
		new TWEEN.Tween( object.rotation )
			.to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();
	}
	new TWEEN.Tween( this )
		.to( {}, duration * 2 )
		.onUpdate( render )
		.start();
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

function loadNews() {
	var rows = 9;
	var rex = /<img[^>]+src="?([^"\s]+)"?\s*\/>/g;
	globals.contSource = 0;
	globals.col = 1;
	globals.row = 1;
	globals.data = globals.data ? globals.data : [];
	globals.ids = globals.ids ? globals.ids : {};
	sources.forEach(function(source) {
		YUI().use('yql', function(Y){
		    var query = 'select * from rss where url = "' + source.url + '"';
		    var q = Y.YQL(query, function(r) {
		        if (r.query.results) {
			        var feeds = r.query.results.item;
			        feeds.forEach(function(feed) {
			        	var time = Date.parse(feed.pubDate);
			        	var date = moment.unix(time/1000).format('ll');
			        	var img = 'img/default.png';
			        	if (feed.thumbnail && feed.thumbnail.length > 0) {
									if (feed.thumbnail.shift) {
										img = feed.thumbnail.shift().url;
									}
			        	} else {
			        		var imgs = rex.exec(feed.encoded || feed.description);
			        		if (imgs && imgs.length) {
			        			img = imgs[1];
			        		}
			        	}
			        	globals.data.push(Object.assign({}, feed, {
			        		url: feed.link,
			        		img: img,
			        		title: feed.title,
			        		time: time,
			        		date: date,
			        		col: globals.col,
			        		row: globals.row
			        	}));
			        	globals.row++;
						if (globals.row > rows) {
							globals.row = 1;
							globals.col += 1;
						}
			        });
		        }
	        	globals.contSource++;
		        if (globals.contSource == sources.length) {
		        	newsLoaded();
		        }
		    })
		});
	});
}

function filterData(data) {
	db = TAFFY(data);
	var elements = db().order("time desc").limit(108).get();
	orderElements(elements);
	return elements;
}

function orderElements(elements) {
	var col = 1;
	var row = 1;
	var rows = 9;
	for (var i in elements) {
		elements[i].col = col;
		elements[i].row = row;
	    row++;
		if (row > rows) {
			row = 1;
			col += 1;
		}
	}
}

function newsLoaded() {
	console.log("Done");
	$(".loader").hide();
	console.log(globals.data);
	var filteredData = filterData(globals.data);
	loadData(filteredData);
}

function onNodeClick(node) {
	console.log("SINGLE CLICK");
	console.log(node);
	if (node.type == "line") {
		if (node.__line.material.opacity == 1) {
			node.__line.material.opacity = 0.2;
		} else {
			node.__line.material.opacity = 1;
		}
	} else {
		if (node.__sphere.material.opacity == 1) {
			node.__sphere.material.opacity = 0.75;
		} else {
			node.__sphere.material.opacity = 1;
		}
	}
}

function onNodeDblClick(node) {
	console.log("DOUBLE CLICK");
	console.log(node);
	if (node.type == "node") {
		openInNewTab(node.id);
	}
}

function openInNewTab(url) {
  var win = window.open(url, '_blank');
  win.focus();
}

function getData() {
	var data = globals.dataLoaded;
	var wordsArray = {};
	var output = {nodes:[], links:[]};
	var k = 1;
	for (var i = 0; i < data.length; i++) {
		var record = data[i];
		var url = record.url;
		var img = record.img;
		var name = record.title;
		var keywords = name.removeStopWords().split(" ");
		if (k%8 == 0) {
			k = 1;
		}
		output.nodes.push({
			id: url,
			name: name,
			group: k
		});
		for (var j in keywords) {
			var word = keywords[j];
			if (isNaN(word)) {
				if (wordsArray[word] === undefined) {
					wordsArray[word] = [];
				}
				wordsArray[word].push(url);
			}
		}
		k++;
	}
	for (var word in wordsArray) {
		for (var i = 0; i < wordsArray[word].length; i++) {
			for (var j = i + 1; j < wordsArray[word].length; j++) {
				if (i != j) {
					output.links.push({
						source: wordsArray[word][i],
						target: wordsArray[word][j],
						name: word,
						value: 1
					})
				}
			}
		}
	}
	Graph.graphData(output);
	console.log(output);
}

function initGraph() {
	Graph = ForceGraph3D()(document.getElementById("3d-graph"));
	loadGraph();
	getData();
	//getData(window.location.hash?window.location.hash.replace("#",""):"android");
}

function loadGraph() {
	Graph.resetProps();
	Graph
		.warmupTicks(0)
	    .cooldownTime(1500)
	   	.cooldownTicks(200)
	    .nodeRelSize(5)
	    .numDimensions(3)
	    .nodeResolution(8)
	    .lineOpacity(0.2)
		.autoColorBy('group')
		.idField('id')
	    .nameField('name')
	    .linkSourceField('source')
	    .linkTargetField('target')
	    .linkNameField('name')
	    .onNodeClick(onNodeClick)
	    .onNodeDblClick(onNodeDblClick)
	    .forceEngine('ngraph')
	/*
	    //.valField('group')
	    //.colorField('color')
	    //.linkColorField('color')
	    //.jsonUrl(url);
	*/
}

run();
