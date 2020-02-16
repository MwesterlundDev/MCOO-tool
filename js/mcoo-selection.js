'use strict'

mcoo.selection = (function () {

	console.log("load mcoo.events");
	// private


	// public
	return {

		AREA_OF_INTEREST: "areaOfInterest",
		areaOfInterest: null,

		select: function (type, value) {
			var self = this;

			console.log("select ", type, value)

			switch (type) {
				case self.AREA_OF_INTEREST:

					// check to see if exists
					var area = (value) ? mcoo.model.getAreaOfInterest(value.id) : null;

					// check to see if there is a area selected
					if (area && self.areaOfInterest) {

						var id = area.id
						if (self.areaOfInterest.id != id) {
							// console.log("select threat--- ", d)
							// set selected area to new area
							self.areaOfInterest = area;
						} else {

							// deselect area because Id is the same
							id = null;
							self.areaOfInterest = null;
						}
					} else {
						// console.log("select threat--- ", d)
						// set area
						if (area && area.id) {
							id = area.id;
						} else {
							id = null;
							area = null;
						}
						self.areaOfInterest = area;
					}

					mcoo.events.send(mcoo.events.AREA_OF_INTEREST_SELECTED, {id: id});
					break;
				default: 
					console.log(type + " is not able to be selected")

			}

		}



	}


})();