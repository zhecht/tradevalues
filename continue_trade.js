// find the continue button and proceed
chrome.storage.local.get(null, function(storage) {
	if (storage["is_yahoo"]) {
		var links = document.getElementById("buttonbar").getElementsByTagName("a");
		for (var i = 0; i < links.length; ++i) {
			if (links[i].innerText.trim() == "Continue") {
				links[i].click();
			}
		}
	} else if (storage["is_espn"]) {
		var btns = document.getElementsByClassName("action-buttons");
		for (var i = 0; i < btns.length; ++i) {
			if (btns[i].innerText.trim() == "Continue" || btns[i].innerText.trim() == "Finalize Trade Offer") {
				btns[i].click();
				return;
			}
		}
	} else if (storage["is_nfl"]) {
		document.querySelector("input.submit").click();
	} else if (storage["is_cbs"]) {
		document.getElementById("reviewCurrentTrade").click();
	} else if (storage["is_sleeper"]) {
		// now check if receive window is up
		var win = document.getElementsByClassName("set-trade-player-modal");
		if (win.length > 0) {
			var btn = document.getElementsByClassName("set-trade-player-modal")[0].getElementsByTagName("button")[0];
			if (btn.innerText.split(" ")[0].toLowerCase() == "receive") {				
				btn.click();
			}
		} else {
			// overview 
			document.getElementsByClassName("propose-btn")[0].click();
		}
	}
});