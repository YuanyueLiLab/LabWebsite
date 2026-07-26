/*
 * skyJS by danielmayerdesign
 * Source: https://github.com/danielmayerdesign/skyJS
 * License: MIT, see assets/js/vendor/skyjs-LICENSE.
 *
 * Local site changes: galaxy asset path, scoped layer lookup, pointer-targeted
 * forward-flight animation, lifecycle cleanup, decorative image alt text, and
 * removal of per-star console logging.
 */
var Sky = function Sky(layers, density) {
	layers = typeof layers !== 'undefined' ? layers : 3;
	density = typeof density !== 'undefined' ? density : 5;
	density = density > 10 ? 10 : density;
	density = density <= 0 ? 1 : density;
	var centerX = window.innerWidth / 2;
	var centerY = window.innerHeight / 2;
	var style = document.createElement("STYLE");
	var layerNodes = [];
	var galaxyBasePath = "/images/skyjs/";
	var breatheGeneration = 0;
	var breatheTimers = [];
	var destroyed = false;
	var paused = false;
	var skySize = null;
	var pointerFrame = null;
	var pointerMoveHandler;
	var pointerResizeHandler;
	var pointerTracking = false;
	var pointerCurrentX = centerX;
	var pointerCurrentY = centerY;
	var pointerTargetX = centerX;
	var pointerTargetY = centerY;
	var pointerSmoothing = 0.012;
	var pointerEpsilon = 0.35;
	var galaxyFrequency = 36;

	var sky = document.createElement("DIV");
	sky.id = "sky";
	sky.__skyController = this;
	sky.dataset.allowbreathe = true;
	sky.dataset.allowflight = true;
	sky.style.height = window.innerHeight + "px";
	sky.style.setProperty("perspective-origin", centerX + "px " + centerY + "px", "important");
	style.innerHTML = "#sky { overflow:hidden; position: relative; perspective: 100px !important; perspective-origin: 500px 500px; background: #111; background: radial-gradient(#030303, #0e1015); } #sky .layer { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: translateZ(0px); transform-origin: center center; } #sky.is-paused .layer { animation-play-state: paused !important; } #sky .star { position: absolute; width: 3px; height: 3px; background: #fff; border-radius: 50%; box-shadow: 0 0 7px rgba(255,255,255,0.65); } @keyframes sky-forward-flight { 0% { opacity: 0; transform: translate3d(var(--sky-drift-start-x, 0px), var(--sky-drift-start-y, 0px), var(--sky-start-depth)); } 12% { opacity: var(--sky-layer-opacity); } 82% { opacity: var(--sky-layer-opacity); } 100% { opacity: 0; transform: translate3d(var(--sky-drift-end-x, 0px), var(--sky-drift-end-y, 0px), var(--sky-end-depth)); } }";
	document.body.appendChild(sky);
	document.head.appendChild(style);

	var initialSkySize = measureSkySize();
	var starsScale = getStarsScale( initialSkySize.width, initialSkySize.height );
	var layerFragment = document.createDocumentFragment();

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
		layerNodes.push(newLayer);
		layerFragment.appendChild(newLayer);
	}

	sky.appendChild(layerFragment);

	function clamp( value, min, max ) {
		return Math.max( min, Math.min( value, max ) );
	}

	function getStarsScale( width, height ) {
		var referenceArea = 1440 * 900;
		var pageArea = Math.max( width, 1 ) * Math.max( height, 1 );

		return clamp( pageArea / referenceArea, 0.25, 1.5 );
	}

	function measureSkySize() {
		var rect = sky.getBoundingClientRect();

		skySize = {
			rect: rect,
			width: rect.width || window.innerWidth,
			height: rect.height || window.innerHeight
		};

		return skySize;
	}

	function getSkySize() {
		return skySize || measureSkySize();
	}

	function clearBreatheTimers() {
		for ( var i = 0; i < breatheTimers.length; i++ ) {
			window.clearTimeout( breatheTimers[i] );
		}

		breatheTimers = [];
	}

	function stopBreathe() {
		breatheGeneration++;
		clearBreatheTimers();

		if ( sky ) {
			sky.dataset.allowbreathe = false;
		}
	}

	function scheduleBreathe( callback, layer, speed ) {
		var generation = breatheGeneration;
		var timer = window.setTimeout(function() {
			var timerIndex = breatheTimers.indexOf( timer );

			if ( timerIndex !== -1 ) {
				breatheTimers.splice( timerIndex, 1 );
			}

			if ( destroyed || generation !== breatheGeneration || !sky || sky.dataset.allowbreathe === 'false' ) {
				return;
			}

			callback( layer );
		}, speed);

		breatheTimers.push( timer );
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
		var size = measureSkySize();

		pointerTargetX = size.width / 2;
		pointerTargetY = size.height / 2;
		pointerCurrentX = pointerTargetX;
		pointerCurrentY = pointerTargetY;
		setTravelOrigin( pointerCurrentX, pointerCurrentY );
	}

	function startPointerAnimation() {
		if ( destroyed || paused || !pointerTracking || pointerFrame !== null ) {
			return;
		}

		pointerFrame = window.requestAnimationFrame( animateTravelOrigin );
	}

	function animateTravelOrigin() {
		if ( destroyed || paused || !pointerTracking || !sky ) {
			pointerFrame = null;
			return;
		}

		var deltaX = pointerTargetX - pointerCurrentX;
		var deltaY = pointerTargetY - pointerCurrentY;

		if ( Math.abs( deltaX ) <= pointerEpsilon && Math.abs( deltaY ) <= pointerEpsilon ) {
			pointerCurrentX = pointerTargetX;
			pointerCurrentY = pointerTargetY;
			setTravelOrigin( pointerCurrentX, pointerCurrentY );
			pointerFrame = null;
			return;
		}

		pointerCurrentX += deltaX * pointerSmoothing;
		pointerCurrentY += deltaY * pointerSmoothing;
		setTravelOrigin( pointerCurrentX, pointerCurrentY );
		pointerFrame = window.requestAnimationFrame( animateTravelOrigin );
	}

	function initStars( layer ) {
		var starsCount = Number( layer.dataset.stars );
		var winWidth = window.innerWidth;
		var winHeight = window.innerHeight;
		var starsFragment = document.createDocumentFragment();

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

			starsFragment.appendChild( star );
		}

		layer.appendChild( starsFragment );
	};

	this.breathe = function breathe( speed ) {
		if ( destroyed ) {
			return;
		}

		stopBreathe();
		sky.dataset.allowbreathe = true;
		speed = typeof speed === 'undefined' ? 10000 : speed * 1000;

		for ( var i = 0; i < layerNodes.length; i++ ) {
			var layer = layerNodes[i];

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
			if ( destroyed || !sky || sky.dataset.allowbreathe === 'false' ) { return; }

			layer.style.transform = "translateZ(" + layer.dataset.zoom + "px)";
			scheduleBreathe( breatheOut, layer, speed );
		}
		function breatheOut( layer ) {
			if ( destroyed || !sky || sky.dataset.allowbreathe === 'false' ) { return; }

			layer.style.transform = "translateZ(0px)";
			scheduleBreathe( breatheIn, layer, speed );
		}
	};

	this.breathe.stop = function () {
		stopBreathe();
	};

	this.flyForward = function flyForward( speed, depth ) {
		if ( destroyed ) {
			return;
		}

		speed = typeof speed === 'undefined' ? 14000 : speed * 1000;
		depth = typeof depth === 'undefined' ? 86 : depth;
		depth = depth > 94 ? 94 : depth;
		depth = depth < 36 ? 36 : depth;
		stopBreathe();
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
		}
	};

	function stopFlight() {
		if ( !sky || !layerNodes ) {
			return;
		}

		sky.dataset.allowflight = false;

		for ( var i = 0; i < layerNodes.length; i++ ) {
			var layer = layerNodes[i];

			layer.style.WebkitAnimation = "";
			layer.style.animation = "";
			layer.style.willChange = "";
			layer.style.opacity = layer.style.getPropertyValue("--sky-layer-opacity");
			layer.style.transform = "translateZ(0px)";
		}
	}

	this.flyForward.stop = function () {
		stopFlight();
	};

	this.followPointer = function followPointer( smoothing ) {
		if ( destroyed ) {
			return;
		}

		pointerSmoothing = typeof smoothing === 'undefined' ? pointerSmoothing : smoothing;
		pointerSmoothing = pointerSmoothing > 0.25 ? 0.25 : pointerSmoothing;
		pointerSmoothing = pointerSmoothing < 0.003 ? 0.003 : pointerSmoothing;

		if ( pointerTracking ) {
			return;
		}

		pointerTracking = true;
		resetTravelTargetToCenter();

		pointerMoveHandler = function ( event ) {
			if ( !destroyed ) {
				setTravelTargetFromPoint( event.clientX, event.clientY );
				startPointerAnimation();
			}
		};
		pointerResizeHandler = function () {
			if ( !destroyed ) {
				resetTravelTargetToCenter();
			}
		};

		window.addEventListener( "pointermove", pointerMoveHandler, { passive: true } );
		window.addEventListener( "resize", pointerResizeHandler );
	};

	function stopPointer( resetOrigin ) {
		pointerTracking = false;

		if ( pointerMoveHandler ) {
			window.removeEventListener( "pointermove", pointerMoveHandler );
		}

		if ( pointerResizeHandler ) {
			window.removeEventListener( "resize", pointerResizeHandler );
		}

		if ( pointerFrame !== null ) {
			window.cancelAnimationFrame( pointerFrame );
		}

		pointerMoveHandler = null;
		pointerResizeHandler = null;
		pointerFrame = null;

		if ( resetOrigin && !destroyed && sky ) {
			resetTravelTargetToCenter();
		}
	}

	this.followPointer.stop = function () {
		stopPointer( true );
	};

	this.setPaused = function setPaused( shouldPause ) {
		if ( destroyed || !sky ) {
			return;
		}

		paused = Boolean( shouldPause );
		sky.classList.toggle( "is-paused", paused );

		if ( paused && pointerFrame !== null ) {
			window.cancelAnimationFrame( pointerFrame );
			pointerFrame = null;
		} else if ( !paused ) {
			startPointerAnimation();
		}
	};

	this.zoomIn = function zoomIn( speed, zoom ) {
		if ( destroyed ) {
			return;
		}

		speed = typeof speed === 'undefined' ? 2500 : speed * 1000;

		for ( var i = 0; i < layerNodes.length; i++ ) {
			var layer = layerNodes[i];
			var layerZoom = typeof zoom === 'undefined' ? layer.dataset.zoom * 2 : layer.dataset.zoom * (zoom/3);

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

			layer.style.transform = "translateZ(" + layerZoom + "px)";
		}
	};

	this.destroy = function destroy() {
		if ( destroyed ) {
			return;
		}

		destroyed = true;
		stopBreathe();
		stopPointer( false );
		stopFlight();

		if ( sky ) {
			sky.__skyController = null;
		}

		if ( sky && sky.parentNode ) {
			sky.parentNode.removeChild( sky );
		}

		if ( style && style.parentNode ) {
			style.parentNode.removeChild( style );
		}

		layerNodes = null;
		sky = null;
		style = null;
	};

	for ( var i = 0; i < layerNodes.length; i++ ) {
		initStars( layerNodes[i] );
	}
};
