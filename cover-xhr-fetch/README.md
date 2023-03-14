### 插件说明
* https://juejin.cn/post/6951366925557432356

* 拦截所有请求组装请求信息和结果

* 插件与页面的互相通信、做对应操作


### 流程说明
* background: 可以理解为你的插件注入在浏览器的一个后台服务器
  * 但是这个案例里并没有代码，无法理解 background 的实际作用

* browser_action: 插件点击后显示的页面, 可支持快捷键打开此页面
  * 修改这里的代码需要不需要刷新插件
  * 插件唤醒快捷键: 访问 chrome://extensions/shortcuts 自定义


* 拦截所有请求组装请求思路:
  1. 重写 XMLHttpRequest 和 fetch、重写后通过 chrome 提供的配置文件去往每个页面把重写的代码注入进去;
  2. content_scripts: 在当前网页去加载自定义 js, 修改这里的代码需要【刷新】插件

* content_scripts: 在当前网页去加载自定义 js, 修改这里的代码需要【刷新】插件
  * 这里在当前页面 head 注入了 `/contentScript/network.js`, 可 f12 观察到;

* network.js(实际插入页面的js) 与 install.js 的通信  

* web_accessible_resources: 设置文件访问权限
  * 通过 `chrome.extension.getURL` 来获取包内资源的路径;
  * 配合 content_scripts 将 此资源 注入当前页面;
