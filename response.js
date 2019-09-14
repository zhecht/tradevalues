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
	}
	var id = storage["input_ids"][name];
	document.getElementById(id).checked = storage["should_click"];
});