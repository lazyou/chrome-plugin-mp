
### vue CDN 使用方式

https://element-plus.gitee.io/zh-CN/guide/installation.html


### vue chrome 之间的交互
* 在 vue 操作 chrome
```js
// 在vue执行执行chrome脚本
chrome.tabs.executeScript({
    code:"$('body').prepend(`<h1>页面新增内容</h1>`)"
});
```

* TODO: 在 vue 操作 chrome 更复杂版（jq 来自动操作当前 dom）

* 在 vue 获取当前 tab 信息
  * 域名信息
