
chrome.runtime.onInstalled.addListener(function() {

	//console.log($("body").text());

	/*chrome.storage.sync.set({color: '#3aa757'}, function() {
		console.log("color is green");
	});*/
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {hostEquals: 'football.fantasysports.yahoo.com', pathContains: 'trade'},
			})
			],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		},
		{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {hostEquals: 'games.espn.com', pathContains: 'trade'},
			})
			],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}]);
	});
});
