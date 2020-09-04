

String.prototype.format = function () {
	var i = 0, args = arguments;
	return this.replace(/{}/g, function () {
		return typeof args[i] != 'undefined' ? args[i++] : '';
	});
};

function getName(result) {
	if (!result)
		return "";
	var split_data = result.split(",");
	return split_data[0];
}

function getVal(result) {
	if (!result)
		return "";
	var split_data = result.split(",");
	return parseFloat(split_data[1]);
}

function init_players_picked_per_team(results) {
	if (results["is_espn"] && results.teams.team1.length == 0) {
		players_picked_per_team[1] += 1;
	} else if (results["is_sleeper"]) {
		for (var i = 0; i < global_total_teams; ++i) {
			if (results.teams["team{}".format(i)].length == 0) {
				players_picked_per_team[i] += 1;
			}
		}
	}
}

function fillTable(results) {
	var player_len = 0;
	var all_tot = [];

	init_players_picked_per_team(results);
	document.getElementById("total_teams").value = results["total_teams"];
	for (var i = 0; i < results["total_teams"]; ++i) {
		document.getElementsByClassName("name")[i].innerText = results["team_names"][i];
		if (results["teams"]["team{}".format(i)].length > player_len) {
			player_len = results["teams"]["team{}".format(i)].length;
		}
		all_tot.push(0);
	}
	for (var p = 0; p < player_len; ++p) {
		var all_names = [], all_vals = [], all_displays = [], all_classes = [];
		for (var t = 0; t < results["total_teams"]; ++t) {
			all_classes.push("player_td");

			if (p < results["teams"]["team{}".format(t)].length) {
				var sp = results["teams"]["team{}".format(t)][p].split(",");
				all_names.push(sp[0]);
				all_vals.push(sp[1]);
				all_displays.push(parseFloat(sp[1].split("_")[1]));

				if (players_picked) {
					all_tot[t] += all_displays[t];
				} else if (sp[2] === "true") {
					all_tot[t] += all_displays[t];
					all_classes[t] += " clicked";
					players_picked_per_team[t] += 1;
				}
			} else {
				all_names.push("");
				all_vals.push("");
				all_displays.push("");
			}
		}

		var tr = document.createElement("tr"); tr.className = "player_row";
		for (var i = 0; i < results["total_teams"]; ++i) {
			var td = document.createElement("td");
			td.className = all_classes[i];
			td.id = "{}_{}".format(i, all_vals[i]);
			var div = document.createElement("div");
			var name_span = document.createElement("span");
			name_span.innerText = all_names[i];
			var val_span = document.createElement("span");
			val_span.style["padding-right"] = "5px";
			val_span.innerText = all_displays[i];
			div.appendChild(name_span);
			div.appendChild(val_span);
			td.appendChild(div);
			tr.appendChild(td);
		}
		document.getElementById("table").appendChild(tr);
	}
	
	// black bar
	var tr = document.createElement("tr");
	var td = document.createElement("td");
	td.colSpan = results["is_sleeper"] ? results["total_teams"].toString() : "2";
	td.style = "background-color: black; opacity: .4;";
	tr.appendChild(td);
	document.getElementById("table").appendChild(tr);

	// total display
	var tr = document.createElement("tr");
	tr.id = "totals_row";
	for (var i = 0; i < results["total_teams"]; ++i) {
		var td = document.createElement("td");
		td.id = "total{}".format(i);
		td.innerText = all_tot[i];
		tr.appendChild(td);
	}

	document.getElementById("table").appendChild(tr);

	findBest();
}

function findBest() {
	var highest_tot = 0;
	var total_teams = parseInt(document.getElementById("total_teams").value);
	for (var i = 0; i < total_teams; ++i) {
		var val = parseFloat(document.getElementById("total{}".format(i)).innerText);
		if (val >= highest_tot) {
			highest_tot = val;
		}
	}
	for (var i = 0; i < total_teams; ++i) {
		var val = parseFloat(document.getElementById("total{}".format(i)).innerText);
		if (val == highest_tot) {
			document.getElementById("total{}".format(i)).className = "best";
		} else {
			document.getElementById("total{}".format(i)).className = "";
		}
	}

	if (!players_picked && everyTeamHasPicked()) {
		document.getElementById("continue").style = "text-align: right; display: block;";
	} else {
		document.getElementById("continue").style = "display: none;";
	}
}

function resetTotal() {
	var total_teams = parseInt(document.getElementById("total_teams").value);
	for (var i = 0; i < total_teams; ++i) {
		document.getElementById("total{}".format(i)).innerText = 0;
	}
}

function resetBtns() {
	var btns = document.getElementsByTagName("button");
	for (var i = 0; i < btns.length; ++i) {
		btns[i].className = "";
	}
}

var changeScoring = function() {
	var scoring_idx = parseInt(this.id);
	document.getElementById("scoring_idx").value = scoring_idx;

	resetBtns();
	this.className = "active";

	var rows = document.getElementsByClassName("player_row");
	var total_teams = parseInt(document.getElementById("total_teams").value);
	var all_tot = [];
	for (var i = 0; i < total_teams; ++i) {
		all_tot.push(0);
	}

	for (var i = 0; i < rows.length; ++i) {
		var tds = rows[i].getElementsByTagName("td");
		for (var t = 0; t < total_teams; ++t) {
			var sp = tds[t].id.split("_");
			if (sp.length > 2) {
				var val = parseFloat(sp[scoring_idx]);
				tds[t].innerText = "{} - {}".format(val, tds[t].innerText.split(" - ")[1]);
				if (players_picked) {
					all_tot[t] += val;
				} else {
					if ((" " + tds[t].className + " ").indexOf(" clicked ") > -1) {
						all_tot[t] += val;
					}
				}
			}
		}
	}

	for (var i = 0; i < total_teams; ++i) {
		document.getElementById("total{}".format(i)).innerText = all_tot[i];
	}
	
	findBest();
}

function onResponseGot() {

}

function everyTeamHasPicked() {
	var b = true;
	for (var i = 0; i < global_total_teams; ++i) {
		if (players_picked_per_team[i] == 0) {
			b = false
		}
	}
	return b;
}

var increment = function() {
	var team = parseInt(this.id.split("_")[0]);
	var scoring_idx = parseFloat(document.getElementById("scoring_idx").value);
	var val = parseFloat(this.id.split("_")[scoring_idx]);
	var total = document.getElementById("total"+team);
	var should_click = true;

	var tot_clicked = document.getElementsByClassName("clicked").length;
	if (tot_clicked == 0) {
		resetTotal();
	}

	if ( (" " + this.className + " ").indexOf(" clicked ") > -1 )  {
		// uncheck ad decrement from total
		should_click = false;
		this.className = this.className.split(" ")[0];
		total.innerText = parseFloat(total.innerText) - val;
		players_picked_per_team[team]--;
	} else {
		this.className += " clicked";
		total.innerText = parseFloat(total.innerText) + val;
		players_picked_per_team[team]++;
	}
	if (total.innerText === NaN) {
		total.innerText = 0;
	}
	findBest();

	if (!players_picked && !evaluate) {
		chrome.storage.local.set({
			clicked_team: team,
			clicked_name: this.getElementsByTagName("span")[0].innerText,
			should_click: should_click
		}, function() {});
		chrome.tabs.executeScript(null, {file: "response.js"}, onResponseGot);
	}
}

function last_updated(date_str) {
	const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var week = date_str.split(",")[0];
	var date = new Date(date_str.split(",")[1]);
	var link = date_str.split(",")[2];
	var a = document.getElementById("updated").getElementsByTagName("span")[0].getElementsByTagName("a")[0];
	a.innerText = "Last Updated: Week {} ({} {})".format(week, monthNames[date.getMonth()], date.getDate() + 1);
	a.href = link;
	a.addEventListener("click", function (){ 
		chrome.tabs.create({url: this.href});
		return false;
	});
}

function setup_html(num_teams) {
	for (var i = 0 ; i < num_teams; ++i) {
		var th = document.createElement("th");
		th.className = "name";
		document.getElementById("header_row").appendChild(th);
		players_picked_per_team.push(0);
	}
	document.getElementById("black_bar").colSpan = num_teams.toString();
}

function callback(results) {
	// null to get all keys
	chrome.storage.local.get(null, function(res) {
		players_picked = res["players_picked"];
		global_total_teams = res["team_names"].length;
		if (global_total_teams == 0) {
			return;
		}
		setup_html(global_total_teams);

		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState === 4 && this.status === 200) {
				var j = JSON.parse(this.responseText);
				last_updated(j["updated"]);
				fillTable({...j, ...res});
				var tds = document.getElementsByClassName("player_td");
				for (var i = 0; i < tds.length; ++i) {
					if (tds[i].innerText.trim() != "-") {
						tds[i].addEventListener("click", increment, false);
					}
				}
				if (global_total_teams == 3) {
					document.getElementsByTagName("table")[0].style = "width: 550px;";
					var div = document.getElementsByTagName("div");
					for (var i = 0; i < div.length; ++i) {
						div[i].style = "width: 550px;";
					}
				}
			}
		};
		xhttp.open("GET", "https://zhecht.pythonanywhere.com/extension"+res["args"]);
		xhttp.send();
	});
}

function onContinueGot() {
	window.close();
}

function continueTrade() {
	chrome.tabs.executeScript(null, {file: "continue_trade.js"}, onContinueGot);
}

// init globals
var is_espn = false, is_nfl = false, is_yahoo = false, is_sleeper = false, is_cbs = false;
var players_picked = false, evaluate = false, viewtrade = false;
var players_picked_per_team = [];
var global_total_teams = 0;
chrome.tabs.executeScript(null, {file: "content_script.js"}, callback);

var btns = document.getElementsByTagName("button");
for (var i = 0; i < btns.length; ++i) {
	btns[i].addEventListener("click", changeScoring, false);
}

var continue_link = document.getElementById("continue").getElementsByTagName("a")[0].addEventListener("click", continueTrade, false);