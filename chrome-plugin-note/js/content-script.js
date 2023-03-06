console.log('content-script.js');


// 注意，必须设置了 run_at=document_start 此段代码才会生效
document.addEventListener('DOMContentLoaded', () => {
    console.log('content-script DOMContentLoaded!');
    console.log(window.location.href);

    // 嵌入html
    const iFrame = document.createElement("iframe");
    iFrame.src  = chrome.extension.getURL ("iframe-note-jquery/index.html");
    document.body.insertBefore(iFrame, document.body.firstChild);

    // 从页面拿数据
    let url = $('#_url').val();
    let cookiesStr = $('#_cookies').val();
    if (url && cookiesStr) {
        let cookies = JSON.parse(cookiesStr);
        chrome.runtime.sendMessage({cookies: cookies, redirectURL: url}, (response) => {
            console.log('reciver background.js：');
            console.log(response);
        });
    } else {
        console.log('no cookies');
    }
});

