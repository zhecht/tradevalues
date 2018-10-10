

String.prototype.format = function () {
	var i = 0, args = arguments;
	return this.replace(/{}/g, function () {
		return typeof args[i] != 'undefined' ? args[i++] : '';
	});
};

function formatArgs(trade_results) {
	var args = "?";
	args += "team_0_len="+trade_results[0]["players"].length;
	args += "&team_1_len="+trade_results[1]["players"].length;
	args += "&evaluate="+evaluate;
	args += "&is_espn="+is_espn;

	for (var i = 0; i < 2; ++i) {
		var players = trade_results[i]["players"];
		for (var p = 0; p < players.length; ++p) {
			args += "&team_"+i+"_player_"+p+"="+players[p];
		}
	}
	return encodeURI(args);
}

function getOffenseIndexes(tables) {
	var indexes = [];
	for (var i = 0; i < tables.length; ++i) {
		try {
			var ths = tables[i].getElementsByTagName("thead")[0].getElementsByTagName("tr")[1].getElementsByTagName("th");
			//var which = ths[1].getElementsByTagName("div")[0].innerHTML;
			if (ths[0].getElementsByTagName("div")[0].innerHTML === "Offense" || ths[1].getElementsByTagName("div")[0].innerHTML === "Offense") {
				indexes.push(i);
			}
		} catch (err) {

		}
	}
	return indexes;
}

function replaceNbsps(str) {
	var re = new RegExp(String.fromCharCode(160), "g");
	return str.replace(re, " ");
}

var is_espn = (window.location.host.indexOf("espn") != -1);

if (is_espn) {
	var tables = [document.getElementsByClassName("playerTableTable")[0], document.getElementsByClassName("playerTableTable")[1]];
	var trade_results = [ {"players": []}, {"players": []} ];
	for (var i = 0; i < 2; ++i) {
		names = tables[i].getElementsByClassName("playertablePlayerName");
		
		if (i == 0) {
			var inputs = tables[i].getElementsByTagName("input");
		} else {
			var inputs = tables[i].getElementsByTagName("select");
		}
		for (var j = 0; j < names.length; ++j) {
			if (i == 0) {
				var checked = inputs[j].checked;	
			} else {
				var selected = inputs[j].selectedIndex;
				var checked = (inputs[j].getElementsByTagName("option")[selected].innerHTML === "Trade");
			}
			
			var name = names[j].getElementsByTagName("a")[0].innerHTML;
			var span = replaceNbsps(names[j].getElementsByTagName("a")[0].nextSibling.nodeValue).split(", ")[1];
			
			var team = span.split(" ")[0];
			var pos = span.split(" ")[1];

			trade_results[i]["players"].push("{},{},{},{}".format(name,team,pos,checked));
		}
	}
} else {


	var viewtrade = (window.location.pathname.indexOf("viewtrade") !== -1);
	var players_picked = (window.location.search.indexOf("stage=1") === -1) || viewtrade;
	var tradeform = document.getElementById("proposetradeform");
	var evaluate = (document.getElementsByTagName("h1")[0].innerHTML === "Evaluate Trade");

	console.log(viewtrade, players_picked, evaluate);

	var tables;
	if (evaluate) {
		tradeform = document.getElementById("evaluate-players");
		tables = [tradeform.getElementsByTagName("section")[0], tradeform.getElementsByTagName("section")[1]]
	} else {
		var indexes = getOffenseIndexes(document.getElementsByClassName("Table"));
		tables = [document.getElementsByClassName("Table")[indexes[0]], document.getElementsByClassName("Table")[indexes[1]]];
	}

	var trade_results = [ {"players": []}, {"players": []} ];
	for (var i = 0; i < 2; ++i) {
		var names = tables[i].getElementsByClassName("ysf-player-name");
		if (is_espn) {
			names = tables[i].getElementsByClassName("playertablePlayerName");
		}
		//var names = tables[i].getElementsByClassName("fp-player-link");
		if (evaluate) {
			names = tables[i].getElementsByClassName("player-details");
		}
		
		var inputs = tables[i].getElementsByTagName("input");
		var empty_len = 0;
		for (var j = 0; j < names.length; ++j) {
			var checked = false;
			if (names[j].getElementsByTagName("span")[0].innerHTML !== "(Empty)") {
				var span = names[j].getElementsByClassName("Fz-xxs")[0].innerHTML;
				//var span = names[j].getElementsByTagName("span")[0].innerHTML;
				if (evaluate) {
					span = names[j].getElementsByClassName("Fz-xxs")[1].innerHTML;
					//span = names[j].getElementsByTagName("span")[1].innerHTML;
				}

			
				if (!players_picked) {
					checked = inputs[j - empty_len].checked;
				}
				var name = names[j].getElementsByTagName("a")[0].innerHTML;
				var team = span.split(" - ")[0];
				var pos = span.split(" - ")[1];
				trade_results[i]["players"].push("{},{},{},{}".format(name,team,pos,checked));
			} else {
				empty_len++;
			}
		}
	}
}


var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
	if (this.readyState === 4 && this.status === 200) {
		var j = JSON.parse(this.responseText);
		if (is_espn) {
			tradeform_name0 = document.getElementsByClassName("playerTableBgRowHead")[0].getElementsByTagName("th")[0].innerHTML;
			tradeform_name1 = document.getElementsByClassName("playerTableBgRowHead")[1].getElementsByTagName("th")[0].innerHTML;
			evaluate = false;
			players_picked = false;
		} else {
			if (evaluate) {
				tradeform_name0 = document.getElementById("evaluate-players").getElementsByTagName("h3")[0].getElementsByTagName("a")[0].innerHTML;
				tradeform_name1 = document.getElementById("evaluate-players").getElementsByTagName("h3")[1].getElementsByTagName("a")[0].innerHTML;
			} else if (viewtrade) {
				tradeform_name0 = document.getElementById("viewtradeactions").getElementsByTagName("h2")[0].innerHTML;
				tradeform_name1 = document.getElementById("viewtradeactions").getElementsByTagName("h2")[1].innerHTML;
			} else {
				tradeform_name0 = document.getElementById("proposetradeform").getElementsByTagName("h2")[0].innerHTML;
				tradeform_name1 = document.getElementById("proposetradeform").getElementsByTagName("h2")[1].innerHTML;
			}
		}
		chrome.storage.local.set({
			team0_name: tradeform_name0,
			team1_name: tradeform_name1,
			team0: j["team0"],
			team1: j["team1"],
			players_picked: players_picked,
			evaluate: evaluate,
			is_espn: is_espn
		}, function() {

		});
	}
};
var args = formatArgs(trade_results);
xhttp.open("GET", "http://localhost:3000/extension"+args);
//xhttp.open("GET", "https://zhecht.pythonanywhere.com/extension"+args);
xhttp.send();


