

String.prototype.format = function () {
	var i = 0, args = arguments;
	return this.replace(/{}/g, function () {
		return typeof args[i] != 'undefined' ? args[i++] : '';
	});
};

function formatArgs(trade_results) {
	var args = "?";
	args += "evaluate="+evaluate;
	args += "&is_espn="+is_espn;
	args += "&is_nfl="+is_nfl;
	args += "&is_yahoo="+is_yahoo;
	args += "&is_sleeper="+is_sleeper;
	args += "&is_cbs="+is_cbs;
	args += "&total_teams="+trade_results.length;

	for (var i = 0; i < trade_results.length; ++i) {
		var players = trade_results[i]["players"];
		args += "&team_{}_len={}".format(i, players.length);
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

var is_espn = false, is_nfl = false, is_yahoo = false, is_sleeper = false, is_cbs = false;
if (window.location.host.indexOf("espn") >= 0) {
	is_espn = true;
} else if (window.location.host == "fantasy.nfl.com") {
	is_nfl = true;
} else if (window.location.host == "football.fantasysports.yahoo.com") {
	is_yahoo = true;
} else if (window.location.host == "sleeper.app") {
	is_sleeper = true;
} else if (window.location.host.indexOf("cbssports.com") >= 0) {
	is_cbs = true;
}
var path = window.location.pathname.split("/").pop();
var trade_results = [ {"players": []}, {"players": []} ];
var players_picked = false, evaluate = false, viewtrade = false;
var team_names = [];
var input_ids = {};

if (is_espn) {
	var step2 = window.location.search.substring(1).indexOf("step=2") !== -1;
	
	if (step2) {
		var tables = document.getElementsByClassName("propose-trade-content")[0].children[1].children;
	} else {
		var tables = document.getElementsByClassName("players-table");
	}
	var idx = 0;
	for (var i = 0; i < tables.length; ++i) {
		//console.log(tables[i].getElementsByTagName("span")[0].innerText, tables[i].getElementsByTagName("span")[0].innerText == "Your Players");
		if (tables[i].getElementsByTagName("span")[0].innerText == "Your Players") {
			idx = 1;
		}

		names = tables[i].getElementsByClassName("player-column_info");
		
		var inputs;
		if (step2 && idx == 1) {
			var inputs = tables[i].getElementsByTagName("button");
		}
		//console.log(names, tables[i], inputs);
		for (var j = 0; j < names.length; ++j) {
			if (!step2) {
				var checked = false;
			} else if (idx == 0 && step2) {
				var checked = true;
			} else {
				var checked = false;
				if ((" " + inputs[j].className + " ").indexOf(" isActive ") > -1 ) {
					checked = true;
				}
			}
			
			var name = names[j].getElementsByTagName("a")[0].innerHTML;
			var team = names[j].getElementsByClassName("playerinfo__playerteam")[0].innerText;
			var pos = names[j].getElementsByClassName("playerinfo__playerpos")[0].innerText;

			trade_results[idx]["players"].push("{},{},{},{}".format(name,team,pos,checked));
			if (!step2 || (step2 && idx == 1)) {
				//console.log(name, i, j);
				input_ids[name.toLowerCase().replace("/", "")] = {
					"table_idx": i,
					"btn_idx": j
				};
			}
		}
	}
} else if (is_nfl) {

	if (path == "tradeproposereview") {
		var tables = document.getElementsByClassName("tableWrap");
		var team_idx = 0;
		for (var i = 0; i < tables.length; ++i) {
			if (tables[i].getElementsByTagName("h4").length > 0 && tables[i].getElementsByTagName("h4")[0].innerText == "Players to Drop") {
				console.log("continuing");
				continue;
			}
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
						input_ids[full.toLowerCase().replace("/", "")] = inputs[k].id;
					}					
					trade_results[i]["players"].push("{},{},{},{}".format(full,team,pos,checked));
					k++;
				}
			}
		}
	}

} else if (is_sleeper) {
	trade_results = [];
	var first_step = document.getElementsByClassName("rosters-container");
	if (first_step.length) {
		var teams = first_step[0].getElementsByClassName("roster-item-container");
		for (var i = 0; i < teams.length; ++i) {
			var teamname = teams[i].getElementsByClassName("name")[0].innerText;
			team_names.push(teamname);
			trade_results.push({"players": []});
			var players = teams[i].getElementsByClassName("team-roster-item");
			for (var j = 0; j < players.length; ++j) {
				if (players[j].innerText.indexOf("Empty") >= 0) { continue; }
				var pos_team = players[j].getElementsByClassName("position")[0].innerText.trim();
				var name = players[j].getElementsByClassName("name-text")[0].innerText;
				var pos = pos_team.split(" - ")[0];
				var team = pos_team.split(" - ")[1];
				trade_results[i]["players"].push("{},{},{},{}".format(name,team,pos,false));
			}
		}
	} else {
		var tables = document.getElementsByClassName("trade-state-sends");
		var names = document.getElementsByClassName("acquire-trade-partner-item");
		var team_idx = {};
		trade_results = [];
		for (var i = 0; i < names.length; ++i) {
			var n = names[i].getElementsByClassName("name")[0].innerText;
			team_names.push(n);
			trade_results.push({"players": []});
			team_idx[n] = i;
		}

		for (var i = 0; i < tables.length; ++i) {
			var players = tables[i].getElementsByClassName("player-name");
			for (var j = 0; j < players.length; ++j) {
				var pos_team = players[j].getElementsByClassName("position")[0].innerText.trim();
				var name = players[j].innerHTML.split("<span")[0];
				var pos = pos_team.split(" - ")[0];
				var team = pos_team.split(" - ")[1];
				trade_results[i]["players"].push("{},{},{},{}".format(name,team,pos,true));
			}
		}

		// now check if receive window is up
		var win = document.getElementsByClassName("set-trade-player-modal");
		if (win.length > 0) {
			// find name of team that's showing
			var name = win[0].getElementsByClassName("trade-roster-item-container selected")[0].getElementsByClassName("name")[0].innerText;
			var rows = win[0].getElementsByClassName("team-roster-item");
			var idx = team_idx[name];
			// clear teams players
			trade_results[idx]["players"] = [];
			for (var i = 0; i < rows.length; ++i) {
				var checked = false;
				if ((" " + rows[i].className + " ").indexOf(" selected ") >= 0) {
					checked = true;
				}
				// skip the selected players
				name = rows[i].getElementsByClassName("name-text")[0].innerText;
				var pos_team = rows[i].getElementsByClassName("position")[0].innerText.trim();
				var pos = pos_team.split(" - ")[0];
				var team = pos_team.split(" - ")[1];
				input_ids[name.toLowerCase()] = i;
				trade_results[idx]["players"].push("{},{},{},{}".format(name,team,pos,checked));
			}
		}
	}
} else if (is_cbs) {
	var rows = document.getElementById("teamTradeJS").getElementsByTagName("tr");

	// skip headers
	for (var i = 2; i < rows.length; ++i) {
		var pre_names = rows[i].getElementsByClassName("playerLink");
		var names = [];

		for (var j = 0; j < pre_names.length; ++j) {
			if (pre_names[j].getAttribute("subtab") == null) {
				names.push(pre_names[j]);
			}
		}
		var pos_teams = rows[i].getElementsByClassName("playerPositionAndTeam");
		var checkboxes = rows[i].getElementsByClassName("playerCheckBox");
		for (var j = 0; j < pos_teams.length; ++j) {
			var name = names[j].innerText;
			var pos_team = pos_teams[j].innerText.split(" | ");
			input_ids[name.toLowerCase()] = checkboxes[j].name;
			trade_results[j]["players"].push("{},{},{},{}".format(name,pos_team[1],pos_team[0],checkboxes[j].checked));
		}
	}

} else if (is_yahoo) {
	var viewtrade = (window.location.pathname.indexOf("viewtrade") !== -1);
	var players_picked = (window.location.search.indexOf("stage=1") === -1) || viewtrade;
	var tradeform = document.getElementById("proposetradeform");
	var evaluate = (document.getElementsByTagName("h1")[0].innerHTML === "Evaluate Trade");
	var curr_team = 0;

	var tables;
	var cutoff = 3;
	if (evaluate) {
		tradeform = document.getElementById("evaluate-players");
		tables = [tradeform.getElementsByTagName("section")[0], tradeform.getElementsByTagName("section")[1]];
		cutoff = 2;
	} else {
		tables = tradeform.children;
	}

	for (var i = 0; i < cutoff; ++i) {
		// check this later but everytime...this is the section for team #2's name
		if (i == 1) {
			curr_team = 1;
			if (!evaluate) {
				continue;	
			}
		}
		var names = tables[i].getElementsByClassName("ysf-player-name");
		if (evaluate) {
			names = tables[i].getElementsByClassName("player-details");
		}
		
		var inputs = [];
		var checkboxes = tables[i].getElementsByTagName("input");
		for (var c = 0; c < checkboxes.length; ++c) {
			if (checkboxes[c].type == "checkbox") {
				inputs.push(checkboxes[c]);
			}
		}

		if (inputs.length == 0) {
			players_picked = true;
		}

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
				trade_results[curr_team]["players"].push("{},{},{},{}".format(name,team,pos,checked));
				if (!players_picked) {
					input_ids[name.toLowerCase()] = inputs[j - empty_len].id;
				}
				
			} else {
				empty_len++;
			}
		}
	}
}

// get team names
var team_name0, team_name1;
if (is_espn) {
	team_name0 = document.getElementsByClassName("mh3")[0].innerText;
	team_name1 = "Your Players";
	evaluate = false;
	players_picked = false;
} else if (is_sleeper) {
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

} else if (is_cbs) {
	team_name0 = document.getElementsByClassName("teamName")[0].innerText;
	team_name1 = document.getElementById("selectTeamToTrade").getElementsByTagName("span")[0].innerText;
	if (team_name1 == "Select Team To Trade With") {
		team_name1 = "";
	}
} else if (is_yahoo) {
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

// multiple possible teams
if (!is_sleeper) {	
	team_names = [team_name0, team_name1];
}

var args = formatArgs(trade_results);
chrome.storage.local.set({
	args: args,
	team_names: team_names,
	evaluate: evaluate,
	viewtrade: viewtrade,
	players_picked: players_picked,
	is_yahoo: is_yahoo,
	is_espn: is_espn,
	is_nfl:  is_nfl,
	is_sleeper: is_sleeper,
	is_cbs: is_cbs,
	input_ids: input_ids
}, function() {});
//xhttp.open("GET", "http://localhost:3000/extension"+args);
//xhttp.open("GET", "https://zhecht.pythonanywhere.com/extension"+args);
//xhttp.send();


