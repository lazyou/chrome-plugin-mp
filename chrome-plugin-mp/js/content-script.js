console.log('content-script.js');

// 注意，必须设置了run_at=document_start 此段代码才会生效
document.addEventListener('DOMContentLoaded', () => {
    console.log('content-script DOMContentLoaded!');
    console.log(window.location.href);

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
