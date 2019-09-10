
chrome.runtime.onInstalled.addListener(function() {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
					pageUrl: {hostEquals: 'football.fantasysports.yahoo.com', pathContains: 'trade'},
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		},
		{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {hostEquals: 'fantasy.espn.com', pathContains: 'trade'},
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		},
		{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {hostEquals: 'fantasy.nfl.com', pathContains: 'trade'},
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		},
		{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {hostContains: 'cbssports', pathContains: 'trade'},
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		},
		{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: {hostEquals: 'sleeper.app', pathContains: 'team'},
			})],
			actions: [new chrome.declarativeContent.ShowPageAction()]
		}
		]);
	});
});
