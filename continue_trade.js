// find the continue button and proceed
chrome.storage.local.get(null, function(res) {
	if (res["is_yahoo"]) {
		var links = document.getElementById("buttonbar").getElementsByTagName("a");
		for (var i = 0; i < links.length; ++i) {
			if (links[i].innerText.trim() == "Continue") {
				links[i].click();
			}
		}
	}
});