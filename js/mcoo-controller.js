'use strict'

mcoo.controller = (function () {

	console.log("load mcoo.controller");
	// private

	var dataLoaded = function(eventData) {
		console.log("dataLoadedController")
		mcoo.areaControls.update();


		mcoo.selection.select(mcoo.selection.AREA_OF_INTEREST, mcoo.model.areasOfInterest[0]);
	}
	
	var areaOfInterestSelected = function (eventData) { 
		console.log("controller.areaOfInterestSelected: ", eventData) 
		
		if (eventData.id != null) {
			mcoo.map.areaOfInterestSelected(eventData.id);
			mcoo.areaControls.areaOfInterestSelected(eventData.id);
		} else {
			mcoo.map.areaOfInterestDeselected();
			mcoo.areaControls.areaOfInterestDeselected();
		}
		
	}

	var newAreaOfInterestFootprint = function (eventData) {
		console.log("newAreaOfInterestFootprint")
		mcoo.areaControls.newAreaOfInterestFootprint(eventData);
	}

	var newRegionFootprint = function (eventData) {
		console.log("newRegionPath")
		mcoo.areaControls.newRegionFootprint(eventData);
	}

	var newAreaOfInterest = function (eventData)  {
		console.log("newAreaOfInterest")
		mcoo.areaControls.update();
		mcoo.map.newAreaOfInterest();

		mcoo.selection.select(mcoo.selection.AREA_OF_INTEREST, null);
	}

	var updateRegions = function (eventData) {
		console.log("new Region: ", eventData);
		mcoo.areaControls.updateRegions(eventData);
		mcoo.map.updateRegions(eventData);

	}

	var mapVisibilityChanged = function eventData(eventData) {
		console.log("Map Visibility Changed")

		mcoo.areaControls.updateRegions(eventData);
		mcoo.map.mapVisibilityChanged();
	}

	var removedAreaOfInterest = function () {
		console.log("newAreaOfInterest")
		mcoo.areaControls.update();
		// mcoo.map.newAreaOfInterest();

		mcoo.selection.select(mcoo.selection.AREA_OF_INTEREST, null);

	}

	var newUnitRoute = function (eventData) {

		mcoo.model.addAttackPath(mcoo.model.hostileUnits[0].id, eventData)
	}

	var missionUpdated = function (eventData) {
		mcoo.map.missionUpdated(eventData);
	}



	// public
	return {


		init: function() {
			mcoo.events.register(mcoo.events.DATA_LOADED, dataLoaded);
			mcoo.events.register(mcoo.events.AREA_OF_INTEREST_SELECTED, areaOfInterestSelected);
			mcoo.events.register(mcoo.events.NEW_AREA_OF_INTEREST_PATH, newAreaOfInterestFootprint);
			mcoo.events.register(mcoo.events.NEW_AREA_OF_INTEREST, newAreaOfInterest);

			mcoo.events.register(mcoo.events.NEW_REGION_PATH, newRegionFootprint);
			mcoo.events.register(mcoo.events.NEW_REGION, updateRegions);
			
			mcoo.events.register(mcoo.events.NEW_UNIT_ROUTE, newUnitRoute);

			mcoo.events.register(mcoo.events.REMOVED_REGION, updateRegions);
			mcoo.events.register(mcoo.events.REMOVED_AREA_OF_INTEREST, removedAreaOfInterest);

			mcoo.events.register(mcoo.events.MAP_VISIBILITY_CHANGED, mapVisibilityChanged);

			mcoo.events.register(mcoo.events.MISSION_UPDATED, missionUpdated);

		},	

		mapVisibility: {
			restricted: true,
			severelyRestricted: true,
			visibility: true
		}

	}

})();