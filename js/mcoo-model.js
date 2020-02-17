'use strict'

mcoo.model = (function () {

	console.log("load mcoo.model");
	// private



	// public
	return {
		areaOfInterestId: 1,
		regionId: 1,

		areasOfInterest: [],


		hostileUnits: [],
		friendlyUnits: [],
		threats: [],

		geometryEngine: null,
		Point: null,
		Polyline: null,
		Polygon: null,
		Circle: null,
		SpatialReference: null,
		EsriUnits: null,
		webMercatorUtils: null,
		geodesicUtils: null,

		init: function () {
			var self = this;

			console.log("Load data");

			require(['esri/geometry/Point',
				"esri/geometry/Polyline",
				"esri/geometry/Polygon",
				'esri/geometry/Circle',
				'esri/units',
				"esri/SpatialReference",
				"esri/geometry/geometryEngine",
				"esri/geometry/webMercatorUtils",
				"esri/geometry/geodesicUtils",

			], function (point, polyline, polygon, circle, units, spatialReference, ge, wMU, gd) {
				self.geometryEngine = ge;
				self.Point = point;
				self.Polyline = polyline;
				self.Polygon = polygon;
				self.EsriUnits = units;
				self.SpatialReference = spatialReference;
				self.Circle = circle;
				self.webMercatorUtils = wMU;
				self.geodesicUtils = gd;

				if (MCOOArea) {
					mcoo.defaults.areaOfInterestId = MCOOArea.areaOfInterestId;
					mcoo.defaults.regionId = MCOOArea.regionId;
					mcoo.defaults.areasOfInterest = MCOOArea.areasOfInterest;
				}

				self.areaOfInterestId = mcoo.defaults.areaOfInterestId;
				self.regionId = mcoo.defaults.regionId;


				mcoo.defaults.areasOfInterest.forEach(function (area) {
					self.areasOfInterest.push(area);
				})

				self.loadUnitData();
			});


		},


		/**
		 * Get Area of Interest by id
		 * @param {string} id 
		 */
		getAreaOfInterest: function (id) {
			var self = this;

			var index = rcs.findIndexByValue(self.areasOfInterest, "id", id)

			if (index >= 0) {
				return self.areasOfInterest[index];
			} else {
				console.log("Area of Interest with id: ", id, " does not exist")
				return null;
			}

		},

		saveNewArea: function (area) {
			var self = this;

			var maxiumLatitude = -100;
			var minimiumLatitude = 100;
			var maxiumLongitude = -200;
			var minimiumLongitude = 200;

			area.footprint.forEach(function (coordinate) {

				console.log("coordinate to get max/min: ", coordinate);
				if (coordinate[0] > maxiumLongitude) {
					maxiumLongitude = coordinate[0]
				} else if (coordinate[0] < minimiumLongitude) {
					minimiumLongitude = coordinate[0]
				}

				if (coordinate[1] > maxiumLatitude) {
					maxiumLatitude = coordinate[1]
				} else if (coordinate[1] < minimiumLatitude) {
					minimiumLatitude = coordinate[1]
				}

			})

			var newArea = {
				id: self.areaOfInterestId++,
				footprint: area.footprint,
				name: area.name,
				mcoo: {
					restricted: [],
					severelyRestricted: [],
					visibility: []
				},
				latitude: [minimiumLatitude, maxiumLatitude],
				longitude: [minimiumLongitude, maxiumLongitude],
			}

			self.areasOfInterest.push(newArea);

			mcoo.events.send(mcoo.events.NEW_AREA_OF_INTEREST, newArea);
		},

		/** 
		 * Saves new region with their category to the area of interest
		 * 
		 * @param {Object} region 
		 * @param {String} areaId 
		 */
		saveNewRegion: function (region, areaId) {
			var self = this;
			console.log("save new region to area: ", region, areaId)

			var area = self.getAreaOfInterest(areaId);

			if (!area) {
				console.log("area doest not exist", areaId);
				return;
			}

			var category = region.category;

			var newRegion = {
				id: self.regionId++,
				footprint: region.footprint,
				name: region.name,
				category: region.category,
				unitType: region.unitType
			}

			switch (category) {

				case mcoo.defaults.RESTRICTED:
					area.mcoo.restricted.push(newRegion);
					break;
				case mcoo.defaults.SEVERELY_RESTRICTED:
					area.mcoo.severelyRestricted.push(newRegion);
					break;
				case mcoo.defaults.VISIBILITY:
					area.mcoo.visibility.push(newRegion);
					break;
				default:
					console.log("Region Category doesn't exist", category)
					return
			}

			mcoo.events.send(mcoo.events.NEW_REGION, {
				areaId: areaId,
				category: category
			})

		},


		removeRegion: function (id, category, areaId) {
			var self = this;
			console.log("Remove this region: ", id, category, areaId)

			var area = self.getAreaOfInterest(areaId);

			if (!area) {
				console.log("area doest not exist", areaId);
				return;
			}

			switch (category) {

				case mcoo.defaults.RESTRICTED:
					var regionIndex = rcs.findIndexByValue(area.mcoo.restricted, "id", id);
					area.mcoo.restricted.splice(regionIndex, 1);
					break;
				case mcoo.defaults.SEVERELY_RESTRICTED:
					console.log("area: ", area)
					var regionIndex = rcs.findIndexByValue(area.mcoo.severelyRestricted, "id", id);
					area.mcoo.severelyRestricted.splice(regionIndex, 1);
					break;
				case mcoo.defaults.VISIBILITY:
					var regionIndex = rcs.findIndexByValue(area.mcoo.visibility, "id", id);
					area.mcoo.visibility.splice(regionIndex, 1);
					break;
				default:
					console.log("Region Category doesn't exist", category)
					return
			}

			mcoo.events.send(mcoo.events.REMOVED_REGION, {
				areaId: areaId,
				category: category
			})
		},

		removeAreaOfInterest: function (id) {
			var self = this;
			var areaIndex = rcs.findIndexByValue(self.areasOfInterest, "id", id);
			self.areasOfInterest.splice(areaIndex, 1);

			mcoo.events.send(mcoo.events.REMOVED_AREA_OF_INTEREST, {
				id: id
			})
		},


		// acove route stuff




		distance: function (friendly, hostile) {
			var self = this;

			var distance;

			var distanceLine = new self.Polyline([
				[friendly.lng, friendly.lat],
				[hostile.lng, hostile.lat]
			]);
			distance = self.geometryEngine.geodesicLength(distanceLine, 'miles');

			console.log("OUTSIDE ----------------------------- distance from: ", hostile, " to ", friendly, " is " + distance + " miles");

			//return Number(distance).toFixed(2);
			return distance;
		},

		getAttackAngle: function (friendly, hostile) {
			var self = this;

			var start = self.webMercatorUtils.geographicToWebMercator(new self.Point(hostile.lng, hostile.lat));
			var end = self.webMercatorUtils.geographicToWebMercator(new self.Point(friendly.lng, friendly.lat));

			// console.log("arrow points: ", start, end)
			var dx = end.x - start.x,
				dy = end.y - start.y,
				dist = Math.sqrt(dx * dx + dy * dy) * .95,
				rads = Math.atan2(dx, dy);

			// console.log("gimme dx, dy, distance: ", dx, dy, dist)

			// convert from radians to degrees
			if (rads < 0) {
				rads = Math.abs(rads);
			} else {
				rads = 2 * Math.PI - rads;
			}
			var degrees = rads * 180 / Math.PI;

			return degrees;
		},

		loadUnitData: function () {
			var self = this;

			self.hostileUnits.push({
				id: "H-1",
				name: "Enemy Unit 1",
				lat: 40.441704,
				lng: -80.011027,
				mobility: self.getMobilityByValue('wheeled'),
				size: self.getSizeByValue('battalion'),
				type: self.getTypeByValue('infantry'),
			});

			self.friendlyUnits.push({
				id: "F-1",
				name: "Maddog Gunners",
				mobility: self.getMobilityByValue('dismounted'),
				size: self.getSizeByValue('squad'),
				type: self.getTypeByValue('special'),
				lat: 40.516403,
				lng: -79.999011
			});


			self.friendlyUnits.forEach(function (friendly) {

				self.hostileUnits.forEach(function (hostile) {


					hostile.combatSpeed = self.combatSpeed(hostile.size, hostile.mobility);

					var id = friendly.id + "-" + hostile.id;
					var calculatedDistance = self.distance(friendly, hostile);
					var attackAngle = self.getAttackAngle(friendly, hostile);

					var segmentPath = [
						[
							[hostile.lng, hostile.lat],
							[friendly.lng, friendly.lat]
						]
					]


					// var segment = {
					// 	path: segmentPath,
					// 	length: segmentLength,
					// 	speed: speed,
					// 	duration: duration,
					// 	left: segementAttributes.left,
					// 	right: segementAttributes.right,
					// 	restriction: segementAttributes.restriction,
					// }

					// will move to calculator...
					var defaultRoute = {
						path: segmentPath,
						isWinner: false,
						segments: [],
						// duration: duration,
					};



					self.threats.push({
						id: id,
						distance: calculatedDistance,
						attackAngle: attackAngle,
						friendlyUnit: friendly,
						hostileUnit: hostile,
						routes: [defaultRoute],
					});
				});
			});

			console.log("self.threats: ", self.threats);

			mcoo.events.send(mcoo.events.DATA_LOADED, {});

		},
		// get unit type by value
		getTypeByValue: function (value) {
			var self = this;
			var demo = acove.defaults.demo;

			console.log("demo.type: ", demo.unitTypes);

			var typeIndex = rcs.findIndexByValue(demo.unitTypes, "value", value);
			var type = demo.unitTypes[typeIndex];

			return type;
		},

		// get unit size by value
		getSizeByValue: function (value) {
			var self = this;
			var demo = acove.defaults.demo;

			var sizeIndex = rcs.findIndexByValue(demo.unitSizes, "value", value);
			var size = demo.unitSizes[sizeIndex];

			return size;
		},

		// get unit mobility by value
		getMobilityByValue: function (value) {
			var self = this;
			var demo = acove.defaults.demo;

			var mobilityIndex = rcs.findIndexByValue(demo.mobility, "value", value);
			var mobility = demo.mobility[mobilityIndex];

			return mobility;
		},

		addAttackPath: function (unitId, simplePath) {
			var self = this;
			// array reduce to get double lines..

			console.log("simplePath: ", simplePath);

			var threat = null;
			threat = self.getThreatByHostile(unitId);
			var hostile = threat.hostileUnit;

			var segments = [];

			var pathDuration = 0;

			// set here because we need to get all of the regions for only this hostile type.
			var restrictedRegions = self.getRestrectedRegions(hostile.type);

			var restrictedPolygon = new self.Polygon(new self.SpatialReference({
				wkid: 4326
			}));

			restrictedRegions.forEach(function (region) {
				restrictedPolygon.addRing(region.footprint);
			});

			var severelyRestrictedRegions = self.getSeverelyRestrectedRegions(hostile.type);


			var severelyRestrictedPolygon = new self.Polygon(new self.SpatialReference({
				wkid: 4326
			}));

			severelyRestrictedRegions.forEach(function (region) {
				severelyRestrictedPolygon.addRing(region.footprint);
			});
			console.log("severelyRestrictedPolygon: ", severelyRestrictedPolygon)


			// add intersects for each region type into the path
			simplePath.route = self.instertRegionIntersects(simplePath.route, severelyRestrictedPolygon);
			simplePath.route = self.instertRegionIntersects(simplePath.route, restrictedPolygon);

			console.log('restricted regions: ', restrictedRegions)
			console.log('Severely restricted regions: ', restrictedRegions)

			// this path is a series of smaller lines...
			var path = simplePath.route.map(function (vertex, index) {
				var segmentPath = []
				if (index === 0) {
					segmentPath.push([hostile.lng, hostile.lat])
					segmentPath.push(vertex)
				} else if (index < simplePath.route.length) {
					segmentPath.push(simplePath.route[(index - 1)])
					segmentPath.push(vertex)
				}

				var segmentPolyline = new self.Polyline({
					paths: [segmentPath],
					spatialReference: {
						wkid: 4326
					}
				});

				// console.log("segmentPolyline: ", segmentPolyline);
				// using boolean for now... can change to geometry...
				var inRestricted = self.geometryEngine.contains(restrictedPolygon, segmentPolyline);
				// var inRestricted = self.geometryEngine.intersects(restrictedPolygon, segmentPolyline);

				var inSeverelyRestricted = self.geometryEngine.intersect(segmentPolyline, severelyRestrictedPolygon);
				var withinSeverelyRestricted = self.geometryEngine.within(segmentPolyline, severelyRestrictedPolygon);
				// console.log("inSeverelyRestricted: ", inSeverelyRestricted);
				// console.log("withinSeverelyRestricted: ", withinSeverelyRestricted);

				var segmentAttributes = self.getSegmentAttributes(segmentPath, severelyRestrictedPolygon, withinSeverelyRestricted, hostile.size.footprint);
				// console.log("segemtAttributes: ", segmentAttributes);


				// calculator?
				var segmentLength = self.geometryEngine.geodesicLength(segmentPolyline, 'miles');
				// console.log("Segment Length: ", segmentLength);
				// console.log("Segment Path: ", segmentPath);

				var speed = hostile.combatSpeed;

				speed = self.getSegmentRestrictedSpeed(inRestricted, speed);

				speed = self.getSegmentCanalizationSpeed(segmentAttributes.restriction, speed);

				// console.log("Segment Speed: ", speed);

				var duration = (segmentLength / speed) * 60 // Miles / miles per hour = hours * 60 for minutes

				var segment = {
					path: segmentPath,
					length: segmentLength,
					speed: speed,
					duration: duration,
					left: segmentAttributes.left,
					right: segmentAttributes.right,
					restriction: segmentAttributes.restriction,
					segmentPolygon: segmentAttributes.segmentPolygon,
					leftGeometry: segmentAttributes.leftGeometry,
					rightGeometry: segmentAttributes.rightGeometry,
					perpendicularPolygon: segmentAttributes.perpendicularPolygon
				}

				pathDuration += duration;

				segments.push(segment);

				return segmentPath;

			})

			console.log("segments:", segments)

			var route = {
				path: path,
				segments: segments,
				duration: pathDuration,
				isWinner: false
			}

			console.log("Path Duration: ", pathDuration)
			console.log("Path Duration Split: ", pathDuration / 10)

			console.log("Adjusted route: ", route);


			threat.routes.push(route);
			console.log("threat: ", threat.routes);

			mcoo.events.send(mcoo.events.MISSION_UPDATED, {
				id: threat.id
			});

		},

		getThreatByFriendly: function (unitId) {
			var self = this;

			return self.threats.filter(function (threat) {
				return threat.friendlyUnit.id === unitId;
			})[0];
		},

		getThreatByHostile: function (unitId) {
			var self = this;

			return self.threats.filter(function (threat) {
				return threat.hostileUnit.id === unitId;
			})[0];
		},

		getRestrectedRegions: function (unitType) {
			var self = this;

			var restricted = mcoo.selection.areaOfInterest.mcoo.restricted;

			console.log("get restricted regions ", restricted, unitType)

			return restricted.filter(function (region) {
				return region.unitType == "All" || region.unitType == unitType.name
			})
		},

		getSeverelyRestrectedRegions: function (unitType) {
			var self = this;

			var severelyRestricted = mcoo.selection.areaOfInterest.mcoo.severelyRestricted;

			console.log("get restricted regions ", severelyRestricted, unitType);

			return severelyRestricted.filter(function (region) {
				return region.unitType == "All" || region.unitType == unitType.name
			})
		},

		combatSpeed: function (size, mobility) {
			return size.speedMultiplier * mobility.speed;
		},

		instertRegionIntersects: function (simplePath, regionPolygon) {
			var self = this;

			var finalPath = [];

			console.log("simplePath: ", simplePath)

			// check intersects on each segment, and insert the ones that done correspond to the next point of the path...
			for (var index = 0; index < (simplePath.length - 1); index++) {

				var currentPoint = simplePath[index];
				var nextPoint = simplePath[index + 1];

				// console.log("index: ", index)
				// console.log("currentPoint: ", currentPoint)
				// console.log("nextPoint: ", nextPoint)

				var segmentLine = new self.Polyline({
					paths: [
						[
							currentPoint, // this point and the next one
							nextPoint
						]
					],
					spatialReference: {
						wkid: 4326
					}
				});

				// add currentPoint before adding any intersecting points
				finalPath.push(currentPoint)



				var pathIntersects = self.geometryEngine.intersect(segmentLine, regionPolygon);

				// if there is a path intersect
				if (pathIntersects) {

					pathIntersects.paths.forEach(function (path) {
						path.forEach(function (intersectingPoint) {

							// console.log("intersectingPoint: ", intersectingPoint[0], currentPoint[0], nextPoint[0])
							// console.log("intersectingPoint: ", intersectingPoint[1], currentPoint[1], nextPoint[1])
							// console.log("intersectingPoint: ", intersectingPoint)

							// if intersectingPoints != nextPoint || intersectingPoint != currentPoint (this is ugly)
							if ((intersectingPoint[0] != nextPoint[0] || intersectingPoint[1] != nextPoint[1]) &&
								(intersectingPoint[0] != currentPoint[0] || intersectingPoint[1] != currentPoint[1])) {
								console.log("push!!!!!", intersectingPoint)
								finalPath.push(intersectingPoint)
							}

						})

					})

					// dont add next point, next iteration does....
				}

			}


			//finally add the last point... 

			finalPath.push(simplePath[simplePath.length - 1]);

			return finalPath;





		},

		// Returns combat speed
		// --> derived from unit type and mobility
		combatSpeed: function (size, mobility) {
			return size.speedMultiplier * mobility.speed;
		},


		// Not sure of this is how I want to do this
		getSegmentRestrictedSpeed: function (inRestricted, speed) {
			var self = this;

			// console.log("in Restricted: ", inRestricted, speed);

			// this point 8 should be in config
			return (inRestricted) ? speed * 0.8 : speed;
		},

		// Not sure of this is how I want to do this
		getSegmentCanalizationSpeed: function (restrictionPercentage, speed) {
			var self = this;

			// console.log("in Restricted: ", restrictionPercentage, speed);

			var footprintMultiplier = 2; // will be in config... 

			var restriction = footprintMultiplier - (footprintMultiplier * restrictionPercentage);

			// if restriction less than 1, multiply speed by that, otherwise the whole unit can fit through segment
			return (restriction < 1) ? speed * restriction : speed;
		},


		getSegmentAttributes: function (segment, severelyRestrictedPolygon, inSeverelyRestricted, distance) {
			var self = this;

			if (!segment) {
				return;
			}

			// // if intersecting the restricted... just set the left and right to tiny, and restricted big...
			// if (inSeverelyRestricted) {
			// 	return {
			// 		left: .01,
			// 		right: .01,
			// 		restriction: .99,
			// 	}
			// }

			var segmentPolyline = new self.Polyline({
				paths: [segment],
				spatialReference: {
					wkid: 4326
				}
			});

			// get the location to draw the cut lines through
			var startPoint = new self.Point(segment[0], new self.SpatialReference({
				wkid: 4326
			}));

			var endPoint = new self.Point(segment[1], new self.SpatialReference({
				wkid: 4326
			}));

			// convert to webMercator to get angle to rotate
			var start = self.webMercatorUtils.geographicToWebMercator(startPoint);
			var end = self.webMercatorUtils.geographicToWebMercator(endPoint);

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
			var endCutline = self.geometryEngine.rotate(new self.Polyline({
				paths: [
					[
						self.webMercatorUtils.xyToLngLat(end.x - 15000, end.y),
						segment[1],
						self.webMercatorUtils.xyToLngLat(end.x + 15000, end.y),
					]
				],
				spatialReference: {
					wkid: 4326
				}
			}), degrees, endPoint);

			// uncomment to show end cutline
			// var endCutlineGraphic = new Graphic(endCutline, perpLineSymbol);
			// graphicsLayer.add(endCutlineGraphic)

			var startCutline = self.geometryEngine.rotate(new self.Polyline({
				paths: [
					[
						self.webMercatorUtils.xyToLngLat(start.x - 15000, start.y),
						segment[0],
						self.webMercatorUtils.xyToLngLat(start.x + 15000, start.y),
					]
				],
				spatialReference: {
					wkid: 4326
				}
			}), degrees, startPoint);

			// uncomment to show start cut line
			// console.log("startCutline: ", startCutline)
			// var startCutlineGraphic = new Graphic(startCutline, startLineSymbol);
			// graphicsLayer.add(startCutlineGraphic);

			// create a new polygon with the points that were used to calculate the rotated cut line
			var perpendicularPolygon = new self.Polygon(new self.SpatialReference({
				wkid: 4326
			}))

			perpendicularPolygon.addRing([
				endCutline.paths[0][0],
				segment[1],
				endCutline.paths[0][2],
				startCutline.paths[0][2],
				segment[0],
				startCutline.paths[0][0],
			])

			// console.log("perependicular polygon: ", perpendicularPolygon);

			// create starting buffer with twice the radius of (stored on size as diameter... so already 2r) ** stored here as meters, will change to miles when moving to acove
			var twoRBuffer = self.geometryEngine.geodesicBuffer(segmentPolyline, distance, "meters", false);

			// Calculate the overlap with the double buffer and the perpendicular polygon to get the region 2 x the unit footprint from the path
			var twoROverlap = self.geometryEngine.intersect(twoRBuffer, perpendicularPolygon)

			var leftOverlapMultiplier = 1;
			var rightOverlapMultiplier = 1;

			var leftRadius = 1;
			var rightRadius = 1;

			var leftPercentOverlap = 0;
			var rightPercentOverlap = 0;

			var totalOverlap = 0;

			if (twoROverlap) {

				var twoRCut = self.geometryEngine.cut(twoROverlap, segmentPolyline);

				var twoRLeftCut = twoRCut[0];

				var leftSevereInterect = self.geometryEngine.intersect(severelyRestrictedPolygon, twoRLeftCut);

				if (leftSevereInterect) {
					var leftArea = self.geometryEngine.geodesicArea(twoRLeftCut, "square-meters");
					var leftIntersectArea = self.geometryEngine.geodesicArea(leftSevereInterect, "square-meters")

					leftPercentOverlap = leftIntersectArea / leftArea;
					// console.log("left Percent Overlap: ", leftArea, leftIntersectArea, leftPercentOverlap);
					rightRadius += leftPercentOverlap;
					leftRadius -= leftPercentOverlap;
				}

				var rightBuffer = self.geometryEngine.geodesicBuffer(segmentPolyline, (distance * rightRadius), "meters", false)

				var rightPerpendicularBuffer = self.geometryEngine.intersect(rightBuffer, perpendicularPolygon)

				var rightAdjustedCuts = self.geometryEngine.cut(rightPerpendicularBuffer, segmentPolyline);

				var rightCut = rightAdjustedCuts[1];

				var rightSevereInterect = self.geometryEngine.intersect(severelyRestrictedPolygon, rightCut);

				if (rightSevereInterect) {
					var rightArea = self.geometryEngine.geodesicArea(rightCut, "square-meters");
					var rightIntersectArea = self.geometryEngine.geodesicArea(rightSevereInterect, "square-meters")

					rightPercentOverlap = rightIntersectArea / rightArea;
					// console.log("right Percent Overlap: ", rightArea, rightIntersectArea, rightPercentOverlap);

					rightRadius -= rightPercentOverlap;

					totalOverlap = rightPercentOverlap;
				}

				if (leftPercentOverlap <= 0) {

					leftRadius += rightPercentOverlap;

					var leftBuffer = self.geometryEngine.geodesicBuffer(segmentPolyline, (distance * leftRadius), "meters", false)

					var leftPerpendicularBuffer = self.geometryEngine.intersect(leftBuffer, perpendicularPolygon)

					var leftAdjustedCuts = self.geometryEngine.cut(leftPerpendicularBuffer, segmentPolyline);

					var leftCut = leftAdjustedCuts[0];

					var leftSevereInterect = self.geometryEngine.intersect(severelyRestrictedPolygon, leftCut);
					if (leftSevereInterect) {
						var leftArea = self.geometryEngine.geodesicArea(leftCut, "square-meters");
						var leftIntersectArea = self.geometryEngine.geodesicArea(leftSevereInterect, "square-meters")

						leftPercentOverlap = leftIntersectArea / leftArea;
						// console.log("left 2 Percent Overlap: ", leftArea, leftIntersectArea, leftPercentOverlap);

						leftRadius -= leftPercentOverlap;

						totalOverlap = leftPercentOverlap;
					}
				}
			}

			if (inSeverelyRestricted && totalOverlap >= 1 ) {
                leftRadius = .01;
                rightRadius  = .01;
                totalOverlap =  .99
			}

            console.log("")
            console.log("In Severely Restricted: ", inSeverelyRestricted)
            console.log("----------------------------------left, right: ", leftRadius, rightRadius, segmentPolyline);
            
            console.log("segmentPolyline: ", segmentPolyline )
            console.log("perpendicularPolygon", perpendicularPolygon)


            if (leftRadius == 0) {
                leftRadius = .0001
            }

            if (rightRadius == 0) {
                leftRadius = .0001
            }
            var leftBufferPolygon = self.geometryEngine.geodesicBuffer(segmentPolyline, (distance * leftRadius), "meters", false)
            var rightBufferPolygon = self.geometryEngine.geodesicBuffer(segmentPolyline, (distance * rightRadius), "meters", false)
            // console.log("leftBufferPolygon, rightBufferPolygon: ", leftBufferPolygon, rightBufferPolygon)

            var leftPerpendicularIntersect = self.geometryEngine.intersect(leftBufferPolygon, perpendicularPolygon);
            var rightPerpendicularIntersect = self.geometryEngine.intersect(rightBufferPolygon, perpendicularPolygon);
            // console.log("leftPerpendicularIntersect, rightPerpendicularIntersect: ", leftPerpendicularIntersect, rightPerpendicularIntersect)

            var leftBufferCut = self.geometryEngine.cut(leftPerpendicularIntersect, segmentPolyline);
            var rightBufferCut = self.geometryEngine.cut(rightPerpendicularIntersect, segmentPolyline);
            // console.log("leftBufferCut, rightBufferCut, segmentPolyline: ", leftBufferCut, rightBufferCut, segmentPolyline)

            var leftGeometry = leftBufferCut[0];
            var rightGeometry = rightBufferCut[1];
            console.log("leftGeometry, rightGeometry: ", leftGeometry, rightGeometry)

            // var finalPolygon = leftBufferPolygon;

            var finalPolygon = self.geometryEngine.union([leftGeometry, rightGeometry]);
           
            // if (perpendicularCut) {
                
            //     finalPolygon = self.geometryEngine.difference(perpendicularCut, severelyRestrictedPolygon);
            //     // finalPolygon = perpendicularCut;
            //     // finalPolygon  = {rings: []}
            // } 
            
            if (!finalPolygon) {
                finalPolygon  = {rings: []}
            };
            
			return {
				left: leftRadius,
				right: rightRadius,
                restriction: totalOverlap,
                footprint: finalPolygon.rings,
                leftGeometry: leftGeometry.rings,
                rightGeometry: rightGeometry.rings
			}

		}


	}

})();