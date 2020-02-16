'use strict'

var acove = {};

acove.defaults = {};

var Main = function () {

	var HEIGHT = 500,
		WIDTH = 1000;

	var svgMargin = {
		top: 10,
		right: 10,
		bottom: 10,
		left: 10,
	}

	var FRIENDLY = "friendly",
		HOSTILE = "hostile",
		NEUTRAL = "neutral",
		OBJECTIVE = "objective";

	var selectedIcon = null;

	var map = null;

	var toolbar = null;

	var timer = null;

	var step = 0;

	var stepMax = 100.0;

	var plotColor = d3.rgb(0, 0, 0);

	function stopTimer() {
		console.log("start timer");
		clearInterval(timer);
		step = 0;
	}

	this.initialize = function () {

		console.log("initialize: ", acove.defaults.demo);
		// var mainSvg = d3.select("#test-svg")

		// mainSvg.attr("height", HEIGHT)
		// 	.attr("width", WIDTH)

		// mainSvg.append("rect")
		// 	.attr("x", svgMargin.left)
		// 	.attr("y", svgMargin.top)
		// 	.attr("height", HEIGHT - svgMargin.top - svgMargin.bottom)
		// 	.attr("width", WIDTH - svgMargin.left - svgMargin.right)
		// 	.style("fill", plotColor)

		$("#start").on("click", function() {
			console.log("start timer");
			timer = setInterval(function () {
				step++;

				if (step > stepMax) {
					stopTimer();
				}
				console.log("timer step: ", step)
				var threats = acove.model.threats;
				addActiveLayer(threats);
			}, 500);
		})

		$("#stop").on("click", function() {
			stopTimer();
		});



		acove.events.register(acove.events.DATA_LOAD_COMPLETED, loadCompleted);
		acove.events.register(acove.events.THREAT_UPDATED, update);

		require([
			"esri/map",
			"esri/basemaps",
			// "esri/toolbars/draw",
			"dojo/domReady!"
		], function (Map, esriBasemaps, Draw) {

			esriBasemaps.acove = {
				baseMapLayers: [{
					url: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
				}],
				title: "acove"
			}

			map = new Map("map", {
				basemap: "acove",
				center: [-79.999174, 40.516341],
				slider: false,
				zoom: 16
			});

			// toolbar = new Draw(map, {
			// 	tooltipOffset: 20,
			// 	drawTime: 90
			// });

			addToolbar();

		});

	}

	function addToolbar() {
		console.log("Add toolbar")
		require([
			"esri/toolbars/draw",
			'esri/graphic',
			'esri/symbols/SimpleLineSymbol',
			"esri/Color"
		], function (Draw, Graphic, SimpleLineSymbol, Color) {

			toolbar = new Draw(map, {
				tooltipOffset: 20,
				drawTime: 90
			});

			toolbar.on("draw-complete", addToMap);

			$("#polyline").on("click", function () {
				toolbar.activate(Draw['POLYLINE']);
				$("controls").fadeOut("slow");
			})

			$("#freehand").on("click", function () {
				toolbar.activate(Draw['FREEHAND_POLYLINE'], {tolerance: 1});
				$("controls").fadeOut("slow");
			})

			$("#polygon").on("click", function () {
				toolbar.activate(Draw['FREEHAND_POLYGON']);
				$("controls").fadeOut("slow");
			})

			$("#circle").on("click", function () {
				toolbar.activate(Draw['CIRCLE'], {tolerance: 1});
				$("controls").fadeOut("slow");
			})

			var symbol = new SimpleLineSymbol(
				SimpleLineSymbol.STYLE_SOLID,
				new Color([255, 0, 0]),
				1
			);

			function addToMap(evt) {

				console.log("event: ", evt)
				
				if (selectedIcon) {
					$("#controls").fadeOut("slow");
					var simplePath = evt.geographicGeometry.paths[0];
					var graphic = new Graphic(evt.geometry, symbol);
					
					toolbar.deactivate();
					
					// map.graphics.add(graphic);

					acove.model.addAttackPath(selectedIcon.id, simplePath);

					selectedIcon = null;

				}
			}
		});

	}


	var update = function () {
		console.log("update map")

		var friendlies = acove.model.friendlyUnits;
		var hostiles = acove.model.hostileUnits;
		var threats = acove.model.threats;

		addUnits(friendlies, FRIENDLY);
		addUnits(hostiles, HOSTILE);
		addActiveLayer(threats);
	}


	function addUnits(units, unitSide) {

		console.log("add ", unitSide, units);

		if (map) {

			// removeLayer(unitSide);
		}

		require([
			'esri/graphic',
			'esri/layers/GraphicsLayer',
			'esri/geometry/Point',
			'esri/symbols/SimpleMarkerSymbol',
			'esri/symbols/SimpleLineSymbol',
			'esri/symbols/PictureMarkerSymbol',
			"esri/symbols/TextSymbol",
			"esri/Color"
		], function (Graphic, GraphicsLayer, Point, SimpleMarkerSymbol, SimpleLineSymbol, PictureMarkerSymbol, TextSymbol, Color) {

			var graphicsLayer = new GraphicsLayer({
				id: unitSide
			})

			units.forEach(function (unit) {

				var color = (unitSide === HOSTILE) ? "gray" : "color";

				var image = "images/map-icons/" + unitSide + "-" +
					unit.type.value + "-" +
					unit.mobility.value + "-" +
					unit.size.value + "-" +
					color + ".svg";

				var symbol = new PictureMarkerSymbol(image, 40, 40);
				var point = new Point(unit.lng, unit.lat);

				console.log("image, ", image);

				// Create a graphic and add the geometry and symbol to it
				var pointGraphic = new Graphic(point,
					symbol, {
						id: unit.id,
						name: unit.name,
						unitType: (unit.type) ? unit.type.name : "objective",
						mobility: (unit.mobility) ? unit.mobility.name : "objective",
						size: (unit.size) ? unit.size.name : "objective",
						unitSide: unitSide,
						lat: unit.lat,
						lng: unit.lng,
						isText: false
					},
					null
				);

				graphicsLayer.add(pointGraphic);

				var textSymbol = new TextSymbol(unit.name);
				textSymbol.setAlign(TextSymbol.ALIGN_START);
				textSymbol.setOffset(10, -10);

				var textPointGraphic = new Graphic(point, textSymbol, {
					id: unit.id,
					name: unit.name,
					unitType: (unit.type) ? unit.type.name : "objective",
					mobility: (unit.mobility) ? unit.mobility.name : "objective",
					size: (unit.size) ? unit.size.name : "objective",
					unitSide: unitSide,
					lat: unit.lat,
					lng: unit.lng,
					isText: true
				}, null);

				graphicsLayer.add(textPointGraphic);

			});

			if (units.length > 0) {
				map.addLayer(graphicsLayer);

				graphicsLayer.on('graphic-node-add', function (e) {

					var x = e.graphic._shape.shape.x
					var y = e.graphic._shape.shape.y

					d3.select(e.node)
						.on('contextmenu', function () {

							if (e.graphic.attributes.unitSide === HOSTILE) {

								// console.log("context click", d3.event);
								d3.event.preventDefault();
								if (!e.graphic.attributes.isText) {
									// showUnitContextMenu(e.graphic.attributes, e.node);
									
									selectedIcon = e.graphic.attributes;
									
									$("#controls").fadeIn('slow').position({
										my : 'right top-20',
										at : 'left-10 center-15',
										of : $(e.node)
									})
								}
							}
						})

				});
			}


		});
	}

	function addActiveLayer(threats) {

		console.log("Add active layer: ", map)

		if (map) {

			removeLayer("ACTIVE_UNITS_LAYER");
		}

		require([
			'esri/graphic',
			'esri/layers/GraphicsLayer',
			'esri/geometry/Polyline',
			'esri/geometry/Polygon',
			'esri/symbols/SimpleLineSymbol',
			'esri/geometry/Circle',
			'esri/symbols/SimpleFillSymbol',
			'esri/units',
			'esri/geometry/Point',
			'esri/symbols/PictureMarkerSymbol',
			'esri/symbols/SimpleMarkerSymbol',
			"esri/SpatialReference",
			"esri/geometry/webMercatorUtils",
			"esri/geometry/geodesicUtils",
			'esri/geometry/geometryEngine',
			"esri/Color"
		], function (Graphic, GraphicsLayer, Polyline, Polygon, SimpleLineSymbol,
			Circle, SimpleFillSymbol, Units, Point, PictureMarkerSymbol,
			SimpleMarkerSymbol, SpatialReference, webMercatorUtils, geodesicUtils, geometryEngine, Color) {

			var graphicsLayer = new GraphicsLayer({
				id: "ACTIVE_UNITS_LAYER"
			});

			threats.forEach(function (threat) {

				var activeLineSymbol = new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_DASH,
					new Color([0, 0, 0]),
					1
				);

				var attackPoly = new Polyline({
					paths: threat.attackPath,
					spatialReference: {
						wkid: 4326
					}
				});

				var attackLines = []

				threat.attackPath.forEach(function (path) {
					var poly = new Polyline({
						paths: [path],
						spatialReference: {
							wkid: 4326
						}
					});

					var graphic = new Graphic(poly, activeLineSymbol);

					graphicsLayer.add(graphic);

					attackLines.push(poly);

				})

				var attackLength = geodesicUtils.geodesicLengths([attackPoly], acove.model.EsriUnits.MILES)
				var pathLengths = geodesicUtils.geodesicLengths(attackLines, acove.model.EsriUnits.MILES)

				console.log("ATTACK PATH LENGTH: ", attackLength);
				console.log("ATTACK PATH LENGTH: ", pathLengths);

				var estimatedLocation = new Point(threat.hostileUnit.lng, threat.hostileUnit.lat);

				var percentDone = step / stepMax;
				if (percentDone > 0 && percentDone <= 1) {
					var distanceTraveled = attackLength[0] * percentDone;
					var totaledPathDistance = 0;
					var pathIndex = 0;


					while (distanceTraveled > totaledPathDistance) {
						totaledPathDistance += pathLengths[pathIndex];
						pathIndex++;
					}

					console.log("pathIndex", pathIndex);
					console.log("totalDistance", totaledPathDistance);
					console.log("distanceTraveled", distanceTraveled);

					var radius = totaledPathDistance - distanceTraveled;

					var center = threat.attackPath[0][0];
					if (pathIndex == threat.attackPath.length) {
						center = threat.attackPath[(pathIndex - 1)][1];
					} else {
						center = threat.attackPath[pathIndex][0];
					}

					// var center = threat.attackPath[pathIndex][0];


					console.log("center", center);
					console.log("radius", radius);

					var waypoint = new Point(center[0], center[1]);

					var waypointCircle = new Circle({
						center: waypoint,
						radius: radius,
						geodesic: true,
						radiusUnit: acove.model.EsriUnits.MILES
					});


					var circleFill = new SimpleFillSymbol(
						SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(
							SimpleLineSymbol.STYLE_SOLID,
							new Color([0, 0, 255]),
							1
						),
						new Color([0, 255, 255, 0])
					);

					var waypointCircleGraphic = new Graphic(waypointCircle, circleFill);
					graphicsLayer.add(waypointCircleGraphic);

					var intersection = geometryEngine.intersect(attackLines[(pathIndex - 1)], waypointCircle);

					var intersectionFill = new SimpleFillSymbol(
						SimpleFillSymbol.STYLE_SOLID,
						new SimpleLineSymbol(
							SimpleLineSymbol.STYLE_SOLID,
							new Color([255, 0, 0]),
							1
						),
						new Color([0, 255, 255, 0])
					);

					var intersectionGrapic = new Graphic(intersection, intersectionFill);
					console.log("intersection: ", intersection);
					graphicsLayer.add(intersectionGrapic);

					if (intersection) {
						estimatedLocation = new Point(intersection.paths[0][0]);
					}

				}

				// console.log("ATTACK PATH LENGTH: ", geodesicLength[0]);

				var image = "images/map-icons/hostile-" +
					threat.hostileUnit.type.value + "-" +
					threat.hostileUnit.mobility.value + "-" +
					threat.hostileUnit.size.value + "-" +
					"color.svg";

				var estimatedUnitSymbol = new PictureMarkerSymbol(image, 40, 40);

				var dashedDiamondSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_DIAMOND,
					42,
					activeLineSymbol,
					new Color([0, 0, 0, 0.0])
				);

				var movedUnitGraphicDiamond = new Graphic(estimatedLocation, dashedDiamondSymbol);

				var movedUnitGraphic = new Graphic(estimatedLocation, estimatedUnitSymbol);

				graphicsLayer.add(movedUnitGraphicDiamond);
				graphicsLayer.add(movedUnitGraphic);

				// var arrowGraphic = new Graphic(attackPoly, activeLineSymbol);

				// graphicsLayer.add(arrowGraphic);

			});

			map.addLayer(graphicsLayer);
		});
	}


	function removeLayer(layerId) {
		// may change based on unit ids?
		var layer = null;
		if (!!map) {
			layer = map.getLayer(layerId);
		}

		// console.log("layer? ", layer)

		if (!!layer) {
			map.removeLayer(layer);
		}
	}


	function loadCompleted() {
		var self = this;

		update();
	}

}