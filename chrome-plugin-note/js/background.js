console.log('background.js');


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
