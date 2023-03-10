// 此方法允许扩展设置初始状态或完成一些安装任务。扩展可以使用Storage API和IndexedDB来存储应用程序状态
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
        text: "OFF",
    });
});
