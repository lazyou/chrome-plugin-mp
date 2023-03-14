console.log('contentScript/install.js');

// 向当前页面注入 js 代码
setTimeout(() => {
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    //通过chrome.extension.getURL来获取包内资源的路径。需要在manifest.json文件中设置访问权限web_accessible_resources
    script.setAttribute('src', chrome.extension.getURL('/contentScript/network.js'));
    document.head.appendChild(script);
});

// // 接收 inject页面(network.js) 消息
// window.addEventListener("message", function(e){
//     const { data } = e;
//     console.log('接收networkJS数据',data)
// }, false);
//
// // content_script 与 background（后台永久注入服务）通信
// const sendBgMessage = (data) =>{
//     chrome.runtime.sendMessage({ type:'page_request',data}, function(response) {
//         console.log('后台的回复：' + response);
//     });
// }
