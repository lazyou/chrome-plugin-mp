

// 向content-script注入JS片段
// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

// 在当前tab执行逻辑
function executeScriptToCurrentTab(code)
{
	getCurrentTabId((tabId) =>
	{
		chrome.tabs.executeScript(tabId, {code: code});
	});
}

// 监听插件的时间
document.getElementById('click_by_id').addEventListener('click', () => {
    executeScriptToCurrentTab(`
        console.log('executeScriptToCurrentTab click_by_id');
    `);
});
