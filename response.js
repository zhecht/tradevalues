// this is triggered when a user clicks on a name in the popup

var double_team = ["los angeles", "san francisco", "new york", "green bay", "tampa bay", "new england", "new orleans", "kansas city"];

chrome.storage.local.get(null, function(storage) {
	var name = storage["clicked_name"].toLowerCase();
	if (storage["is_yahoo"]) {
		var name_parts = name.split(" ");
		if (double_team.indexOf(name) == -1 && name_parts.length > 1) {
			name = name_parts[0][0]+".";
			for (var i = 1; i < name_parts.length; ++i) {
				name += (" "+name_parts[i]);
			}
		}
		var id = storage["input_ids"][name];
		if (id)
			document.getElementById(id).checked = storage["should_click"];
	} else if (storage["is_espn"]) {
		// keys are 'table_idx', 'btn_idx'
		var step2 = window.location.search.substring(1).indexOf("step=2") !== -1;
		var data = storage["input_ids"][name];
		if (step2) {
			var tables = document.getElementsByClassName("propose-trade-content")[0].children[1].children;
		} else {
			var tables = document.getElementsByClassName("players-table");
		}
		var btn = tables[data.table_idx].getElementsByTagName("button")[data.btn_idx];
		btn.click();
	} else if (storage["is_nfl"]) {
		var id = storage["input_ids"][name];
		if (id)
			document.getElementById(id).click();
	} else if (storage["is_cbs"]) {
		var id = storage["input_ids"][name];
		if (id)
			document.querySelector("input[name='"+id+"'").click();
	} else if (storage["is_sleeper"]) {
		var win = document.getElementsByClassName("set-trade-player-modal");
		var rows = win[0].getElementsByClassName("team-roster-item");
		var id = storage["input_ids"][name];
		if (id || id == 0)
			rows[id].click();
	}
});