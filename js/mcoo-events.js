'use strict'

mcoo.events = (function() {
	
	console.log("load mcoo.events");
	// private

	var registered = {};

	// public
	return {

		DATA_LOADED: "dataLoaded",

		AREA_OF_INTEREST_SELECTED: "areaOfInterestSelected",

		// used to pass path from map to controls
		NEW_AREA_OF_INTEREST_PATH: "newAreaOfInterestPath",
		NEW_REGION_PATH: "newRegionPath",
		NEW_UNIT_ROUTE: "newUnitRoute",

		//
		NEW_AREA_OF_INTEREST: "newAreaOfInterest",
		NEW_REGION: "newRegion",

		UPDATE_AREA_OF_INTEREST: "updatedAreaOfInterest",

		REMOVED_AREA_OF_INTEREST: "removedAreaOfInterest",
		REMOVED_REGION: "removedRegion",

		MISSION_UPDATED: "missionUpdated",

		MAP_VISIBILITY_CHANGED: "mapVisibilityChanged",

		/**
		 * Registers a function to listen for an event to be dispatched.
		 * Both parameters must be defined to register.
		 * 
		 * @param {String} event a non-null event
		 * @param {Function} fn a non-null function (prototype: function(data))
		 * @param {Object} scope the scope on which to call the function
		 */
		register: function(event, fn, scope) {
			if (event && fn) {
				var list = registered[event];
				if (!list) {
					list = [];
					registered[event] = list;
				}
				list.push({ fn: fn, scope: scope });
			}
		}, // register

		/**
		 * Unregisters a function to listen for an event to be dispatched.
		 * Both parameters must be defined to unregister.
		 * 
		 * @param {String} event a non-null event
		 * @param {Function} fn a non-null function
		 */
		unregister: function(event, fn) {
			if (event && fn) {
				var list = registered[event];
				if (list) {
					var index = list.indexOf(fn);
					if (index >= 0) {
						list.splice(index, 1);
					}
					if (list.length == 0) {
						delete registered[event];
					}
				}
			}
		}, // unregister

		/**
		 * Sends the data to all functions that have been registered for an event.
		 * The event is not dispatched if the event param is not defined.
		 * 
		 * @param {String} event the event to dispatch
		 * @param {Object} data the data, optional
		 */
		send: function(event, data) {
			if (event) {
				console.log("sending out EVENT", event, data);

				var list = registered[event];
				if (list) {
					list.forEach(function(d) {
						if (d.scope) {
							d.fn.apply(d.scope, [data]); // could use d.fn.call(d.scope, data);
						} else {
							d.fn(data);
						}
					})
				}
			}
		} // send


	}


})();