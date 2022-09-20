console.log('background.js');

function setCookie(url, name, value, path, secure, httpOnly, expirationDate) {
    chrome.cookies.set({
        url: url,
        name: name,
        value: value,
        // domain: domain,
        path: path,
        secure: secure,
        httpOnly: httpOnly,
        expirationDate: expirationDate, // cookie的过期时间，用从UNIX epoch开始计的秒数表示。如果未指定，该cookie是一个会话cookie。
    }, (result) => {
        // console.log('setCookie:');
        // console.log(result);
    });
}

// 监听来自content-script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // background.js 不支持跳转
    // window.location.href="http://baidu.com";

    // console.log('收到来自content-script的消息：');
    // console.log(request, sender, sendResponse);

    request.cookies.forEach((cookie, index) => {
        setCookie('https://mp.weixin.qq.com/', cookie.Name, cookie.Value, cookie.Path, cookie.Secure, cookie.HttpOnly, cookie.Expires);
    });

    sendResponse({
        ok: true,
    });

    // 更新当前标签 -- 这样访问公众号才不会出现 "系统繁忙(200004)" 的错误
    chrome.tabs.update({ url: request.redirectURL }, (tab) => {
        console.log('chrome tab update:');
        console.log(tab);
    });
});
