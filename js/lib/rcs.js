'use strict';

var rcs = (function () {

	return {

		/**
		 * Return first index in array for object in field with property
		 * Returns -1 if no object in array with that property
		 * 
		 * @param {Array} array 
		 * @param {String} field 
		 * @param {Object} value 
		 */
		findIndexByValue: function (array, field, value) {
			console.log("array", array)
			console.log("field", field)
			console.log("value", value)
			for (var i = 0; i < array.length; i++) {
				if (array[i][field] == value) {
					return i;
				}
			}

			return -1;
		},

		/**
		 * Sets selector to disabled 
		 * 
		 * True: disabled
		 * 
		 * False: enabled
		 * 
		 * @param {String} selector 
		 * @param {Boolean} value 
		 */
		disable: function(selector, value) {
			$(selector).prop('disabled', value);
		},




	}

})();






// function getRandomInt(min, max) {
// 	min = Math.ceil(min);
// 	max = Math.floor(max);
// 	return Math.round(Math.random() * (max - min)) + min;
// }

// function getRandom(min, max) {
// 	return (Math.random() * (max - min)) + min;
// }

// function getRandomDate(start, end) {
// 	var date = new Date(start.getTime() + (Math.random() * (end.getTime() - start.getTime())));
// 	//var hour = Math.random() * 23 | 0;
// 	//date.setHours(hour);
// 	return date;
// }

// function isNumber(data) {
// 	if (!isNaN(parseFloat(data)) && isFinite(data)) {
// 		return true;
// 	}
// 	return false;
// }

// function findIndexByValue(array, field, value) {
// 	for (var i = 0; i < array.length; i++) {
// 		if (array[i][field] == value) {
// 			return i;
// 		}
// 	}

// 	return null;
// }

// function findIndexByValues(array, field1, value1, field2, value2) {
// 	for (var i = 0; i < array.length; i++) {
// 		if ((array[i][field1] == value1) && (array[i][field2] == value2)) {
// 			return i;
// 		}
// 	}

// 	return null;
// }

// // requires d3
// /**
//  * Populates a <select> element with the data.
//  *
//  * @param {Object} id
//  * @param {Object} data
//  * @param {Object} field the field to use as the value and text, data is used if field is not defined
//  */
// function populateSelect(id, data, field, defaultText) {
// 	//console.log("populateSelect", id, data, field);

// 	if (!data) {
// 		return; // can't populate the field with nothing
// 	}
// 	// TODO add default selection or no selection
// 	var dataId = 0;

// 	$(id).html("");

// 	var select = d3.select(id);
// 	//            .on("change", yearSelected);

// 	function get(d, i) {
// 		if (field) {
// 			return d[field];
// 		}
// 		return d;
// 	}

// 	var options = select.selectAll("option")
// 		.remove()
// 		.data(data
// 			/*, function(d) {

// 			            return d.id ? d.id : d.id = ++dataId;
// 			        }*/
// 		);

// 	options.enter().append("option")
// 		.attr("value", get)
// 		.attr("index", function (d, i) {
// 			return i;
// 		})
// 		.attr("id", function (d, i) {
// 			return d.id;
// 		})
// 		.text(get);

// 	if (defaultText) {

// 		select.append('option')
// 			.attr("selected", "selected")
// 			.attr("disabled", 'disabled')
// 			.text(defaultText);

// 	}

// 	options.exit()
// 		//            .transition()
// 		.remove();

// 	$(id).val("");
// }

// function populateSelectIndex(id, data, field) {
// 	//console.log("populateSelect", id, data, field);

// 	if (!data) {
// 		return; // can't populate the field with nothing
// 	}
// 	// TODO add default selection or no selection
// 	var dataId = 0;

// 	$(id).html("");

// 	var select = d3.select(id);
// 	//            .on("change", yearSelected);

// 	function get(d, i) {
// 		if (field) {
// 			return d[field];
// 		}
// 		return d;
// 	}

// 	var options = select.selectAll("option")
// 		.remove()
// 		.data(data
// 			/*, function(d) {

// 			            return d.id ? d.id : d.id = ++dataId;
// 			        }*/
// 		);

// 	options.enter().append("option")
// 		.attr("value", function (d, i) {
// 			return i;
// 		})
// 		.attr("index", function (d, i) {
// 			return i;
// 		})
// 		.attr("id", function (d, i) {
// 			return d.id;
// 		})
// 		.text(get);

// 	options.exit()
// 		//            .transition()
// 		.remove();

// 	$(id).val("");
// }

// function toHours(minutes) {
// 	return minutes / 60.0;
// }

/**
 * Used to create the Twitter tooltip. Usage after the element is created:
 * $(<selector>.tooltip(<config>);
 * Sample configs:
 *
 *	var top = {
 *		'container': 'body',
 *		'placement': 'top',
 *		'trigger': 'hover'
 *	};
 *	var right = {
 *		'container': 'body',
 *		'placement': 'right',
 *		'trigger': 'hover'
 *	};
 *	var left = {
 *		'container': 'body',
 *		'placement': 'left',
 *		'trigger': 'hover'
 *	};
 *	var bottom = {
 *		'container': 'body',
 *		'placement': 'bottom',
 *		'trigger': 'hover'
 *	};)
 */
var tooltip = new function () {

	this.TOP = {
			'container': 'body',
			'placement': 'top',
			'trigger': 'hover',
			'html': 'true'
		},
		this.LEFT = {
			'container': 'body',
			'placement': 'left',
			'trigger': 'hover',
			'html': 'true'
		},
		this.BOTTOM = {
			'container': 'body',
			'placement': 'bottom',
			'trigger': 'hover',
			'html': 'true'
		},
		this.RIGHT = {
			'container': 'body',
			'placement': 'right',
			'trigger': 'hover',
			'html': 'true'
		};

	function show(eventObject) {
		$(this).tooltip('show');
	}

	function hide(eventObject) {
		$('.twipsy').each(function () {
			var tt = $(this);
			if (tt.hasClass('in')) {
				tt.remove();
			}
		});
		$(this).tooltip('hide');
	}

	this.show = show;
	this.hide = hide;
	this.handlers = {
		'mouseover': show,
		'mouseout': hide
	};

	return this;
};



// var DateDiff = {

// 	inHours: function (d1, d2) {
// 		var t2 = d2.getTime();
// 		var t1 = d1.getTime();

// 		return parseInt((t2 - t1) / (3600 * 1000));
// 	},

// 	inDays: function (d1, d2) {
// 		var t2 = d2.getTime();
// 		var t1 = d1.getTime();

// 		return parseInt((t2 - t1) / (24 * 3600 * 1000));
// 	},

// 	inWeeks: function (d1, d2) {
// 		var t2 = d2.getTime();
// 		var t1 = d1.getTime();

// 		return parseInt((t2 - t1) / (24 * 3600 * 1000 * 7));
// 	},

// 	inMonths: function (d1, d2) {
// 		var d1Y = d1.getFullYear();
// 		var d2Y = d2.getFullYear();
// 		var d1M = d1.getMonth();
// 		var d2M = d2.getMonth();

// 		return (d2M + 12 * d2Y) - (d1M + 12 * d1Y);
// 	},

// 	inYears: function (d1, d2) {
// 		return d2.getFullYear() - d1.getFullYear();
// 	}
// }

// function findIndexByValue(array, field, value) {
// 	for (var i = 0; i < array.length; i++) {
// 		if (array[i][field] == value) {
// 			return i;
// 		}
// 	}

// 	return null;
// }

// function capitalize(string) {
// 	return string.charAt(0).toUpperCase() + string.slice(1);
// }