console.log('browser_action/index.js')

// browser_action 页面 js 向 background（后台永久注入服务） 发送消息
const sendMes = (data) =>{
    return new Promise( resolve =>{
        chrome.runtime.sendMessage( data, (res)=> {  resolve(res) });
    })
}
