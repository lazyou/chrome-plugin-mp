console.log('background.js');

chrome.contextMenus.create({
    title: '使用度娘搜索：%s', // %s表示选中的文字
    contexts: ['selection'], // 只有当选中文字时才会出现此右键菜单
    onclick: function(params)
    {
        // 注意不能使用location.href，因为location是属于background的window对象
        // TODO: 如何互动，写入到 iframe 里面的 textarea 里
        chrome.tabs.create({url: 'https://www.baidu.com/s?ie=utf-8&wd=' + encodeURI(params.selectionText)});
    }
});

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // background.js 不支持跳转
    // window.location.href="http://baidu.com";

    console.log('收到来自content-script的消息：');
    console.log(request, sender, sendResponse);

    // 更新当前标签 -- 这样访问公众号才不会出现 "系统繁忙(200004)" 的错误
    chrome.tabs.update({ url: request.redirectURL }, (tab) => {
        console.log('chrome tab update:');
        console.log(tab);
    });
});

chrome.tabs.executeScript({
    code:"$('body').prepend(`<h1>页面新增内容</h1>`)"
});
