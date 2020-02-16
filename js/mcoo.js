'use strict';

var MCOOArea;

var mcoo = {};

mcoo.defaults = {
	unitTypes: [{
			value: 'all',
			name: 'All',
		}, {
			value: 'infantry',
			name: 'Infantry/Rifle',
		},
		{
			value: 'cavalry',
			name: 'Recon/Cavalry',
		},
		{
			value: 'artillery',
			name: 'Fires/Artillery',
		},
		{
			value: 'armor',
			name: 'Armor/Tank',
		},
		{
			value: 'combined',
			name: 'Combined Arms',
		},
		{
			value: 'special',
			name: 'Special Forces',
		}
	],


	areaOfInterestId: 1,
	regionId: 1,
	areasOfInterest: [],

	RESTRICTED: 'restricted',
	SEVERELY_RESTRICTED: 'severelyRestricted',
	VISIBILITY: 'visibility',

	wkid: 4326
}


$(document).ready(function () {

	// load this first to get all things
	mcoo.controller.init();

	mcoo.map.init();
	mcoo.areaControls.init();
	console.log("init model")
	

	$("#export").on('click', function () {
		console.log("EXPORT!")

		// var stringifiedAreas = JSON.stringify({areasOfInterest: mcoo.model.areasOfInterest}, null, '\t');
		var mcooAreas = JSON.stringify({areasOfInterest: mcoo.model.areasOfInterest, areaOfInterestId: mcoo.model.areaOfInterestId, regionId: mcoo.model.regionId});
		// var stringifiedAreas = {
			// 	areaOfInterestId: mcoo.model.areaOfInterestId,
			// 	regionId: mcoo.model.regionId,
			// 	areasOfInterest: mcoo.model.areasOfInterest
			// };

		// var acoveAreas = JSON.stringify({areasOfInterest: mcoo.model.areasOfInterest});

		// for now only take the first one.  ACoVE only supports one area of interest
		mcoo.model.areasOfInterest[0].id = 1;
		var acoveAreas = JSON.stringify({areasOfInterest: [mcoo.model.areasOfInterest[0]]});
			
		// var stringifiedAreasSource = stringifiedAreas.toSource() // this only works on firefox

		var acoveText = "var MCOOArea = JSON.parse('" + acoveAreas + "')";
		var mcooText = "var MCOOArea = JSON.parse('" + mcooAreas + "')";
		// jsText =  "acove.defaults.demo.areasOfInterest = areas"

		console.log(acoveText);
		console.log(mcooText);



		var acoveElement = document.createElement('a');
		acoveElement.setAttribute('href', 'data:text/js;charset=utf-8,' + encodeURIComponent(acoveText));
		acoveElement.setAttribute('download', "areas-of-interest.js");

		// make sure element is hidden and append 
		acoveElement.style.display = 'none';
		document.body.appendChild(acoveElement);

		// click the element to prompt download
		acoveElement.click();

		// remove it 
		document.body.removeChild(acoveElement);

		var mcooElement = document.createElement('a');
		mcooElement.setAttribute('href', 'data:text/js;charset=utf-8,' + encodeURIComponent(mcooText));
		mcooElement.setAttribute('download', "mcoo-areas-of-interest.js");

		// make sure element is hidden and append
		mcooElement.style.display = 'none';
		document.body.appendChild(mcooElement);

		// click the element to prompt download
		mcooElement.click();

		// remove it 
		document.body.removeChild(mcooElement);
	})


});