/* ---------------------------------------------------------------------
 * Magic Mirror
 * Module: MMM-CaravanPiFillLevels
 *
 * CaravanPi Module
 * see https://github.com/spitzlbergerj/CaravanPi for more Information 
 *     about the DIY project 
 *
 * By Josef Spitzlberger http://spitzlberger.de
 * MIT Licensed.
 */

Module.register("MMM-CaravanPiFillLevels",{

defaults:{
	valueDir: "/home/pi/CaravanPi/values",
	updateInterval: 60000, // milliseconds
	fillLevelUnit: " Liter",
	fillLevelPrecision: 0,
	showDate: true,
	tanks: [
		{
			name: "Frischwasser",
			file: "tank1",
			nr: 1,
		},
	],
	localeStr: 'de-DE',
	style: "boxlines",
},

valueList:[],

start: function (){
	Log.log('Starting module: ' + this.name);
	
	this.valueList = new Array();
	var i = 0;
	// Log.log('tanks: ', this.config.tanks.length, this.config.tanks);
	while(i<this.config.tanks.length){
		this.valueList[i] = new Object();
		this.valueList[i]["name"] = this.config.tanks[i]["name"];
		this.valueList[i]["file"] = this.config.tanks[i]["file"];
		this.valueList[i]["nr"] = this.config.tanks[i]["nr"];
		this.valueList[i]["datetime"] = this.translate('LOADING');
		this.valueList[i]["fillLevel"] = "0";
		this.valueList[i]["level"] = "0";
		i+=1;
	}
	Log.log('valueList: ', this.valueList);
	this.sendSocketNotification(
		'CONFIG',
		{
			config: this.config,
			valueList: this.valueList,
		});
},

// Get translations
getTranslations: function() {
	return {
		en: "translations/en.json",
		de: "translations/de.json"
	}
},

// Get the Module CSS
getStyles: function() {
	return ["MMM-CaravanPiFillLevels.css"];
},


getDom: function(){
	var table = document.createElement("table");
	table.border = 0;
	
	if (this.config.style == "boxes" || this.config.style == "boxlines" ) {
		var boxRow = document.createElement("tr");
		boxRow.className = 'sensorBoxRow';
		boxRow.vAlign = 'top';
	}

	var i = 0;
	while (i<this.config.tanks.length) {
		var fillLevelStr = this.prepareAttribute("fillLevel", this.valueList[i]["fillLevel"], this.config.fillLevelPrecision, this.config.fillLevelUnit);

		var rowSensor = document.createElement("td");
		rowSensor.className = 'sensorName';
		rowSensor.style.borderBottom = '1px dotted #ffffff';
		rowSensor.appendChild(document.createTextNode(this.valueList[i]["name"]));
		
		var rowFillLevel = document.createElement("td");
		rowFillLevel.className = 'sensorfillLevel';
		rowFillLevel.appendChild(document.createTextNode(fillLevelStr));
		
		var rowDate = document.createElement("td");
		rowDate.className = 'sensorDate';
		rowDate.appendChild(document.createTextNode(this.valueList[i]["datetime"]));

		if (this.config.style == "lines") {
			var row = document.createElement("tr");
			row.className = 'sensorContainer';
			row.vAlign = 'top';
			
			rowSensor.width = '120px';
			rowFillLevel.width = '60px';
			rowDate.width = '60px';
			
			// Building of the table row
			row.appendChild(rowSensor);
			row.appendChild(rowFillLevel);
			
			if(this.config.showDate === true) {
				row.appendChild(rowDate);
			}
			
			table.appendChild(row);
		}
		else if (this.config.style == "boxes" || this.config.style == "boxlines" ) {
			var boxRowElement = document.createElement("td");
			boxRowElement.className = 'sensorBoxRowElement';
			
			var tableInner = document.createElement("table");
			tableInner.style.border= '1px solid #ffffff';
	
			var row1 = document.createElement("tr");
			row1.className = 'sensorContainer';
			row1.align = 'center';
			row1.vAlign = 'top';
			
			if (this.config.style == "boxlines" ) 
			{
				rowSensor.colSpan = '2';
			}
			row1.appendChild(rowSensor);
			
			var row2 = document.createElement("tr");
			row2.className = 'sensorContainer';
			row2.align = 'center';
			row2.vAlign = 'top';
			
			if (this.config.style == "boxes" ) 
			{
				row2.appendChild(rowFillLevel);
			
				// Building of the table rows
				tableInner.appendChild(row1);
				tableInner.appendChild(row2);
			}
			else
			{
				rowFillLevel.width = '60px';
				rowDate.width = '60px';
				
				// Building of the table row
				row2.appendChild(rowFillLevel);
				
				// Building the table 
				tableInner.appendChild(row1);
				tableInner.appendChild(row2);
			}	
				
			if(this.config.showDate === true) 
			{
				var row3 = document.createElement("tr");
				row3.className = 'sensorContainer';
				row3.align = 'center';
				row3.vAlign = 'top';
				
				if (this.config.style == "boxlines" ) 
				{
					rowDate.colSpan = '3';
				}
				row3.appendChild(rowDate);
				
				tableInner.appendChild(row3);
			}
			boxRowElement.appendChild(tableInner)
			boxRow.appendChild(boxRowElement);
		}
		i+=1;
	}
	
	if (this.config.style == "boxes" || this.config.style == "boxlines" ) {
		table.appendChild(boxRow);
	}

	var wrapper = document.createElement("div")
	wrapper.className = "MMM-CaravanPiFillLevels";
	
	wrapper.innerHTML = table.outerHTML;
	return wrapper
},

socketNotificationReceived: function(notification, payload){
	Log.log('MMM-CaravanPiFillLevels: socketNotificationReceived ' + notification + payload);
	switch(notification) {
		case "VALUES":
			this.valueList = payload;
			// Log.log('valueList in socketNotificationReceived: ', this.valueList);
			this.updateDom();
			break
	}
},

/**
 * Prepare the output of the given attribute. Reads the attributeName from the
 * settingsArray and do further processing on it, i.e. to display the value with the
 * unit (temperature, valve state) or anything else.
 * Can be used in the future to prepare any other attributes for output.
 */
prepareAttribute: function(attributeName, strValue, precision, unit){
	var preparedAttributeValue = "";
	switch(attributeName){
		case "fillLevel":
			preparedAttributeValue = Number(parseFloat(strValue)).toLocaleString(this.config.localeStr, {minimumFractionDigits: precision, maximumFractionDigits: precision}) + unit;
			break;
	}
	return preparedAttributeValue;
}, 

})
