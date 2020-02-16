'use strict'

mcoo.areaControls = (function () {

	console.log("load mcoo.areaControls");
	// private

	var selectionColor = d3.rgb(247, 234, 49);
	var notSelectedColor = d3.rgb(150, 150, 150);
	var textColor = d3.rgb(200, 200, 200);

	var isNewArea = false;
	var newArea = null;

	var isNewRegion = false;
	var newRegion = null;

	/**
	 * Shows new area controls and sets state
	 */
	var showNewAreaControls = function () {

		console.log("add new area");

		isNewArea = true;

		newArea = {
			name: "",
			latitude: [0, 0],
			longitude: [0, 0],
			footprint: [],
		}

		$("#new-area-controls").show();
	}

	/**
	 * hides new area controls and resets new area stuff
	 */
	var hideNewAreaControls = function () {
		console.log("hide new area");

		isNewArea = false;

		newArea = null;

		$("#new-area-name").val('');
		rcs.disable("#new-area-save-button", true);

		$("#new-area-controls").hide();
	}

	/**
	 * Sets footprint drawn on map as the footprint for the new area...
	 * @param {Object} eventData 
	 */
	var setNewAreaFootprint = function (eventData) {
		console.log("setNewAreaFootprint:", eventData)
		newArea.footprint = eventData.footprint;
		// maybe add spatial reference

		checkNewAreaSave();
	}

	/**
	 * enables the new area save button
	 */
	var checkNewAreaSave = function () {
		console.log("checkSave: ", isNewArea , newArea , newArea.name , newArea.footprint.length )
		if (isNewArea && newArea && newArea.name && newArea.footprint && newArea.footprint.length > 3) {
			rcs.disable("#new-area-save-button", false);
		}
	}

	/**
	 * saves new area created to the model
	 */
	var saveNewArea = function () {
		console.log("Save New Area: ", newArea);

		mcoo.model.saveNewArea(newArea);

		hideNewAreaControls();
	}


	/**
	 * Adds new region controls to the selected Area of interest
	 * @param {String} id 
	 */
	var showAddRegionControls = function (id) {

		var area = mcoo.model.getAreaOfInterest(id);

		if (!area) {
			console.log("Area does not exist with that id, returning nothing")
			return
		}

		isNewRegion = true;

		newRegion = {
			name: "",
			footprint: [],
			category: "restricted",
			unitType: "all",
		}

		rcs.disable("#area-list-region-add", true);

		console.log("Add Region to ", area.name)

		var selectedRow = d3.select("#area-list-row-" + id);

		var addRegionControls = selectedRow.append("div")
			.attr("id", "area-list-add-region-controls")
			.classed("area-list-add-region-controls", 1)
			.classed("area-region-container", 1);

		addRegionControls.append("label")
			.classed("option-label", 1)
			.text("Add New Region for " + area.name)

		var addRegionControlsName = addRegionControls.append("div")
			.attr("id", "add-region-controls-name-container")
			.classed("add-region-input-container", 1)

		addRegionControlsName.append("label")
			.classed("description-label", 1)
			.text("Name: ")

		addRegionControlsName.append("input")
			.attr("id", "add-region-input-name")
			.classed("form-input", 1)
			.attr("type", "text")
			.attr("placeholder", "Region Name")
			.on('keyup', function () {
				if (isNewRegion) {
					newRegion.name = $("#add-region-input-name").val()
					checkNewRegionSave();
				}
			})

		var addRegionControlsCategory = addRegionControls.append("div")
			.attr("id", "add-region-controls-category-container")
			.classed("add-region-input-container", 1)

		addRegionControlsCategory.append("label")
			.classed("description-label", 1)
			.text("Category: ")

		addRegionControlsCategory.append("input")
			.attr("id", "add-region-category-restricted")
			.classed("add-region-radio", 1)
			.attr("type", "radio")
			.attr("name", "add-region-category")
			.attr("value", mcoo.defaults.RESTRICTED)
			.property("checked", true)

		addRegionControlsCategory.append("label")
			.classed("description-label", 1)
			.classed("radio-label", 1)
			.text("Restricted")
			.attr("for", "add-region-category-restricted")

		addRegionControlsCategory.append("input")
			.attr("id", "add-region-category-severely-restricted")
			.classed("add-region-radio", 1)
			.attr("type", "radio")
			.attr("name", "add-region-category")
			.attr("value", mcoo.defaults.SEVERELY_RESTRICTED)

		addRegionControlsCategory.append("label")
			.classed("description-label", 1)
			.classed("radio-label", 1)
			.text("Severely Restricted")
			.attr("for", "add-region-category-severely-restricted")

		addRegionControlsCategory.append("input")
			.attr("id", "add-region-category-visibility")
			.classed("add-region-radio", 1)
			.attr("type", "radio")
			.attr("name", "add-region-category")
			.attr("value", mcoo.defaults.VISIBILITY)

		addRegionControlsCategory.append("label")
			.classed("description-label", 1)
			.classed("radio-label", 1)
			.text("Visibility")
			.attr("for", "add-region-category-visibility")

		var addRegionControlsName = addRegionControls.append("div")
			.attr("id", "add-region-controls-unit-type-container")
			.classed("add-region-input-container", 1)

		addRegionControlsName.append("label")
			.classed("description-label", 1)
			.text("Unit Type: ")

		var unitSelect = addRegionControlsName.append("select")
			.attr("id", "add-region-input-unit-type")
			.classed("form-input", 1)

		var unitOptions = unitSelect.selectAll("option")
			.data(mcoo.defaults.unitTypes)
			.enter();

		unitOptions.append("option")
			.attr("id", function (d) {
				return d.value;
			})
			.text(function (d) {
				return d.name;
			});

		var addRegionControlsButtons = addRegionControls.append("div")
			.attr("id", "add-region-controls-buttons-container")
			.classed("add-region-input-container", 1)

		addRegionControlsButtons.append("button")
			.attr("id", "add-region-polygon-button")
			.classed("form-button", 1)
			.text("Point Polygon")
			.on('click', function () {
				mcoo.map.startNewRegionPolygon('POLYGON')
			})

		addRegionControlsButtons.append("button")
			.attr("id", "add-region-freehand-button")
			.classed("form-button", 1)
			.text("Freehand Polygon")
			.on('click', function () {
				mcoo.map.startNewRegionPolygon('FREEHAND')
			})

		addRegionControlsButtons.append("button")
			.attr("id", "add-region-save-button")
			.classed("form-button", 1)
			.text("Save")
			.property("disabled", true)
			.on('click', function () {
				if (isNewRegion) {
					saveNewRegion()
				}
			})

		addRegionControlsButtons.append("button")
			.attr("id", "add-region-cancel-button")
			.classed("form-button", 1)
			.text("Cancel")
			.on('click', function () {
				hideAddRegionControls();
			});
	}

	/**
	 * Hides the region controls and resets the new region states
	 */
	var hideAddRegionControls = function () {
		console.log("hide region add controls");
		d3.select(".area-list-add-region-controls").remove();

		isNewRegion = false;
		newRegion = null;

		rcs.disable("#area-list-region-add", false);

	}


	/**
	 * Sets footprint drawn on map as the footprint for the new area...
	 * @param {Object} eventData 
	 */
	var setNewRegionFootprint = function (eventData) {
		console.log("setNewAreaFootprint:", eventData.footprint)
		newRegion.footprint = eventData.footprint;
		// maybe add spatial reference

		checkNewRegionSave();
	}

	/**
	 * enables the new area save button
	 */
	var checkNewRegionSave = function () {
		// console.log("checkSave: ", isNewArea , newArea , newArea.name , newArea.footprint.length )
		if (isNewRegion && newRegion && newRegion.name && newRegion.footprint && newRegion.footprint.length > 3) {
			rcs.disable("#add-region-save-button", false);
		}
	}

	/**
	 * saves new area created to the model
	 */
	var saveNewRegion = function () {
		console.log("Save New Region: ", newRegion);
		var area = mcoo.selection.areaOfInterest;

		newRegion.name = $("#add-region-input-name").val();
		newRegion.unitType = $("#add-region-input-unit-type").val();
		newRegion.category = $("input[name=add-region-category]:checked").val();

		if (area) {
			mcoo.model.saveNewRegion(newRegion, area.id);
		} else {
			console.log("Not able to save region, no area of interest selected");
		}


		hideAddRegionControls();
	}

	// public
	return {

		init: function () {

			$("#new-area-button").on('click', function () {
				showNewAreaControls();
			})

			$("#new-area-cancel-button").on('click', function () {
				hideNewAreaControls();
			})

			$("#new-area-save-button").on('click', function () {
				saveNewArea();
			})

			$("#new-area-name").val('');

			$("#new-area-name").on('keyup', function () {
				if (isNewArea) {
					newArea.name = $("#new-area-name").val();
					checkNewAreaSave();
				}
			});

			rcs.disable("#new-area-save-button", true);
		},

		update: function () {
			console.log("update areaControls")
			var areas = mcoo.model.areasOfInterest;
			console.log("areas: ", areas)

			var areaListWrapper = d3.select("#area-list");

			var areaList = areaListWrapper.selectAll(".area-list-row")
				.data(areas, function (d) {
					return d.id;
				})

			areaList.exit().remove();

			var areaListEnter = areaList.enter()

			var areaListEnterRow = areaListEnter.append("div")
				.attr("id", function (d) {
					return "area-list-row-" + d.id
				})
				.classed("area-list-row", 1)


			areaListEnterRow.append("label")
				.attr("id", function (d) {
					return "area-list-row-label-" + d.id
				})
				.classed("area-list-row-label", 1)
				.text(function (d) {
					return d.name;
				})
				.on('click', function (d) {
					console.log("select this area: ", d);
					mcoo.selection.select(mcoo.selection.AREA_OF_INTEREST, d);
				})
		},

		areaOfInterestSelected: function (id) {
			console.log("update area")

			var area = mcoo.model.getAreaOfInterest(id);

			var areaList = d3.select("#area-list");

			areaList.selectAll(".area-list-row-label")
				.style("color", notSelectedColor);

			var selectedRow = d3.select("#area-list-row-" + id);

			selectedRow.select("#area-list-row-label-" + id)
				.style("color", selectionColor);

			selectedRow.selectAll(".area-region-container").remove();
			selectedRow.selectAll(".area-list-region-controls").remove();

			// RESTRICTED LAYER STUFF
			var restrictedWrapper = selectedRow.append("div")
				.attr("id", "area-list-restricted-" + id)
				.classed("area-list-restricted", 1)
				.classed("area-region-container", 1);

			// add toggle and wrap both?
			var restrictedHeader = restrictedWrapper.append("div")
				.classed("area-list-region-header", 1)

			restrictedHeader.append("label")
				.classed("description-label", 1)
				.classed("area-list-region-header-label", 1)
				.text("Restricted")

			var restrictedToggle = restrictedHeader.append("div")
				.attr("id", "area-list-restricted-toggle-container")
				.classed("region-toggle-container", 1)

			restrictedToggle.append("label")
				.classed("toggle-label", 1)
				.text("Show")
				.on('click', function() {
					mcoo.controller.mapVisibility.restricted = !mcoo.controller.mapVisibility.restricted;
					mcoo.events.send(mcoo.events.MAP_VISIBILITY_CHANGED, {areaId: area.id})
				})

			restrictedToggle.append("div")
				.attr("id", "area-list-restricted-toggle")
				.classed("region-toggle-on", mcoo.controller.mapVisibility.restricted)
				.classed("region-toggle-off", !mcoo.controller.mapVisibility.restricted)
				.on('click', function() {
					mcoo.controller.mapVisibility.restricted = !mcoo.controller.mapVisibility.restricted;
					mcoo.events.send(mcoo.events.MAP_VISIBILITY_CHANGED, {areaId: area.id})
				})

			restrictedToggle.append("label")
				.classed("toggle-label", 1)
				.text("Hide")
				.on('click', function() {
					mcoo.controller.mapVisibility.restricted = !mcoo.controller.mapVisibility.restricted;
					mcoo.events.send(mcoo.events.MAP_VISIBILITY_CHANGED, {areaId: area.id})
				})

			var restrictedRow = restrictedWrapper.selectAll(".restricted-row")
				.data(area.mcoo.restricted, function (d) {
					return d.id;
				})

			restrictedRow.exit().remove();

			var restrictedRowEnter = restrictedRow.enter()

			var restrictedRowEnterDiv = restrictedRowEnter.append("div")
				.attr("id", function (d) {
					return "restricted-row-" + d.id;
				})
				.classed("area-list-region-row", 1)

			restrictedRowEnterDiv.append("label")
				.attr("id", function (d) {
					return "restricted-row-name-label-" + d.id;
				})
				.classed("area-list-region-name-label", 1)
				.text(function (d) {
					return d.name;
				})

			restrictedRowEnterDiv.append("label")
				.attr("id", function (d) {
					return "restricted-row-unit-label-" + d.id;
				})
				.classed("area-list-region-unit-label", 1)
				.text(function (d) {
					return " -" + d.unitType;
				})

			restrictedRowEnterDiv.append("button")
				.attr("id", function (d) {
					return "restricted-row-delete-button-" + d.id;
				})
				.classed("area-list-region-delete-button", 1)
				.classed("form-button", 1)
				.text("Remove Region")
				.on('click', function (d) {
					mcoo.model.removeRegion(d.id, d.category, area.id);
				})

			// SEVERELY RESTRICTED LAYER STUFF
			var severelyRestrictedWrapper = selectedRow.append("div")
				.attr("id", "area-list-severely-restricted-restricted-" + id)
				.classed("area-list-severely-restricted", 1)
				.classed("area-region-container", 1);

			// add toggle and wrap both?
			var severelyRestrictedHeader = severelyRestrictedWrapper.append("div")
				.classed("area-list-region-header", 1)

			severelyRestrictedHeader.append("label")
				.classed("description-label", 1)
				.classed("area-list-region-header-label", 1)
				.text("Severely Restricted")

			var severelyRestrictedToggle = severelyRestrictedHeader.append("div")
				.attr("id", "area-list-severely-restricted-toggle-container")
				.classed("region-toggle-container", 1)

			severelyRestrictedToggle.append("label")
				.classed("toggle-label", 1)
				.text("Show")
				.on('click', function() {
					mcoo.controller.mapVisibility.severelyRestricted = !mcoo.controller.mapVisibility.severelyRestricted;
					mcoo.events.send(mcoo.events.MAP_VISIBILITY_CHANGED, {areaId: area.id})
				})

			severelyRestrictedToggle.append("div")
				.attr("id", "area-list-severely-restricted-toggle")
				.classed("region-toggle-on", mcoo.controller.mapVisibility.severelyRestricted)
				.classed("region-toggle-off", !mcoo.controller.mapVisibility.severelyRestricted)
				.on('click', function() {
					mcoo.controller.mapVisibility.severelyRestricted = !mcoo.controller.mapVisibility.severelyRestricted;
					mcoo.events.send(mcoo.events.MAP_VISIBILITY_CHANGED, {areaId: area.id})
				})

			severelyRestrictedToggle.append("label")
				.classed("toggle-label", 1)
				.text("Hide")
				.on('click', function() {
					mcoo.controller.mapVisibility.severelyRestricted = !mcoo.controller.mapVisibility.severelyRestricted;
					mcoo.events.send(mcoo.events.MAP_VISIBILITY_CHANGED, {areaId: area.id})
				})

			var severelyRestrictedRow = severelyRestrictedWrapper.selectAll(".severely-restricted-row")
				.data(area.mcoo.severelyRestricted, function (d) {
					return d.id;
				})

			severelyRestrictedRow.exit().remove();

			var severelyRestrictedRowEnter = severelyRestrictedRow.enter()

			var severelyRestrictedRowEnterDiv = severelyRestrictedRowEnter.append("div")
				.attr("id", function (d) {
					return "severely-restricted-row-" + d.id;
				})
				.classed("area-list-region-row", 1)

			severelyRestrictedRowEnterDiv.append("label")
				.attr("id", function (d) {
					return "severely-restricted-row-name-label-" + d.id;
				})
				.classed("area-list-region-name-label", 1)
				.text(function (d) {
					return d.name;
				})

			severelyRestrictedRowEnterDiv.append("label")
				.attr("id", function (d) {
					return "severely-restricted-row-unit-label-" + d.id;
				})
				.classed("area-list-region-unit-label", 1)
				.text(function (d) {
					return " -" + d.unitType;
				})

			severelyRestrictedRowEnterDiv.append("button")
				.attr("id", function (d) {
					return "severely-restricted-row-delete-button-" + d.id;
				})
				.classed("area-list-region-delete-button", 1)
				.classed("form-button", 1)
				.text("Remove Region")
				.on('click', function (d) {
					mcoo.model.removeRegion(d.id, d.category, area.id);
				})

			// Visibility Stuff

			var visibilityWrapper = selectedRow.append("div")
				.attr("id", "area-list-visibility-" + id)
				.classed("area-list-visibility", 1)
				.classed("area-region-container", 1);

			// add toggle and wrap both?
			var visibilityHeader = visibilityWrapper.append("div")
				.classed("area-list-region-header", 1)

			visibilityHeader.append("label")
				.classed("description-label", 1)
				.classed("area-list-region-header-label", 1)
				.text("Visibility")

			var visibilityToggle = visibilityHeader.append("div")
				.attr("id", "area-list-visibility-toggle-container")
				.classed("region-toggle-container", 1)

			visibilityToggle.append("label")
				.classed("toggle-label", 1)
				.text("Show")
				.on('click', function() {
					mcoo.controller.mapVisibility.visibility = !mcoo.controller.mapVisibility.visibility;
					mcoo.events.send(mcoo.events.MAP_VISIBILITY_CHANGED, {areaId: area.id})
				})
				
				console.log("visiblyily: ", mcoo.controller.mapVisibility)

			visibilityToggle.append("div")
				.attr("id", "area-list-visibility-toggle")
				.classed("region-toggle-on", mcoo.controller.mapVisibility.visibility)
				.classed("region-toggle-off", !mcoo.controller.mapVisibility.visibility)
				.on('click', function() {
					mcoo.controller.mapVisibility.visibility = !mcoo.controller.mapVisibility.visibility;
					mcoo.events.send(mcoo.events.MAP_VISIBILITY_CHANGED, {areaId: area.id})
				})

			visibilityToggle.append("label")
				.classed("toggle-label", 1)
				.text("Hide")
				.on('click', function() {
					mcoo.controller.mapVisibility.visibility = !mcoo.controller.mapVisibility.visibility;
					mcoo.events.send(mcoo.events.MAP_VISIBILITY_CHANGED, {areaId: area.id})
				})

			var visibilityRow = visibilityWrapper.selectAll(".visibility-row")
				.data(area.mcoo.visibility, function (d) {
					return d.id;
				})

			visibilityRow.exit().remove();

			var visibilityRowEnter = visibilityRow.enter()

			var visibilityRowEnterDiv = visibilityRowEnter.append("div")
				.attr("id", function (d) {
					return "visibility-row-" + d.id;
				})
				.classed("area-list-region-row", 1)

			visibilityRowEnterDiv.append("label")
				.attr("id", function (d) {
					return "visibility-row-name-label-" + d.id;
				})
				.classed("area-list-region-name-label", 1)
				.text(function (d) {
					return d.name;
				})

			visibilityRowEnterDiv.append("label")
				.attr("id", function (d) {
					return "visibility-row-unit-label-" + d.id;
				})
				.classed("area-list-region-unit-label", 1)
				.text(function (d) {
					return " -" + d.unitType;
				})

			visibilityRowEnterDiv.append("button")
				.attr("id", function (d) {
					return "visibility-row-delete-button-" + d.id;
				})
				.classed("area-list-region-delete-button", 1)
				.classed("form-button", 1)
				.text("Remove Region")
				.on('click', function (d) {
					mcoo.model.removeRegion(d.id, d.category, area.id);
				})

			var regionControls = selectedRow.append("div")
				.attr("id", "area-list-region-controls-" + id)
				.classed("area-list-region-controls", 1);

			regionControls.append("button")
				.attr("id", "area-list-region-add")
				.classed("form-button", 1)
				.text("Add Region")
				.on('click', function () {
					if (!newRegion) {
						showAddRegionControls(id);
					}
				})

			regionControls.append("button")
				.attr("id", "area-list-region-delete")
				.classed("form-button", 1)
				.text("Delete Area of Interest")
				.on('click', function () {
					if (confirm("This will delete Area of interest: " + area.name)) {
						mcoo.model.removeAreaOfInterest(area.id)
					}
				})

			regionControls.append("button")
				.attr("id", "area-list-region-edit")
				.classed("form-button", 1)
				.text("Edit Area of Interest")
		},

		areaOfInterestDeselected: function (id) {

			var areaList = d3.select("#area-list");

			areaList.selectAll(".area-list-row-label")
				.style("color", textColor);

			areaList.selectAll(".area-region-container").remove();
			areaList.selectAll(".area-list-region-controls").remove();

		},

		newAreaOfInterestFootprint: function (eventData) {
			console.log("newAreaOfInterestFootprint: ", isNewArea, eventData)

			if (isNewArea) {
				setNewAreaFootprint(eventData);
			}
		},

		newRegionFootprint: function (eventData) {
			console.log("newAreaOfInterestFootprint: ", isNewRegion, eventData)

			if (isNewRegion) {
				setNewRegionFootprint(eventData);
			}
		},

		updateRegions: function (eventData) {
			var self = this;
			console.log("new region: ", eventData);
			var selectedArea = mcoo.selection.areaOfInterest;

			if (eventData.areaId === selectedArea.id) {
				self.areaOfInterestSelected(eventData.areaId);
			}

		},



	}

})();