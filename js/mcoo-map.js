'use strict'

mcoo.map = (function () {
	console.log("load mcoo.map");

	// private
	var debug = true;

	var map = null;
	var toolbar = null;

	var step = 0;
	var stepMax = 100.0;

	var drawState = null;

	// map drawState constants
	var NEW_AREA_OF_INTEREST = "newAreaOfInterest";
	var NEW_REGION = "newRegion";
	var NEW_UNIT_ROUTE = "newUnitRoute";

	// Map Layer Id Constants
	var AREA_OF_INTEREST = "areaOfInterest";
	var RESTRICTED = "restricted";
	var SEVERELY_RESTRICTED = "severelyRestricted";
	var VISIBILITY = "visibility";

	var FRIENDLY = "friendly",
		HOSTILE = "hostile",
		NEUTRAL = "neutral",
		OBJECTIVE = "objective";

	// DrawType =
	var draw = {
		POLYGON: "",
		FREEHAND: "",
	}

	/**
	 * Removes esri map layer with set id
	 *
	 * @param {String} layerId
	 */
	var removeLayer = function (layerId) {
		// may change based on unit ids?
		var layer = map.getLayer(layerId)

		if (layer) {
			map.removeLayer(layer);
		} else {
			if (debug) {
				console.log("Layer with id ", layerId, " does not exist");
			}

		}

	}

	var addPolygonToMap = function (evt) {

		require([
			'esri/graphic',
			'esri/layers/GraphicsLayer',
			'esri/symbols/SimpleLineSymbol',
			"esri/Color"
		], function (Graphic, GraphicsLayer, SimpleLineSymbol, Color) {

			var symbol = new SimpleLineSymbol(
				SimpleLineSymbol.STYLE_SOLID,
				new Color([255, 0, 0]),
				1
			);

			$("#draw-instructions").hide();

			console.log("draw state: ", drawState)
			console.log("event: ", evt)

			if (drawState) {

				var graphic = new Graphic(evt.geometry, symbol);

				var graphicsLayer = new GraphicsLayer({
					id: drawState,
				});

				graphicsLayer.add(graphic)

				map.addLayer(graphicsLayer)

				switch (drawState) {
					case NEW_AREA_OF_INTEREST:
						var footprint = evt.geographicGeometry.rings[0];

						var drawObject = {
							footprint: footprint
						}
						mcoo.events.send(mcoo.events.NEW_AREA_OF_INTEREST_PATH, drawObject);
						break;
					case NEW_REGION:
						var footprint = evt.geographicGeometry.rings[0];

						var drawObject = {
							footprint: footprint
						}
						mcoo.events.send(mcoo.events.NEW_REGION_PATH, drawObject);
						break;
					case NEW_UNIT_ROUTE:

						var footprint = evt.geographicGeometry.paths[0];

						var drawObject = {
							route: footprint
						}

						removeLayer(NEW_UNIT_ROUTE)
						mcoo.events.send(mcoo.events.NEW_UNIT_ROUTE, drawObject);
						break;
					default:
						console.log(drawState, " is not a availible draw state")
						break;
				}

				drawState = null;
			}

			toolbar.deactivate();

		})

	}

	var addToolbar = function () {
		console.log("Add toolbar")
		require([
			"esri/toolbars/draw",
			'esri/graphic',
			'esri/symbols/SimpleLineSymbol',
			"esri/Color"
		], function (Draw, Graphic, SimpleLineSymbol, Color) {

			toolbar = new Draw(map, {
				showTooltips: false,
				drawTime: 90
			});

			draw.FREEHAND = Draw['FREEHAND_POLYGON'];
			draw.POLYGON = Draw['POLYGON'];

			toolbar.on("draw-complete", addPolygonToMap);

			$("#new-area-multipoint-poly-button").on("click", function () {

				removeLayer(NEW_AREA_OF_INTEREST);
				$("#draw-instructions").show();
				drawState = NEW_AREA_OF_INTEREST;

				toolbar.activate(draw.FREEHAND, {
					tolerance: 1
				});
			})

			$("#new-area-rectangle-button").on("click", function () {

				$("#draw-instructions").show();

				removeLayer(NEW_AREA_OF_INTEREST);

				drawState = NEW_AREA_OF_INTEREST;

				toolbar.activate(Draw['RECTANGLE'], {
					tolerance: 1
				});
			})

			$("#unit-polyline").on("click", function () {

				$("#draw-instructions").show();

				removeLayer(NEW_UNIT_ROUTE);

				drawState = NEW_UNIT_ROUTE;

				toolbar.activate(Draw['FREEHAND_POLYLINE'], {
					tolerance: 1
				});
			})




			// init model here to prevent race condition
			mcoo.model.init();

		});

	}

	var addRegions = function (regions, type) {

		require([
			'esri/graphic',
			'esri/layers/GraphicsLayer',
			'esri/geometry/Polygon',
			'esri/symbols/SimpleFillSymbol',
			"esri/symbols/SimpleLineSymbol",
			'esri/Color',
			"esri/SpatialReference",
			"dojo/domReady!"
		], function (Graphic, GraphicsLayer, Polygon, SimpleFillSymbol, SimpleLineSymbol, Color, SpatialReference) {


			var graphicsLayer = new GraphicsLayer({
				id: type
			});


			regions.forEach(function (region) {

				// Create a polygon geometry
				var polygon = new Polygon();
				polygon.addRing(region.footprint);

				var color = [20, 20, 20, 0.2];

				switch (type) {
					case RESTRICTED:
						color = [20, 20, 20, 0.5];
						break;
					case SEVERELY_RESTRICTED:
						color = [20, 20, 20, 0.8];
						break;
					case VISIBILITY:
						color = [0, 180, 255, 0.5];
						break;
					default:
						console.log("THIS IS NOT A REGION TYPE: ", type)

				}

				var fillSymbol = new SimpleFillSymbol(
					SimpleFillSymbol.STYLE_SOLID,
					null,
					new Color(color)
				)

				// console.log('simple fill symbol: ', fillSymbol)
				// Add the geometry and symbol to a new graphic
				var polygonGraphic = new Graphic(polygon, fillSymbol, {
					name: region.name,
					tip: getRegionTip(region)
				}, null);


				graphicsLayer.add(polygonGraphic)
				// console.log("add polygraphic: ", polygonGraphic)

			})

			map.addLayer(graphicsLayer)


			graphicsLayer.on('graphic-node-add', function (e) {
				d3.select(e.node)
					.attr("id", "region-" + e.graphic.attributes.id)
					.classed('region', 1)
					.attr('title', e.graphic.attributes.tip)
			});

			graphicsLayer.on('update', function (e) {
				// console.log("update graphics layer: ")
				setTooltips();
			});

		});


	}

	var getRegionTip = function (region) {
		var tip = "";

		tip += "<b>" + region.name + "</b><br/>";
		tip += "Unit Type: <b>" + region.unitType + "</b><br/>"
		tip += "Category: <b>" + region.category + "</b><br/>"

		return tip;
	}

	var setTooltips = function () {
		$(".region").on(tooltip.handlers).tooltip(tooltip.BOTTOM);
	}



	// UNIT STUFF

	var addUnits = function (units, unitSide) {

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
										my: 'right top-20',
										at: 'left-10 center-15',
										of: $(e.node)
									})
								}
							}
						})

				});
			}


		});
	}

	/**
	 * Adds the paths for each combat mission
	 * @param {Array} threats
	 */
	var addActiveLayer = function (threats) {

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
			"esri/symbols/TextSymbol",
			'esri/geometry/Point',
			'esri/symbols/PictureMarkerSymbol',
			'esri/symbols/SimpleMarkerSymbol',
			"esri/SpatialReference",
			"esri/geometry/webMercatorUtils",
			"esri/geometry/geodesicUtils",
			'esri/geometry/geometryEngine',
			"esri/Color"
		], function (Graphic, GraphicsLayer, Polyline, Polygon, SimpleLineSymbol,
			Circle, SimpleFillSymbol, Units, TextSymbol, Point, PictureMarkerSymbol,
			SimpleMarkerSymbol, SpatialReference, webMercatorUtils, geodesicUtils, geometryEngine, Color) {

			var graphicsLayer = new GraphicsLayer({
				id: "ACTIVE_UNITS_LAYER"
			});

			threats.forEach(function (threat) {

				// make a single polygon of all SeverelyRestricted regions
				var severelyRestrictedPolygon = new Polygon(new SpatialReference({
					wkid: 4326
				}));

				var severelyRestrictedRegions = mcoo.selection.areaOfInterest.mcoo.severelyRestricted;

				severelyRestrictedRegions.forEach(function (region) {
					severelyRestrictedPolygon.addRing(region.footprint);
				})

				// make a single polygon of all restricted regions
				var restrictedPolygon = new Polygon(new SpatialReference({
					wkid: 4326
				}));

				var restrictedRegions = mcoo.selection.areaOfInterest.mcoo.restricted;

				restrictedRegions.forEach(function (region) {
					restrictedPolygon.addRing(region.footprint);
				})

				console.log("threats for each", threat)

				// The visual stuff to draw on the map
				var activeLineSymbol = new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_DASH,
					new Color([0, 0, 0]),
					1
				);



				var leftLineSymbol = new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID,
					new Color([0, 200, 100]),
					3
				);

				var rightLineSymbol = new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID,
					new Color([0, 100, 255]),
					3
				);

				var perpLineSymbol = new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID,
					new Color([150, 0, 0, 1]),
					1
				);

				var perpFillSymbol = new SimpleFillSymbol(
					SimpleFillSymbol.STYLE_SOLID,
					perpLineSymbol,
					new Color([255, 150, 0, 0])
				)

				var startLineSymbol = new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID,
					new Color([0, 0, 255, 1]),
					2
				);

				var bufferLineSymbol = new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID,
					new Color([255, 255, 0, 1]),
					1
				);

				var bufferFillSymbol = new SimpleFillSymbol(
					SimpleFillSymbol.STYLE_SOLID,
					bufferLineSymbol,
					new Color([255, 150, 0, .5])
				)

				var bufferIntersectFillSymbol = new SimpleFillSymbol(
					SimpleFillSymbol.STYLE_SOLID,
					null,
					new Color([0, 150, 150, .5])
				)

				var polyIntersectFillSymbol = new SimpleFillSymbol(
					SimpleFillSymbol.STYLE_SOLID,
					null,
					new Color([255, 0, 255, .1])
				)

				var leftCutFillSymbol = new SimpleFillSymbol(
					SimpleFillSymbol.STYLE_SOLID,
					null,
					new Color([0, 255, 0, .5])
				)

				var rightCutFillSymbol = new SimpleFillSymbol(
					SimpleFillSymbol.STYLE_SOLID,
					null,
					new Color([0, 0, 255, .5])
				)

				var severeDoubleIntersectFillSymbol = new SimpleFillSymbol(
					SimpleFillSymbol.STYLE_SOLID,
					perpLineSymbol,
					new Color([255, 150, 0, 1])
				)

				var severeIntersectFillSymbol = new SimpleFillSymbol(
					SimpleFillSymbol.STYLE_SOLID,
					perpLineSymbol,
					new Color([255, 0, 0, 1])
				)

				var routeObjects = [];

				// here is where we will add the new multi routes
				threat.routes.forEach(function (route, routeIndex) {

					var routeAdjustement = {
						segments: []
					}

					routeObjects.push(routeAdjustement);

					console.log("path: ", route.path)
					var polyPath = new Polyline({
						paths: route.path,
						spatialReference: {
							wkid: 4326
						}
					});

					var pathSevereInteresects = geometryEngine.intersect(polyPath, severelyRestrictedPolygon);

					console.log("path severe intersect: ", pathSevereInteresects);
					// console.log(" route.path: ", route.path);

					var i = 0;

					if (pathSevereInteresects) {

						pathSevereInteresects.paths.forEach(function (path) {
							path.forEach(function (pointArray) {

								var intersectPoint = new Point(pointArray)

								var intersectCircle = new Circle({
									center: intersectPoint,
									radius: threat.hostileUnit.size.footprint,
									geodesic: true,
									radiusUnit: mcoo.model.EsriUnits.METERS
								});

								var circleGraphic = new Graphic(intersectCircle, bufferIntersectFillSymbol);

								// graphicsLayer.add(circleGraphic);

								var textSymbol = new TextSymbol(++i);
								textSymbol.setAlign(TextSymbol.ALIGN_START);
								textSymbol.setOffset(0, 0);


								var textPointGraphic = new Graphic(intersectPoint, textSymbol, null, null);

								graphicsLayer.add(textPointGraphic);

							})

						})
					}

					var pathRestrictedInteresects = geometryEngine.intersect(polyPath, restrictedPolygon);

					console.log("path severe intersect: ", pathRestrictedInteresects);
					// console.log(" route.path: ", route.path);

					var i = 0;

					if (pathRestrictedInteresects) {

						pathRestrictedInteresects.paths.forEach(function (path) {
							path.forEach(function (pointArray) {

								var intersectPoint = new Point(pointArray)

								var intersectCircle = new Circle({
									center: intersectPoint,
									radius: (threat.hostileUnit.size.footprint / 200),
									geodesic: true,
									radiusUnit: mcoo.model.EsriUnits.METERS
								});

								var circleGraphic = new Graphic(intersectCircle, bufferIntersectFillSymbol);

								graphicsLayer.add(circleGraphic);


							})

						})
					}

					var pathGraphic = new Graphic(polyPath, activeLineSymbol);

					var buffer = polyPath;
					console.log("buffer, ", buffer)

					var leftLine = [];
					var rightLines = [];
					var allPoints = [];
					var totalBuffer = new Polygon(new SpatialReference({
						wkid: 4326
					}));

					// graphicsLayer.add(pathGraphic); // adding the dotted line to the map

					// // Walk each route segment to get its overlaps with regions
					route.segments.forEach(function (segment, index) {

						console.log("")
						console.log("")
						console.log("ADD SEGMENT: ", segment);
						// 	var severeInteresect = false;

						// 	var segmentCalulations = {
						// 		left: 0,
						// 		right: 0,
						// 		restriction: 0,
						// 		index: index
						// 	}

						// 	// section off each path into segments, and get the line
						var segmentPolyline = new Polyline({
							paths: [segment.path],
							spatialReference: {
								wkid: 4326
							}
						});


						// get the location to draw the cut lines through
						var startPoint = new Point(segment.path[0], new SpatialReference({
							wkid: 4326
						}));

						var endPoint = new Point(segment.path[1], new SpatialReference({
							wkid: 4326
						}));

						var symbol = new SimpleMarkerSymbol(
							SimpleMarkerSymbol.STYLE_CIRCLE,
							5,
							new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
								new Color([0, 0, 0, 1]), 2),
							new Color([0, 0, 0, 0.0]));

						graphicsLayer.add(new Graphic(startPoint, symbol))
						graphicsLayer.add(new Graphic(endPoint, symbol))

						// convert to webMercator to get angle to rotate
						var start = webMercatorUtils.geographicToWebMercator(startPoint);
						var end = webMercatorUtils.geographicToWebMercator(endPoint);

						// dx, dy are the change in location from start to end
						// rads is the angle between the line and vertical.  (counter clockwise)
						// ** true north is 0, west is PI/2, south is PI, east is 3 * PI / 2
						var dx = end.x - start.x,
							dy = end.y - start.y,
							rads = Math.atan2(dx, dy);

						// console.log("gimme dx, dy, rads: ", dx, dy, rads)

						// convert from radians to degrees
						if (rads < 0) {
							rads = Math.abs(rads);
						} else {
							rads = 2 * Math.PI - rads;
						}
						var degrees = rads * 180 / Math.PI;

						// console.log("start: ", start)
						// console.log("end: ", end);
						// console.log("degrees: ", rads)s
						// console.log("degrees: ", degrees)

						// Create a large new line horizontal to the end point, then rotate it the degrees calculated to set the line perpendicular to the segment.
						//  ** The 90 degree offset from the segment is factored in by drawing the line horizontal as opposed to vertical.
						//  ** If the line is drawn large in the vertical (modifying the Y direction),
						//  ** 90 would have to be added to make the angle perpendicular to the calculated angle
						var endCutline = geometryEngine.rotate(new Polyline({
							paths: [
								[
									webMercatorUtils.xyToLngLat(end.x - 15000, end.y),
									segment.path[1],
									webMercatorUtils.xyToLngLat(end.x + 15000, end.y),
								]
							],
							spatialReference: {
								wkid: 4326
							}
						}), degrees, endPoint);

						// uncomment to show end cutline
						var endCutlineGraphic = new Graphic(endCutline, perpLineSymbol);
						graphicsLayer.add(endCutlineGraphic)

						var startCutline = geometryEngine.rotate(new Polyline({
							paths: [
								[
									webMercatorUtils.xyToLngLat(start.x - 15000, start.y),
									segment.path[0],
									webMercatorUtils.xyToLngLat(start.x + 15000, start.y),
								]
							],
							spatialReference: {
								wkid: 4326
							}
						}), degrees, startPoint);

						// uncomment to show start cut line
						// console.log("startCutline: ", startCutline)
						var startCutlineGraphic = new Graphic(startCutline, startLineSymbol);
						graphicsLayer.add(startCutlineGraphic);

						// create a new polygon with the points that were used to calculate the rotated cut line
						var perpendicularPolygon = new Polygon(new SpatialReference({
							wkid: 4326
						}))

						perpendicularPolygon.addRing([
							endCutline.paths[0][0],
							segment.path[1],
							endCutline.paths[0][2],
							startCutline.paths[0][2],
							segment.path[0],
							startCutline.paths[0][0],
						])


						var perpPolyGraphic = new Graphic(perpendicularPolygon, perpFillSymbol, null, null)

						console.log("perpPolyGraphic: ", perpPolyGraphic)

						graphicsLayer.add(perpPolyGraphic)
						graphicsLayer.add(new Graphic(segmentPolyline, startLineSymbol, null, null))


						// var bufferMultiplier = (segment.left >= segment.right) ? segment.left : segment.right;

						// console.log("segmentBuffer radius: ", (threat.hostileUnit.size.footprint * bufferMultiplier))

						// var segmentBuffer = geometryEngine.geodesicBuffer(segmentPolyline, (threat.hostileUnit.size.footprint * bufferMultiplier), "meters", false);

						// buffer = geometryEngine.union([buffer, segmentBuffer]);

						// // check inter
						// var restrictedIntersect = geometryEngine.contains(restrictedPolygon, segmentPolyline);
						// // var restrictedIntersect = geometryEngine.intersects(segmentPolyline, restrictedPolygon);

						// if (restrictedIntersect) {
						// 	console.log("restrictedIntersect: ", restrictedIntersect)
						// 	graphicsLayer.add(new Graphic(segmentPolyline, startLineSymbol, null, null))
						// }

						// // check inter
						// var severelyRestrictedIntersect = geometryEngine.contains(segmentPolygon, segmentPolyline);
						// // var restrictedIntersect = geometryEngine.intersects(segmentPolyline, restrictedPolygon);

						// if (severelyRestrictedIntersect) {
						// 	console.log("restrictedIntersect: ", severelyRestrictedIntersect)
						// 	graphicsLayer.add(new Graphic(segmentPolyline, bufferFillSymbol, null, null))
						// }

						var leftSide = null;
						var rightSide = null;



						if (segment.leftGeometry) {

							leftSide = new Polygon(new SpatialReference({
								wkid: 4326
							}));

							segment.leftGeometry.forEach(function (ring) {
								leftSide.addRing(ring);

								console.log("LEFT RING: ", ring);

								ring.forEach(function (location, i) {

									console.log("left-location: ", location)

									if ((location[0] == segment.path[0][0] && location[1] === segment.path[0][1]) || (location[0] == segment.path[1][0] && location[1] === segment.path[1][1])) {
										return;
									} else {
										leftLine.push(location);
										allPoints.push(location);
									}


									var ringPoint = new Point(location, new SpatialReference({
										wkid: 4326
									}))

									var ringTextSymbol = new TextSymbol("" + i);
									ringTextSymbol.setAlign(TextSymbol.ALIGN_START);

									var xOffset = (i + 1 === ring.length) ? 0 : 10;
									ringTextSymbol.setOffset(xOffset, 0);

									ringTextSymbol.setColor(new Color([0, 0, 255]));


									// var textPointGraphic = new Graphic(ringPoint, ringTextSymbol);

									// graphicsLayer.add(textPointGraphic);

									// graphicsLayer.add(new Graphic(ringPoint, symbol))

								})
							});

							// buffer = geometryEngine.union([buffer, leftSide]);
						} else {
							var bufferMultiplier = segment.left;

							leftSide = geometryEngine.geodesicBuffer(segmentPolyline, (hostile.size.footprintDiameter * bufferMultiplier), "meters", false);
							// buffer = geometryEngine.union([buffer, segmentBuffer]);
						}

						totalBuffer = geometryEngine.union([totalBuffer, leftSide]);

						if (segment.rightGeometry) {

							rightSide = new Polygon(new SpatialReference({
								wkid: 4326
							}));

							segment.rightGeometry.forEach(function (ring) {
								rightSide.addRing(ring);

								console.log("RIGHT RING: ", ring);

								var rightSegmentLine = [];

								ring.forEach(function (location, i) {

									console.log("right-location: ", location)

									if ((location[0] == segment.path[0][0] && location[1] === segment.path[0][1]) || (location[0] == segment.path[1][0] && location[1] === segment.path[1][1])) {
										return;
									} else {
										rightSegmentLine.push(location);
										// allPoints.push(location)
									}




								})

								rightLines.push(rightSegmentLine);
							});

							// buffer = geometryEngine.union([buffer, rightSide]);
						} else {
							var bufferMultiplier = segment.right;

							var rightSide = geometryEngine.geodesicBuffer(segmentPolyline, (hostile.size.footprintDiameter * bufferMultiplier), "meters", false);
							// buffer = geometryEngine.union([buffer, segmentBuffer]);
						}

						graphicsLayer.add(new Graphic(leftSide, leftCutFillSymbol))
						graphicsLayer.add(new Graphic(rightSide, rightCutFillSymbol))

						totalBuffer = geometryEngine.union([totalBuffer, rightSide]);

					})

					var rightLine = [];
					for (var index = rightLines.length - 1; index >= 0; index--) {
						var lineSegment = rightLines[index];

						for (var i = 0; i < lineSegment.length - 1; i++) {
							rightLine.push(lineSegment[i]);
							allPoints.push(lineSegment[i])
						}
					}
					console.log("rightLine", rightLine);
					console.log("allPoints", allPoints);

					var finalBuffer = totalBuffer;

					// // close the loop....
					if (allPoints.length > 0) {

						allPoints.push(leftLine[0])

						// console.log("allPoints", allPoints);

						var pathPoly = new Polygon(new SpatialReference({
							wkid: 4326
						}));

						pathPoly.addRing(allPoints);

						console.log("pathPoly: ", pathPoly)

						var generalizedPoly = geometryEngine.generalize(pathPoly, 20, true);



						totalBuffer = geometryEngine.union([totalBuffer, pathPoly]);



						finalBuffer = new Polygon(new SpatialReference({
							wkid: 4326
						}));

						finalBuffer.addRing(totalBuffer.rings[0])
					}


					// var leftPolyLine = new Polyline({
					// 	paths: [leftLine],
					// 	spatialReference: {
					// 		wkid: 4326
					// 	}
					// });

					// graphicsLayer.add(new Graphic(leftPolyLine, leftLineSymbol))

					// var rightPolyLine = new Polyline({
					// 	paths: [rightLine],
					// 	spatialReference: {
					// 		wkid: 4326
					// 	}
					// });

					// graphicsLayer.add(new Graphic(rightPolyLine, rightLineSymbol))

					// var allPointsPolyline = new Polyline({
					// 	paths: [allPoints],
					// 	spatialReference: {
					// 		wkid: 4326
					// 	}
					// });

					// graphicsLayer.add(new Graphic(allPointsPolyline, activeLineSymbol))

					if (finalBuffer) {

						// graphicsLayer.add(new Graphic(finalBuffer, bufferFillSymbol))
					}


					if (route.duration) {

						// 	var numberOfCuts = 5;

						// 	// for (var timeMultiplyer = 1; timeMultiplyer <= numberOfCuts; timeMultiplyer++) {

						// 	// 	var timeElapsed = route.duration / numberOfCuts * timeMultiplyer;

						// 	// 	addLocationStepLayer(route, threat.hostileUnit, timeElapsed);

						// 	// }

						var timeCut = 60; // number of minutes for each cut;
						var counter = 1;


						// 	console.log("NEXT ONE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ")
						// 	console.log("route duration (hours): ", (route.duration / 60))

						// while (route.duration > (timeCut * counter)) {
						// 	addLocationStepLayer(route, threat.hostileUnit, (timeCut * counter), routeIndex);
						// 	counter++;
						// }
					}
				});
				console.log('routeAdjustments: ', routeObjects)

			});


			map.addLayer(graphicsLayer);
		});
	}


	var addLocationStepLayer = function (route, hostile, timeElapsed, routeIndex) {

		var self = this;


		require([
			'esri/graphic',
			'esri/layers/GraphicsLayer',
			'esri/geometry/Polyline',
			'esri/geometry/Polygon',
			'esri/symbols/SimpleLineSymbol',
			'esri/geometry/Circle',
			'esri/symbols/SimpleFillSymbol',

			'esri/units',
			"esri/symbols/TextSymbol",
			'esri/geometry/Point',
			'esri/symbols/PictureMarkerSymbol',
			'esri/symbols/SimpleMarkerSymbol',
			"esri/SpatialReference",
			"esri/geometry/webMercatorUtils",
			"esri/geometry/geodesicUtils",
			'esri/geometry/geometryEngine',
			"esri/Color"
		], function (Graphic, GraphicsLayer, Polyline, Polygon, SimpleLineSymbol,
			Circle, SimpleFillSymbol, Units, TextSymbol, Point, PictureMarkerSymbol,
			SimpleMarkerSymbol, SpatialReference, webMercatorUtils, geodesicUtils, geometryEngine, Color) {

			var graphicsLayer = new GraphicsLayer({
				id: "ESTIMATED_LOCATION_" + timeElapsed + "-" + routeIndex
			});

			var estimatedLocation = new Point(hostile.lng, hostile.lat);

			var percentDone = timeElapsed / route.duration;

			var count = (timeElapsed / 15)

			console.log()
			console.log()
			console.log()
			console.log("count: ", count)
			console.log("timeElapsed: ", timeElapsed)
			console.log("route.duration: ", route.duration)
			console.log("percentDone: ", percentDone)

			var segments = route.segments;


			console.log("segments: ", segments);
			if (percentDone > 0 && percentDone <= 1) {
				var accumulatedPathDuration = segments[0].duration;
				var segmentIndex = 0;
				// var segmentDuration =  route.duration;

				// console.log("Segment[0].duration: ", segments[0].duration)

				console.log("IN WHILE")
				while (timeElapsed > accumulatedPathDuration) {
					segmentIndex++;
					accumulatedPathDuration += segments[segmentIndex].duration;
					// console.log("Segment[" + segmentIndex + "].duration: ", segments[segmentIndex].duration)
				}

				// console.log("segmentIndex: ", segmentIndex);
				// console.log("accumulatedPathDuration: ", accumulatedPathDuration);
				// console.log("timeElapsed: ", timeElapsed);

				var segmentDurationRemainder = accumulatedPathDuration - timeElapsed;


				var calculatingSegment = segments[0];
				if (segmentIndex == segments.length) {
					calculatingSegment = segments[segmentIndex - 1]
				} else {
					calculatingSegment = segments[segmentIndex]
				}
				var radius = segmentDurationRemainder * calculatingSegment.speed / 60;

				// console.log("segmentDurationRemainder:", segmentDurationRemainder)
				console.log("calculatingSegment.speed:", calculatingSegment.speed)
				console.log("calculatingSegment.restriction:", calculatingSegment.restriction)
				// console.log("calculatingSegment.length:", calculatingSegment.length)
				// console.log("radius", radius)


				var center = calculatingSegment.path[1];

				var waypoint = new Point(center[0], center[1]);

				var waypointCircle = new Circle({
					center: waypoint,
					radius: radius,
					geodesic: true,
					radiusUnit: mcoo.model.EsriUnits.MILES
				});

				// console.log("center: ", center)
				// console.log("calculatingSegment: ", calculatingSegment)

				var segmentPolyline = new Polyline({
					paths: [calculatingSegment.path],
					spatialReference: {
						wkid: 4326
					}
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

				var perpLineSymbol = new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID,
					new Color([150, 0, 0, 1]),
					1
				);

				var waypointCircleGraphic = new Graphic(waypointCircle, circleFill);
				// graphicsLayer.add(waypointCircleGraphic);

				var segmentLineGraphic = new Graphic(segmentPolyline, perpLineSymbol);
				// graphicsLayer.add(segmentLineGraphic);

				var intersection = geometryEngine.intersect(segmentPolyline, waypointCircle);

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
				// console.log("intersection: ", intersection);
				// console.log("center: ", center);
				graphicsLayer.add(intersectionGrapic);



				if (intersection) {
					estimatedLocation = new Point(intersection.paths[0][0]);
				}

			}

			var image = "images/map-icons/hostile-" +
				hostile.type.value + "-" +
				hostile.mobility.value + "-" +
				hostile.size.value + "-" +
				"color.svg";

			var estimatedUnitSymbol = new PictureMarkerSymbol(image, 40, 40);

			var activeLineSymbol = new SimpleLineSymbol(
				SimpleLineSymbol.STYLE_DASH,
				new Color([0, 0, 0]),
				1
			);

			var dashedDiamondSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_DIAMOND,
				42,
				activeLineSymbol,
				new Color([0, 0, 0, 0.0])
			);

			var movedUnitGraphicDiamond = new Graphic(estimatedLocation, dashedDiamondSymbol);

			var movedUnitGraphic = new Graphic(estimatedLocation, estimatedUnitSymbol);


			var textSymbol = new TextSymbol(count, );
			textSymbol.setAlign(TextSymbol.ALIGN_START);
			textSymbol.setOffset(0, 0);
			textSymbol.setColor(new Color([0, 0, 255]));

			var textPointGraphic = new Graphic(estimatedLocation, textSymbol, null, null);

			graphicsLayer.add(textPointGraphic);

			graphicsLayer.add(movedUnitGraphicDiamond);
			// graphicsLayer.add(movedUnitGraphic);

			map.addLayer(graphicsLayer);

		})

	}




	// public
	return {

		/**
		 * Initializes map
		 */
		init: function () {

			console.log
			require(["esri/map", "dojo/domReady!"], function (Map) {


				map = new Map("map", {
					center: [-79.999174, 40.516341],
					zoom: 16,
					basemap: "topo"
				});

				console.log("init map")

				addToolbar();

			});
		},

		areaOfInterestSelected: function (id) {

			var area = mcoo.model.getAreaOfInterest(id);

			console.log("select area: ", id)
			console.log("select area: ", map)
			removeLayer(AREA_OF_INTEREST);

			require([
				'esri/graphic',
				'esri/layers/GraphicsLayer',
				'esri/geometry/Polygon',
				'esri/symbols/SimpleFillSymbol',
				"esri/symbols/SimpleLineSymbol",
				'esri/Color',
				"esri/SpatialReference",
				"dojo/domReady!"
			], function (Graphic, GraphicsLayer, Polygon, SimpleFillSymbol, SimpleLineSymbol, Color, SpatialReference) {

				// Create a polygon geometry for the Area of interest
				var polygon = new Polygon();
				polygon.addRing(area.footprint);

				var areaLine = new SimpleLineSymbol(
					SimpleLineSymbol.STYLE_SOLID,
					new Color([255, 0, 0]),
					3
				);

				var fillSymbol = new SimpleFillSymbol(
					SimpleFillSymbol.STYLE_SOLID,
					areaLine,
					new Color([20, 20, 20, 0])
				)

				// console.log('simple fill symbol: ', fillSymbol)
				// Add the geometry and symbol to a new graphic
				var polygonGraphic = new Graphic(polygon, fillSymbol, {
					name: area.name
				}, null);

				var graphicsLayer = new GraphicsLayer({
					id: AREA_OF_INTEREST
				});

				graphicsLayer.add(polygonGraphic)

				var extent = polygon.getExtent();

				// console.log("new map extent: ", mcoo.selection.mapExtent)
				map.setExtent(extent);

				// console.log("add polygraphic: ", polygonGraphic)
				map.addLayer(graphicsLayer)

				// clear units/areas

				if (area.mcoo.restricted.length > 0) {
					removeLayer(RESTRICTED);
					addRegions(area.mcoo.restricted, RESTRICTED);
				}
				if (area.mcoo.severelyRestricted.length > 0) {
					removeLayer(SEVERELY_RESTRICTED);
					addRegions(area.mcoo.severelyRestricted, SEVERELY_RESTRICTED);
				}
				if (area.mcoo.visibility.length > 0) {
					removeLayer(VISIBILITY);
					addRegions(area.mcoo.visibility, VISIBILITY);
				}


				var hostiles = mcoo.model.hostileUnits;
				var friendlies = mcoo.model.friendlyUnits;
				var mission = mcoo.model.threats;

				addUnits(hostiles, HOSTILE)
				addUnits(friendlies, FRIENDLY)

				addActiveLayer(mission);
			});
		},

		areaOfInterestDeselected: function () {
			// maybe more will go here
			removeLayer(AREA_OF_INTEREST);
			removeLayer(RESTRICTED);
			removeLayer(SEVERELY_RESTRICTED);
			removeLayer(VISIBILITY);
		},

		newAreaOfInterest: function () {
			removeLayer(NEW_AREA_OF_INTEREST);
		},

		startNewRegionPolygon: function (type) {

			removeLayer(NEW_REGION);

			$("#draw-instructions").show();

			drawState = NEW_REGION;

			toolbar.activate(draw[type], {
				tolerance: 1
			});
		},

		updateRegions: function (eventData) {

			removeLayer(NEW_REGION);

			var selectedArea = mcoo.selection.areaOfInterest;

			if (eventData.areaId === selectedArea.id) {

				switch (eventData.category) {

					case mcoo.defaults.RESTRICTED:
						removeLayer(RESTRICTED);
						if (mcoo.controller.mapVisibility.restricted) {
							addRegions(selectedArea.mcoo.restricted, RESTRICTED);
						}
						break;
					case mcoo.defaults.SEVERELY_RESTRICTED:
						removeLayer(SEVERELY_RESTRICTED);
						if (mcoo.controller.mapVisibility.severelyRestricted) {
							addRegions(selectedArea.mcoo.severelyRestricted, SEVERELY_RESTRICTED);
						}
						break;
					case mcoo.defaults.VISIBILITY:
						removeLayer(VISIBILITY);
						if (mcoo.controller.mapVisibility.visibility) {
							addRegions(selectedArea.mcoo.visibility, VISIBILITY);
						}
						break;
					default:
						console.log("Region Category doesn't exist", category)
						return
				}
			}


		},

		missionUpdated: function (eventData) {
			var mission = mcoo.model.threats;

			console.log("map.mission updated: ", eventData)
			console.log("map.mission updated: ", mission)

			addActiveLayer(mission);
		},

		mapVisibilityChanged: function () {
			console.log("Map Visibility Changed: ", mcoo.controller.mapVisibility);

			var selectedArea = mcoo.selection.areaOfInterest;

			removeLayer(RESTRICTED);
			if (mcoo.controller.mapVisibility.restricted) {
				addRegions(selectedArea.mcoo.restricted, RESTRICTED);
			}

			removeLayer(SEVERELY_RESTRICTED);
			if (mcoo.controller.mapVisibility.severelyRestricted) {
				addRegions(selectedArea.mcoo.severelyRestricted, SEVERELY_RESTRICTED);
			}

			removeLayer(VISIBILITY);
			if (mcoo.controller.mapVisibility.visibility) {
				addRegions(selectedArea.mcoo.visibility, VISIBILITY);
			}
		}

	}

})();






// var perpendicular = geometryEngine.rotate(segmentPoly, 90)


// 						var doesIntersect = geometryEngine.intersects(perpendicular, polyPath);
// 						var pathIntersect = geometryEngine.union(perpendicular, segmentPoly);
// 						if (pathIntersect) {
// 							var bufferIntersect = geometryEngine.intersect(perpendicular, buffer);

// 							var segmentBuffer = geometryEngine.geodesicBuffer(segmentPoly, threat.hostileUnit.size.footprint, "meters", false)





// 							var bufferIntersectGraphic = new Graphic(bufferIntersect, bufferIntersectFillSymbol, null, null);
// 							var polyIntersectGraphic = new Graphic(pathIntersect, polyIntersectFillSymbol, null, null);



// 							var leftCutGraphic = new Graphic(cuts[0], leftCutFillSymbol, null, null);
// 							var rightCutGraphic = new Graphic(cuts[1], rightCutFillSymbol, null, null);


// 							// console.log("bufferIntersect: ", bufferIntersect);
// 							// console.log("pathIntersect: ", pathIntersect);

// 							graphicsLayer.add(bufferIntersectGraphic);
// 							graphicsLayer.add(polyIntersectGraphic);
// 							graphicsLayer.add(leftCutGraphic);
// 							graphicsLayer.add(rightCutGraphic);

// 							var intersectPoint = new Point(bufferIntersect.paths[0][0])

// 							var intersectCircle = new Circle({
// 								center: intersectPoint,
// 								radius: threat.hostileUnit.size.footprint,
// 								geodesic: true,
// 								radiusUnit: mcoo.model.EsriUnits.METERS
// 							});
// 							// console.log("intersectPoint: ", intersectPoint);
// 							// console.log("intersectCircle: ", intersectCircle);

// 							var circleGraphic = new Graphic(intersectCircle, bufferIntersectFillSymbol);

// 							// graphicsLayer.add(circleGraphic);
// 						}