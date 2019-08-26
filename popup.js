

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

function fillTable(results) {
	document.getElementsByClassName("name")[0].innerHTML = results["team_name0"];
	document.getElementsByClassName("name")[1].innerHTML = results["team_name1"];

	var player_len = (results["team0"].length >= results["team1"].length) ? results["team0"].length : results["team1"].length;
	var tot0 = 0, tot1 = 0;
	for (var p = 0; p < player_len; ++p) {
		var name0 = "", name1 = "", val0 = "", val1 = "";
		var display_val0 = "", display_val1 = "";
		var class0 = "player_td", class1 = "player_td";
		if (p < results["team0"].length) {
			var sp = results["team0"][p].split(",");
			name0 = sp[0];
			val0 =  sp[1];
			display_val0 = parseFloat(sp[1].split("_")[1]); //get half point

			if (results["players_picked"]) {
				tot0 += display_val0;
			} else if (sp[2] === "true") {
				tot0 += display_val0;
				class0 += " clicked";	
			}
		}
		if (p < results["team1"].length) {
			var sp = results["team1"][p].split(",");
			name1 = sp[0];
			val1 = sp[1];
			display_val1 = parseFloat(sp[1].split("_")[1]);

			if (results["players_picked"]) {
				tot1 += display_val1;
			} else if (sp[2] === "true") {
				tot1 += display_val1;
				class1 += " clicked";	
			}
		}

		document.getElementById("table").innerHTML += "<tr class='player_row'><td class='{}' id='0_{}'>{} - {}</td><td class='{}' id='1_{}'>{} - {}</td></tr>".format(class0, val0, display_val0, name0, class1, val1, display_val1, name1);
	}
	document.getElementById("table").innerHTML += "<tr><td colspan='2' style='background-color: black; opacity: .4;'></td></tr>";
	document.getElementById("table").innerHTML += "<tr><td id='total0'>{}</td><td id='total1'>{}</td></tr>".format(tot0, tot1);
	findBest();
}

function findBest() {
	var tot0 = parseFloat(document.getElementById("total0").innerHTML);
	var tot1 = parseFloat(document.getElementById("total1").innerHTML);
	var class0 = (tot0 >= tot1) ? "best" : "";
	var class1 = (tot1 >= tot0) ? "best" : "";
	document.getElementById("total0").className = class0;
	document.getElementById("total1").className = class1;
}

function resetTotal() {
	document.getElementById("total0").innerHTML = 0;
	document.getElementById("total1").innerHTML = 0;	
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
	var tot0 = 0, tot1 = 0;
	for (var i = 0; i < rows.length; ++i) {
		var tds = rows[i].getElementsByTagName("td");
		var sp0 = tds[0].id.split("_");
		var sp1 = tds[1].id.split("_");
		var val0 = 0, val1 = 0;

		if (sp0.length > 2) {
			var val0 = parseFloat(sp0[scoring_idx]);
			tds[0].innerHTML = val0 + " - " + tds[0].innerHTML.split(" - ")[1];
			if (players_picked) {
				tot0 += val0;
			} else {
				if ((" " + tds[0].className + " ").indexOf(" clicked ") > -1 ) {
					tot0 += val0;
				}
			}
		}
		if (sp1.length > 2) {
			var val1 = parseFloat(sp1[scoring_idx]);
			tds[1].innerHTML = val1 + " - " + tds[1].innerHTML.split(" - ")[1];
			if (players_picked) {
				tot1 += val1;
			} else {
				if ((" " + tds[1].className + " ").indexOf(" clicked ") > -1 ) {
					tot1 += val1;
				}
			}
		}
	}
	document.getElementById("total0").innerHTML = tot0;
	document.getElementById("total1").innerHTML = tot1;
	findBest();
}

var increment = function() {
	var team = parseInt(this.id.split("_")[0]);
	var scoring_idx = parseFloat(document.getElementById("scoring_idx").value);
	var val = parseFloat(this.id.split("_")[scoring_idx]);
	var total = document.getElementById("total"+team);

	if (document.getElementsByClassName("clicked").length === 0) {
		resetTotal();
	}

	if ( (" " + this.className + " ").indexOf(" clicked ") > -1 )  {
		// not clicked
		this.className = this.className.split(" ")[0];
		total.innerHTML = parseFloat(total.innerHTML) - val;
	} else {		
		this.className += " clicked";
		total.innerHTML = parseFloat(total.innerHTML) + val;
	}
	findBest();
}

function last_updated(date) {
	const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	var week = date.split(",")[0];
	var date = new Date(date.split(",")[1]);
	document.getElementById("updated").getElementsByTagName("span")[0].innerHTML = "Last Updated: Week {} ({} {})".format(week, monthNames[date.getMonth()], date.getDate() + 1);	
}

function callback(results) {
	chrome.storage.local.get(["args", "players_picked", "evaluate", "viewtrade", "team_name0", "team_name1", "is_espn", "is_nfl"], function(res) {
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState === 4 && this.status === 200) {
				var j = JSON.parse(this.responseText);
				last_updated(j["updated"]);
				fillTable({...j, ...res});
				var tds = document.getElementsByClassName("player_td");
				for (var i = 0; i < tds.length; ++i) {
					if (tds[i].innerHTML != " - ") {
						tds[i].addEventListener("click", increment, false);
					}
				}
			}
		};
		xhttp.open("GET", "https://zhecht.pythonanywhere.com/extension"+res["args"]);
		xhttp.send();
	});
}

chrome.tabs.executeScript(null, {file: "content_script.js"}, callback);
var players_picked = false;

var btns = document.getElementsByTagName("button");
for (var i = 0; i < btns.length; ++i) {
	btns[i].addEventListener("click", changeScoring, false);
}