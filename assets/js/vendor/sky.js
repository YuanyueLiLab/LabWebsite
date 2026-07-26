/*
 * skyJS by danielmayerdesign
 * Source: https://github.com/danielmayerdesign/skyJS
 * License: MIT, see assets/js/vendor/skyjs-LICENSE.
 *
 * Local site changes: galaxy asset path, scoped layer lookup, pointer-targeted
 * forward-flight animation, decorative image alt text, and removal of per-star
 * console logging.
 */
var Sky = function Sky(layers, density) {
	layers = typeof layers !== 'undefined' ? layers : 3;
	density = typeof density !== 'undefined' ? density : 5;
	density = density > 10 ? 10 : density;
	density = density <= 0 ? 1 : density;
	var that = this;

	var centerX = window.innerWidth / 2;
	var centerY = window.innerHeight / 2;
	var style = document.createElement("STYLE");
	var layerNodes;
	var galaxyBasePath = "/images/skyjs/";
	var pointerFrame;
	var pointerMoveHandler;
	var pointerResizeHandler;
	var pointerTracking = false;
	var pointerCurrentX = centerX;
	var pointerCurrentY = centerY;
	var pointerTargetX = centerX;
	var pointerTargetY = centerY;
	var pointerSmoothing = 0.012;
	var galaxyFrequency = 25;

	var sky = document.createElement("DIV");
	sky.id = "sky";
	sky.dataset.allowbreathe = true;
	sky.dataset.allowflight = true;
	sky.style.height = window.innerHeight + "px";
	sky.style.setProperty("perspective-origin", centerX + "px " + centerY + "px", "important");
	style.innerHTML = "#sky { overflow:hidden; position: relative; perspective: 100px !important; perspective-origin: 500px 500px; background: #111; background: radial-gradient(#030303, #0e1015); } #sky .layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: translateZ(0px); transform-origin: center center; } #sky .star { position: absolute; width: 3px; height: 3px; background: #fff; border-radius: 50%; box-shadow: 0 0 7px rgba(255,255,255,0.65); animation: sky-star-twinkle var(--sky-twinkle-duration) ease-in-out var(--sky-twinkle-delay) infinite; } @keyframes sky-star-twinkle { 0%, 35%, 100% { opacity: 1; } 55%, 65% { opacity: 0; } } @keyframes sky-forward-flight { 0% { opacity: 0; transform: translate3d(var(--sky-drift-start-x, 0px), var(--sky-drift-start-y, 0px), var(--sky-start-depth)); } 12% { opacity: var(--sky-layer-opacity); } 82% { opacity: var(--sky-layer-opacity); } 100% { opacity: 0; transform: translate3d(var(--sky-drift-end-x, 0px), var(--sky-drift-end-y, 0px), var(--sky-end-depth)); } } </style>";

	document.body.appendChild(sky);
	document.head.appendChild(style);

	var initialSkySize = getSkySize();
	var starsScale = getStarsScale( initialSkySize.width, initialSkySize.height );

	for (var i = 0; i < layers; i++ ) {
		var newLayer = document.createElement("DIV");
		var starsCount = Math.round( density * (200*(0.5/(i+1))) * starsScale );
		var fracComplete = (i+1) / layers;
		var op = fracComplete + 0.1;

		newLayer.className = "layer layer" + i;
		newLayer.style.zIndex = i;
		newLayer.style.opacity = op;
		newLayer.style.setProperty("--sky-layer-opacity", op);
		newLayer.dataset.stars = starsCount;
		newLayer.dataset.zoom = 1 + 2 * Math.pow(1.5, i);
		sky.appendChild(newLayer);
	}

	layerNodes = sky.getElementsByClassName("layer");

	function clamp( value, min, max ) {
		return Math.max( min, Math.min( value, max ) );
	}

	function getStarsScale( width, height ) {
		var referenceArea = 1440 * 900;
		var pageArea = Math.max( width, 1 ) * Math.max( height, 1 );

		return clamp( pageArea / referenceArea, 0.25, 2.5 );
	}

	function getSkySize() {
		var rect = sky.getBoundingClientRect();

		return {
			rect: rect,
			width: rect.width || window.innerWidth,
			height: rect.height || window.innerHeight
		};
	}

	function setTravelOrigin( x, y ) {
		var size = getSkySize();
		var originX = clamp( x, 0, size.width );
		var originY = clamp( y, 0, size.height );
		var origin = originX + "px " + originY + "px";
		var offsetX = size.width ? ((originX / size.width) - 0.5) * 2 : 0;
		var offsetY = size.height ? ((originY / size.height) - 0.5) * 2 : 0;
		var driftX = offsetX * Math.min(220, size.width * 0.22);
		var driftY = offsetY * Math.min(150, size.height * 0.2);

		sky.style.setProperty("perspective-origin", origin, "important");

		for ( var i = 0; i < layerNodes.length; i++ ) {
			var layer = layerNodes[i];
			var layerDepth = 0.65 + (i * 0.2);

			layer.style.transformOrigin = origin;
			layer.style.setProperty("--sky-drift-start-x", (-driftX * 0.34 * layerDepth) + "px");
			layer.style.setProperty("--sky-drift-start-y", (-driftY * 0.34 * layerDepth) + "px");
			layer.style.setProperty("--sky-drift-end-x", (driftX * layerDepth) + "px");
			layer.style.setProperty("--sky-drift-end-y", (driftY * layerDepth) + "px");
		}
	}

	function setTravelTargetFromPoint( clientX, clientY ) {
		var size = getSkySize();

		pointerTargetX = clamp( clientX - size.rect.left, 0, size.width );
		pointerTargetY = clamp( clientY - size.rect.top, 0, size.height );
	}

	function resetTravelTargetToCenter() {
		var size = getSkySize();

		pointerTargetX = size.width / 2;
		pointerTargetY = size.height / 2;
		pointerCurrentX = pointerTargetX;
		pointerCurrentY = pointerTargetY;
		setTravelOrigin( pointerCurrentX, pointerCurrentY );
	}

	function animateTravelOrigin() {
		pointerCurrentX += (pointerTargetX - pointerCurrentX) * pointerSmoothing;
		pointerCurrentY += (pointerTargetY - pointerCurrentY) * pointerSmoothing;
		setTravelOrigin( pointerCurrentX, pointerCurrentY );
		pointerFrame = window.requestAnimationFrame( animateTravelOrigin );
	}

	function initStars( layer ) {
		var starsCount = layer.dataset.stars;
		var winWidth = window.innerWidth;
		var winHeight = window.innerHeight;

		for ( var i = 0; i < starsCount; i++ ) {
			var star = document.createElement("DIV");
			var xVal = Math.random() * winWidth;
			var yVal = Math.random() * winHeight;
			var starSize = 1 + (Math.random() * 5);
			var blue = "rgb(255," + (255 - Math.ceil(10 * Math.random())) + "," + (255 - Math.ceil(20 * Math.random())) + ")";
			var red = "rgb(" + (255 - Math.ceil(20 * Math.random())) + ",255,255)";

			star.className = "star";
			star.style.left = xVal + "px";
			star.style.top = yVal + "px";
			star.style.width = starSize + "px";
			star.style.height = starSize + "px";
			star.style.setProperty("--sky-twinkle-duration", (3 + (Math.random() * 5)) + "s");
			star.style.setProperty("--sky-twinkle-delay", (-8 * Math.random()) + "s");
			
			if ( i%2 == 0 ) {
				star.style.backgroundColor = blue;
			} else {
				star.style.backgroundColor = red;
			}

			if ( i%galaxyFrequency == 0 ) {
				var whichGal = Math.ceil(6 * Math.random());
				var rotate = Math.floor(180 * Math.random());
				var galaxyImg = document.createElement("IMG");

				galaxyImg.src = galaxyBasePath + "galaxy" + whichGal + ".png";
				galaxyImg.alt = "";
				galaxyImg.width = 20;
				galaxyImg.height = 20;
				galaxyImg.decoding = "async";

				star.style.width = "20px";
				star.style.height = "20px";
				star.style.backgroundColor = "transparent";
				star.style.boxShadow = "none";
				star.style.borderRadius = "0";
				star.appendChild( galaxyImg );
				star.style.WebkitTransform = "rotate(" + rotate + "deg)";
				star.style.MozTransform = "rotate(" + rotate + "deg)";
				star.style.MsTransform = "rotate(" + rotate + "deg)";
				star.style.OTransform = "rotate(" + rotate + "deg)";
				star.style.transform = "rotate(" + rotate + "deg)";
			}

			layer.appendChild( star );
		}
	};

	this.breathe = function breathe( speed ) {
		window.onload = (function() {
			speed = typeof speed === 'undefined' ? 10000 : speed * 1000;

			for ( var i = 0; i < layerNodes.length; i++ ) {
				var layer = layerNodes[i];
				var zoom = layer.dataset.zoom;

				layer.style.WebkitTransition = "-webkit-transform "+speed+"ms ease-in-out";
				layer.style.MozTransition = "-moz-transform "+speed+"ms ease-in-out";
				layer.style.MsTransition = "-ms-transform "+speed+"ms ease-in-out";
				layer.style.OTransition = "-o-transform "+speed+"ms ease-in-out";
				layer.style.transition = "transform "+speed+"ms ease-in-out";

				layer.style.WebkitTransform = "translateZ(0.1px)";
				layer.style.MozTransform = "translateZ(0.1px)";
				layer.style.MsTransform = "translateZ(0.1px)";
				layer.style.OTransform = "translateZ(0.1px)";
				layer.style.transform = "translateZ(0.1px)"; // Rendering bug fix -- apparently an initial nonzero value is needed to jumpstart the rendering engine

				breatheIn( layer );
			}

			function breatheIn( layer ) {
				if ( sky.dataset.allowbreathe === 'false' ) { return; }
				
				layer.style.transform = "translateZ(" + layer.dataset.zoom + "px)";
				setTimeout(function() {
					breatheOut( layer );
				}, speed);
			}
			function breatheOut( layer ) {
				if ( sky.dataset.allowbreathe === 'false' ) { return; }
				
				layer.style.transform = "translateZ(0px)";
				setTimeout(function() {
					breatheIn( layer );
				}, speed);
			}
		});
	};

	this.breathe.stop = function () {
		sky.dataset.allowbreathe = false;
	};

	this.flyForward = function flyForward( speed, depth ) {
		speed = typeof speed === 'undefined' ? 14000 : speed * 1000;
		depth = typeof depth === 'undefined' ? 86 : depth;
		depth = depth > 94 ? 94 : depth;
		depth = depth < 36 ? 36 : depth;
		sky.dataset.allowbreathe = false;
		sky.dataset.allowflight = true;

		for ( var i = 0; i < layerNodes.length; i++ ) {
			var layer = layerNodes[i];
			var delay = speed * (i / layerNodes.length);
			var startDepth = -1 * (depth + 34 + (i * 18));
			var endDepth = depth - (i * 5);

			layer.style.WebkitTransition = "";
			layer.style.MozTransition = "";
			layer.style.MsTransition = "";
			layer.style.OTransition = "";
			layer.style.transition = "";
			layer.style.setProperty("--sky-start-depth", startDepth + "px");
			layer.style.setProperty("--sky-end-depth", endDepth + "px");
			layer.style.WebkitAnimation = "sky-forward-flight " + speed + "ms linear -" + delay + "ms infinite";
			layer.style.animation = "sky-forward-flight " + speed + "ms linear -" + delay + "ms infinite";
			layer.style.willChange = "transform, opacity";
		}
	};

	this.flyForward.stop = function () {
		sky.dataset.allowflight = false;

		for ( var i = 0; i < layerNodes.length; i++ ) {
			var layer = layerNodes[i];

			layer.style.WebkitAnimation = "";
			layer.style.animation = "";
			layer.style.willChange = "";
			layer.style.opacity = layer.style.getPropertyValue("--sky-layer-opacity");
			layer.style.transform = "translateZ(0px)";
		}
	};

	this.followPointer = function followPointer( smoothing ) {
		pointerSmoothing = typeof smoothing === 'undefined' ? pointerSmoothing : smoothing;
		pointerSmoothing = pointerSmoothing > 0.25 ? 0.25 : pointerSmoothing;
		pointerSmoothing = pointerSmoothing < 0.003 ? 0.003 : pointerSmoothing;

		if ( pointerTracking ) {
			return;
		}

		pointerTracking = true;
		resetTravelTargetToCenter();

		pointerMoveHandler = function ( event ) {
			setTravelTargetFromPoint( event.clientX, event.clientY );
		};
		pointerResizeHandler = function () {
			resetTravelTargetToCenter();
		};

		window.addEventListener( "pointermove", pointerMoveHandler, { passive: true } );
		window.addEventListener( "resize", pointerResizeHandler );
		animateTravelOrigin();
	};

	this.followPointer.stop = function () {
		pointerTracking = false;

		if ( pointerMoveHandler ) {
			window.removeEventListener( "pointermove", pointerMoveHandler );
		}

		if ( pointerResizeHandler ) {
			window.removeEventListener( "resize", pointerResizeHandler );
		}

		if ( pointerFrame ) {
			window.cancelAnimationFrame( pointerFrame );
		}

		pointerMoveHandler = null;
		pointerResizeHandler = null;
		pointerFrame = null;
		resetTravelTargetToCenter();
	};

	this.zoomIn = function zoomIn( speed, zoom ) {
		window.onload = (function() {
			speed = typeof speed === 'undefined' ? 2500 : speed * 1000;

			for ( var i = 0; i < layerNodes.length; i++ ) {
				var layer = layerNodes[i];
				zoom = typeof zoom === 'undefined' ? layer.dataset.zoom * 2 : layer.dataset.zoom * (zoom/3);

				layer.style.WebkitTransition = "-webkit-transform "+speed+"ms ease-in-out";
				layer.style.MozTransition = "-moz-transform "+speed+"ms ease-in-out";
				layer.style.MsTransition = "-ms-transform "+speed+"ms ease-in-out";
				layer.style.OTransition = "-o-transform "+speed+"ms ease-in-out";
				layer.style.transition = "transform "+speed+"ms ease-in-out";

				layer.style.WebkitTransform = "translateZ(0.1px)";
				layer.style.MozTransform = "translateZ(0.1px)";
				layer.style.MsTransform = "translateZ(0.1px)";
				layer.style.OTransform = "translateZ(0.1px)";
				layer.style.transform = "translateZ(0.1px)"; // Rendering bug fix -- apparently an initial nonzero value is needed to jumpstart the rendering engine

				layer.style.transform = "translateZ(" + zoom + "px)";
			}
		});
	};

	for ( var i = 0; i < layerNodes.length; i++ ) {
		initStars( layerNodes[i] );
	}
};
