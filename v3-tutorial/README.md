## 
* https://developer.chrome.com/docs/extensions/

* 常见问题: https://developer.chrome.com/docs/webstore/

* 【API参考】ChromeAPI: https://developer.chrome.com/docs/extensions/reference/
  * https://developer.chrome.com/docs/extensions/mv3/devguide/

* Service Worker 管理事件(监听): https://developer.chrome.com/docs/extensions/mv3/service_workers/

* 扩展文件:
  * manifest.json
  * service_workers
  * content_scripts: 在网页上下文中执行 Javascript。他们还可以读取和修改他们注入的页面的DOM
  * popup: 扩展可以包含各种 HTML 文件，例如弹出窗口、选项页面和其他 HTML 页面

* 扩展结构: https://developer.chrome.com/docs/extensions/mv3/architecture-overview/

* 交互设计: https://developer.chrome.com/docs/extensions/mv3/user_interface/

* 简单案例: https://developer.chrome.com/docs/extensions/mv3/getstarted/development-basics/
  * 载入开发目录: chrome://extensions  ->  加载已解压的扩展程序
  * popup.js : 在扩展图标上右击 -> 审查弹出内容 ， 才能看到js的输出内容

* 内容脚本(`content_scripts`):
  * content_scripts/content.js: 在当前窗口的 Console 就能看到输出

* 匹配模式: https://developer.chrome.com/docs/extensions/mv3/match_patterns/

* 标签管理: https://developer.chrome.com/docs/extensions/reference/tabs/

* Manifest V3: 可以使用更现代的开放网络技术，例如 service workers 和 promises
  * Manifest V3 从 Chrome 88开始可用;
  * 在Manifest V2 于 2024 年逐步淘汰后，这将成为强制性要求.

* v2 迁移到 v3: https://developer.chrome.com/docs/extensions/mv3/mv3-migration/
  * 必须使用 fetch: https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch

* 浏览器主题: https://developer.chrome.com/docs/extensions/mv3/themes/

* 官方案例: https://github.com/GoogleChrome/chrome-extensions-samples




###
* 重新理解插件 结构，以及代码生效

* 理解几个 结构 之间的通信（交互）

* 不同结构能调用什么


### 配置 manifest.json
* https://developer.chrome.com/docs/extensions/mv3/manifest/

* matches的语法参考: https://developer.chrome.com/extensions/match_patterns


### content-scripts 
* https://developer.chrome.com/extensions/content_scripts

* 内容脚本是在网页背景下运行的文件。通过使用标准的文档对象模型（DOM），它们能够读取浏览器访问的网页的细节，对其进行修改，并将信息传递给其父级扩展。

* 内容脚本可以通过交换信息来访问其父级扩展所使用的Chrome API。它们可以在将扩展文件声明为网络可访问资源后访问这些文件。
* 此外，内容脚本还可以直接访问以下Chrome APIs:
    ```js
    i18n
    storage
    runtime:
    connect
    getManifest
    getURL
    id
    onConnect
    onMessage
    sendMessage
    ```
