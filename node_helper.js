/* ---------------------------------------------------------------------
 * Magic Mirror
 * Module: MMM-CaravanPiFillLevels
 *
 * CaravanPi Module
 * see https://github.com/spitzlbergerj/CaravanPi for more Information 
 *		 about the DIY project 
 *
 * By Josef Spitzlberger	http://spitzlberger.de
 * MIT Licensed.
 */

const NodeHelper = require("node_helper")
var async = require('async');
var exec = require('child_process').exec;

//globale Variable, weil diese ansonsten in fillValueList unbekannt
valueListNHCaravanPiFillLevels = [];

module.exports = NodeHelper.create({
	
	start: function() {
		//console.error('Starting node helper: ' + this.name);
	},
	
	socketNotificationReceived: function(notification, payload) {
		var self = this;
		// console.error('node_helper: ' + notification);
		
		switch(notification) {
			case "CONFIG":
				this.config = payload.config;
				valueListNHCaravanPiFillLevels = payload.valueList;
				// first call
				self.getValues(valueListNHCaravanPiFillLevels);
				// interval call
				setInterval(function() {
					self.getValues(valueListNHCaravanPiFillLevels);
				}, this.config.updateInterval);
				break
		}
	},
	
	getValues: function(valueList) {
		var self = this;
		var cmdPart = "tail -1 " + self.config.valueDir + "/";
		var cmd = "";
		var i = 0;
		
		while (i<valueList.length) {
			cmd = cmdPart + valueList[i]["file"]
			// console.error('node_helper - cmd', cmd);
			exec(cmd,"",this.fillValueList);

			i+=1;
		}

		// console.error('node_helper - getValues - valueList after', valueListNHCaravanPiFillLevels[0], valueListNHCaravanPiFillLevels[1]);
		self.sendSocketNotification('VALUES', valueListNHCaravanPiFillLevels);
	},
	
	fillValueList: function (err, stdout, stderr) {
		var i = 0;
		
		if (err) {
			console.error('node_helper - fillValueList - Fehler:', err, stderr);
			return;
		}
		var resSplit = stdout.split(' ');
		var sensorID = resSplit[0];
		
		// console.error('node_helper - fillValueList ', stdout, sensorID);
		
		while (i<valueListNHCaravanPiFillLevels.length) {
			if (sensorID === valueListNHCaravanPiFillLevels[i]["file"]) {
				valueListNHCaravanPiFillLevels[i]["datetime"] = resSplit[1].substring(6,8)+"."+resSplit[1].substring(4,6)+"."+resSplit[1].substring(0,4)+" "+resSplit[1].substring(8,10)+":"+resSplit[1].substring(10,12);
				valueListNHCaravanPiFillLevels[i]["fillLevel"] = resSplit[2];
			}
			i+=1;
		}
		return;
	},

})
