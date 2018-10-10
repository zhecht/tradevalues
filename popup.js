

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

	document.getElementsByClassName("name")[0].innerHTML = results["team0_name"]
	document.getElementsByClassName("name")[1].innerHTML = results["team1_name"]

	var player_len = (results["team0"].length >= results["team1"].length) ? results["team0"].length : results["team1"].length;
	var tot0 = 0, tot1 = 0;
	for (var p = 0; p < player_len; ++p) {
		var name0 = "", name1 = "", val0 = "", val1 = "";
		var class0 = "player_td", class1 = "player_td";
		if (p < results["team0"].length) {
			var sp = results["team0"][p].split(",");
			name0 = sp[0];
			val0 = parseFloat(sp[1]);

			if (results["players_picked"]) {
				tot0 += val0;
			} else if (sp[2] === "true") {
				tot0 += val0;
				class0 += " clicked";	
			}
		}
		if (p < results["team1"].length) {
			var sp = results["team1"][p].split(",");
			name1 = sp[0];
			val1 = parseFloat(sp[1]);

			if (results["players_picked"]) {
				tot1 += val1;
			} else if (sp[2] === "true") {
				tot1 += val1;
				class1 += " clicked";	
			}
		}

		document.getElementById("table").innerHTML += "<tr><td class='{}' id='0_{}'>{} - {}</td><td class='{}' id='1_{}'>{} - {}</td></tr>".format(class0, val0, val0, name0, class1, val1, val1, name1);
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

var increment = function() {
	var team = parseInt(this.id.split("_")[0]);
	var val = parseFloat(this.id.split("_")[1]);
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

chrome.tabs.executeScript(null, {file: "content_script.js"});
setTimeout(function(){
	chrome.storage.local.get(["team0", "team1", "team0_name", "team1_name", "players_picked", "is_espn"], function (results){
		//console.log(results);
		fillTable(results);
		var tds = document.getElementsByClassName("player_td");
		for (var i = 0; i < tds.length; ++i) {
			if (tds[i].innerHTML != " - ") {
				tds[i].addEventListener("click", increment, false);	
			}
		}
	});
}, 1000);

/*
chrome.storage.sync.get('color', function(data) {
	changeColor.style.backgroundColor = data.color;
	changeColor.setAttribute('value', data.color);
});
*/