

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
	args += "&is_nfl="+is_nfl;

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
var is_nfl = window.location.host == "fantasy.nfl.com";
var path = window.location.pathname.split("/").pop();
var trade_results = [ {"players": []}, {"players": []} ];
var players_picked = false, evaluate = false, viewtrade = false, is_nfl = false;

if (is_espn) {
	var tables = [document.getElementsByClassName("playerTableTable")[0], document.getElementsByClassName("playerTableTable")[1]];
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
			var nodeValue = replaceNbsps(names[j].getElementsByTagName("a")[0].nextSibling.nodeValue).replace("/", "-");
			
			//var team = span.split(" ")[0];
			var team = "";
			if (nodeValue.indexOf(",") == -1) {
				// Defense
				var pos = nodeValue;
			} else {
				var span = nodeValue.split(", ")[1];
				var pos = span.split(" ")[1];
			}

			trade_results[i]["players"].push("{},{},{},{}".format(name,team,pos,checked));
		}
	}
} else if (is_nfl) {

	if (path == "tradeproposereview") {
		var tables = document.getElementsByClassName("tableWrap");
		var team_idx = 0;
		for (var i = 0; i < tables.length; ++i) {
			if (tables[i].getElementsByTagName("h4").length > 0 && tables[i].getElementsByTagName("h4")[0].innerText.indexOf("Your Team") > -1) {
				team_idx = 1;
			}
			var names = tables[i].getElementsByClassName("playerNameAndInfo");
			for (var j = 0; j < names.length; ++j) {
				if (names[j].nodeName == "TD") {
					var full = names[j].getElementsByTagName("a")[0].innerHTML;
					var pos_team = names[j].getElementsByTagName("em")[0].innerHTML;
					var pos = pos_team.split(" - ")[0];
					var team = pos_team.split(" - ")[1];
					var checked = false;

					trade_results[team_idx]["players"].push("{},{},{},{}".format(full,team,pos,checked));
				}
			}
		}
	} else {
		var in_display = [];
		var rows = document.getElementsByClassName("displayTables")[0].getElementsByTagName("tr");
		for (var i = 0; i < rows.length; ++i) {
			if (rows[i].className.indexOf("player-") > -1 && rows[i].className.indexOf("show") > -1) {
				in_display.push(rows[i].getElementsByClassName("playerNameAndInfo")[0].getElementsByTagName("a")[0].innerHTML);
			}
		}
		var tables = [document.getElementsByClassName("actionTables")[0], document.getElementsByClassName("otherRoster")[0]];
		for (var i = 0; i < 2; ++i) {
			var names = tables[i].getElementsByClassName("playerNameAndInfo");
			var inputs = tables[i].getElementsByTagName("input");
			var k = 0;
			for (var j = 0; j < names.length; ++j) {
				if (names[j].nodeName == "TD") {
					var full = names[j].getElementsByTagName("a")[0].innerHTML;
					var pos_team = names[j].getElementsByTagName("em")[0].innerHTML;
					var pos = pos_team.split(" - ")[0];
					var team = pos_team.split(" - ")[1];
					var checked = false;
					
					if (in_display.indexOf(full) > -1) {
						checked = true;
					} else if (i == 0) {
						checked = inputs[k].checked;
					}
					k++;
					trade_results[i]["players"].push("{},{},{},{}".format(full,team,pos,checked));
				}
			}
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

	for (var i = 0; i < 2; ++i) {
		var names = tables[i].getElementsByClassName("ysf-player-name");
		if (is_espn) {
			names = tables[i].getElementsByClassName("playertablePlayerName");
		}
		if (evaluate) {
			names = tables[i].getElementsByClassName("player-details");
		}
		
		var inputs = tables[i].getElementsByTagName("input");
		var empty_len = 0;
		for (var j = 0; j < names.length; ++j) {
			var checked = false;
			if (names[j].getElementsByTagName("span")[0].innerHTML !== "(Empty)") {
				var span = names[j].getElementsByClassName("Fz-xxs")[0].innerHTML;
				if (evaluate) {
					span = names[j].getElementsByClassName("Fz-xxs")[1].innerHTML;
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

var team_name0, team_name1;
if (is_espn) {
	team_name0 = document.getElementsByClassName("playerTableBgRowHead")[0].getElementsByTagName("th")[0].innerHTML;
	team_name1 = document.getElementsByClassName("playerTableBgRowHead")[1].getElementsByTagName("th")[0].innerHTML;
	evaluate = false;
	players_picked = false;
} else if (is_nfl) {
	evaluate = false;
	players_picked = false;
	if (path == "tradeproposereview") {
		team_name0 = document.getElementsByClassName("tableWrap")[0].getElementsByTagName("h4")[0].innerText.split("Trade For from ")[1];
		players_picked = true;
		team_name1 = "My Team";
	} else if (path == "tradeproposeselecttraderplayers") {
		team_name0 = "My Team";
		team_name1 = document.getElementsByClassName("otherRoster")[0].getElementsByTagName("h4")[0].innerHTML.split(" Roster")[0];
	} else {
		team_name0 = document.getElementsByClassName("actionTables")[0].getElementsByTagName("h4")[0].innerHTML.split(" Player Roster")[0];
		team_name1 = "My Team";
	}
} else {
	if (evaluate) {
		team_name0 = document.getElementById("evaluate-players").getElementsByTagName("h3")[0].getElementsByTagName("a")[0].innerHTML;
		team_name1 = document.getElementById("evaluate-players").getElementsByTagName("h3")[1].getElementsByTagName("a")[0].innerHTML;
	} else if (viewtrade) {
		team_name0 = document.getElementById("viewtradeactions").getElementsByTagName("h2")[0].innerHTML;
		team_name1 = document.getElementById("viewtradeactions").getElementsByTagName("h2")[1].innerHTML;
	} else {
		team_name0 = document.getElementById("proposetradeform").getElementsByTagName("h2")[0].innerHTML;
		team_name1 = document.getElementById("proposetradeform").getElementsByTagName("h2")[1].innerHTML;
	}
}

var args = formatArgs(trade_results);
chrome.storage.local.set({
	args: args,
	team_name0: team_name0,
	team_name1: team_name1,
	evaluate: evaluate,
	viewtrade: viewtrade,
	players_picked: players_picked,
	is_espn: is_espn,
	is_nfl:  is_nfl
}, function() {});
//xhttp.open("GET", "http://localhost:3000/extension"+args);
//xhttp.open("GET", "https://zhecht.pythonanywhere.com/extension"+args);
//xhttp.send();


