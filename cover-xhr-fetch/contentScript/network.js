console.log('contentScript/network.js');


// TODO: 数据拦截导致网址不能正常访问，所以可以针对要采集网址在插件上设置 "有权访问的网站"
// 转发数据
function forwardTo(req_data) {
    if (! isURL(req_data.url)) {
        return;
    }

    // 允许采集的源网址 与 发送网址 映射.
    let postDevURL = 'http://localhost:8000/api/douyinProduct/browser_import';
    let postProdURL = 'https://apisc.qiandouec.com/api/douyinProduct/browser_import';
    let importMap = [
        {
            form: 'http://admin.duowens.test/admin/report/useraidroi/dashboard',
            to: postDevURL,
        },
        {
            from: 'https://buyin.jinritemai.com/ecom/captain/institution/activity/audit/list',
            to: postProdURL,
        }
    ];

    // 当前网址解析
    let parseURL = new URL(req_data.url);
    let fromURL = parseURL.origin + parseURL.pathname;

    let postURL = '';
    let allowPost = false;

    // 当前网址解析 是否允许导入
    for (const index in importMap) {
        let item = importMap[index];
        if (item.form === fromURL) {
            postURL = item.to;
            allowPost = true;
        }
    }

    if (! allowPost) {
        return;
    }

    console.log('forwardTo 数据转发:', req_data.method, req_data.url)

    const formData = new FormData();
    formData.append('url', req_data.url);
    formData.append('data', req_data.response);
    let rand = Math.random().toString().substr(2);

    let options = {
        method: 'post',
        mode: 'no-cors', // 解决 CORS error 问题. 如果还是不能解决跨域问题，那就要后端nginx添加相关配置 Access-Control-Allow-Origin 之类的
        body: formData,
        // body: JSON.stringify({ url: req_data.url, data: req_data.response }),
        headers: {
            // 'Content-Type': 'application/json',
            // 'Access-Control-Allow-Origin': '*',
            // TODO: 卧槽，这个 Content-Type 我我没看懂，居然有效果。。。
            // https://stackoverflow.com/questions/40561738/php-message-warning-missing-boundary-in-multipart-form-data-post-data-in-unknow
            'Content-Type': `Content-type","multipart/form-data; charset=utf-8; boundary=${rand}`, // mode: 'no-cors' 模式下仅支持 multipart/form-data 传参
            // 'Authorization':  auth,
        }
    }

    fetch(postURL, options)
        .then(resp => {
            // console.log("fetch resp:", resp);
            // console.log("fetch text:", resp.text());
            // console.log("fetch json:", resp.json());
            // return resp.json();
            // return resp.text();
        })
        .catch(error=>{
            console.log("fetch error:", error);
        })
}

function isURL(str) {
    let v = new RegExp('^(?!mailto:)(?:(?:http|https|ftp)://|//)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$', 'i');
    return v.test(str);
}

const tool = {
    isString(value) {
        return Object.prototype.toString.call(value) === '[object String]';
    },
    isPlainObject(obj) {
        let hasOwn = Object.prototype.hasOwnProperty;
        // Must be an Object.
        // if (!obj || typeof obj !== 'object' || obj.nodeType || isWindow(obj)) {
        if (!obj || typeof obj !== 'object' || obj.nodeType) {
            return false;
        }
        try {
            if (obj.constructor && !hasOwn.call(obj, 'constructor') && !hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
        } catch (e) {
            return false;
        }
        let key;
        for (key in obj) {}
        return key === undefined || hasOwn.call(obj, key);
    }
}

// 这个类是基于腾讯开源 vconsole（https://github.com/Tencent/vConsole）、写的适用本插件的一个类
class RewriteNetwork {
    constructor() {
        this.reqList = {}; // URL as key, request item as value
        this._open = undefined; // the origin function
        this._send = undefined;
        this._setRequestHeader = undefined;
        this.status = false;
        this.mockAjax();
        this.mockFetch();
    }
    onRemove() {
        if (window.XMLHttpRequest) {
            window.XMLHttpRequest.prototype.open = this._open;
            window.XMLHttpRequest.prototype.send = this._send;
            window.XMLHttpRequest.prototype.setRequestHeader = this._setRequestHeader;
            this._open = undefined;
            this._send = undefined;
            this._setRequestHeader = undefined
        }
    }

    /**
     * mock ajax request
     * @private
     */
    mockAjax() {
        if (!window.XMLHttpRequest) { return; }
        const that = this;
        //保存原生_XMLHttpRequest方法、用于下方重写
        const _open = window.XMLHttpRequest.prototype.open,
            _send = window.XMLHttpRequest.prototype.send,
            _setRequestHeader = window.XMLHttpRequest.prototype.setRequestHeader;
        that._open = _open;
        that._send = _send;
        that._setRequestHeader = _setRequestHeader;
        //重写设置请求头open
        window.XMLHttpRequest.prototype.open = function() {
            let XMLReq = this;
            let args = [].slice.call(arguments),
                method = args[0],
                url = args[1],
                id = that.getUniqueID();
            let timer = null;

            // may be used by other functions
            XMLReq._requestID = id;
            XMLReq._method = method;
            XMLReq._url = url;

            // mock onreadystatechange
            let _onreadystatechange = XMLReq.onreadystatechange || function() {};
            //定时轮询去查看状态 每次 readyState 属性改变的时候调用的事件句柄函数。当 readyState 为 3 时，它也可能调用多次。
            let onreadystatechange = function() {
                let item = that.reqList[id] || {};

                //恢复初始化
                item.readyState = XMLReq.readyState;
                item.status = 0;
                //同步XMLReq状态
                if (XMLReq.readyState > 1) {
                    item.status = XMLReq.status;
                }
                item.responseType = XMLReq.responseType;
                //初始化状态。XMLHttpRequest 对象已创建或已被 abort() 方法重置。
                if (XMLReq.readyState === 0) {
                    if (!item.startTime) {
                        item.startTime = (+new Date());
                    }
                    //open() 方法已调用，但是 send() 方法未调用。请求还没有被发送
                } else if (XMLReq.readyState === 1) {
                    if (!item.startTime) {
                        item.startTime = (+new Date());
                    }
                    //Send() 方法已调用，HTTP 请求已发送到 Web 服务器。未接收到响应。
                } else if (XMLReq.readyState === 2) {
                    // HEADERS_RECEIVED
                    item.header = {};
                    let header = XMLReq.getAllResponseHeaders() || '',
                        headerArr = header.split("\n");
                    // extract plain text to key-value format
                    for (let i=0; i<headerArr.length; i++) {
                        let line = headerArr[i];
                        if (!line) { continue; }
                        let arr = line.split(': ');
                        let key = arr[0];
                        item.header[key] = arr.slice(1).join(': ');
                    }
                    //所有响应头部都已经接收到。响应体开始接收但未完成
                } else if (XMLReq.readyState === 3) {
                    //HTTP 响应已经完全接收。
                } else if (XMLReq.readyState === 4) {
                    // console.log('XMLReq:', XMLReq) // 为了 filterData 传入更多所需参数

                    clearInterval(timer);
                    item.endTime = +new Date();
                    item.costTime = item.endTime - (item.startTime || item.endTime);
                    item.response = XMLReq.response;
                    item.method = XMLReq._method;
                    item.url = XMLReq.responseURL;
                    item.req_type = 'xml';
                    item.getData = XMLReq.getData;
                    item.postData = XMLReq.postData;

                    that.filterData(item)
                } else {
                    clearInterval(timer);
                }
                return _onreadystatechange.apply(XMLReq, arguments);
            };
            XMLReq.onreadystatechange = onreadystatechange;

            //轮询查询状态
            let preState = -1;
            timer = setInterval(function() {
                if (preState !== XMLReq.readyState) {
                    preState = XMLReq.readyState;
                    onreadystatechange.call(XMLReq);
                }
            }, 10);

            return _open.apply(XMLReq, args);
        };

        // 重写设置请求头setRequestHeader
        window.XMLHttpRequest.prototype.setRequestHeader = function() {
            const XMLReq = this;
            const args = [].slice.call(arguments);

            const item = that.reqList[XMLReq._requestID];
            if (item) {
                if (!item.requestHeader) { item.requestHeader = {}; }
                item.requestHeader[args[0]] = args[1];
            }
            return _setRequestHeader.apply(XMLReq, args);
        };

        // 重写send
        window.XMLHttpRequest.prototype.send = function() {
            let XMLReq = this;
            let args = [].slice.call(arguments),
                data = args[0];

            let item = that.reqList[XMLReq._requestID] || {};
            item.method = XMLReq._method ? XMLReq._method.toUpperCase() : 'GET';

            let query = XMLReq._url ? XMLReq._url.split('?') : []; // a.php?b=c&d=?e => ['a.php', 'b=c&d=', 'e']
            item.url = XMLReq._url || '';
            item.name = query.shift() || ''; // => ['b=c&d=', 'e']
            item.name = item.name.replace(new RegExp('[/]*$'), '').split('/').pop() || '';

            if (query.length > 0) {
                item.name += '?' + query;
                item.getData = {};
                query = query.join('?'); // => 'b=c&d=?e'
                query = query.split('&'); // => ['b=c', 'd=?e']
                for (let q of query) {
                    q = q.split('=');
                    item.getData[ q[0] ] = decodeURIComponent(q[1]);
                }
            }
            if (item.method === 'POST') {
                // save POST data
                if (tool.isString(data)) {
                    let arr = data.split('&');
                    item.postData = {};
                    for (let q of arr) {
                        q = q.split('=');
                        item.postData[ q[0] ] = q[1];
                    }
                } else if (tool.isPlainObject(data)) {
                    item.postData = data;
                } else {
                    item.postData = '[object Object]';
                }

            }
            XMLReq.getData = item.getData || "";
            XMLReq.postData = item.postData || "";
            return _send.apply(XMLReq, args);
        };

    };

    /**
     * mock fetch request
     * @private
     */
    mockFetch() {
        const _fetch = window.fetch;
        if (!_fetch) { return ""; }
        const that = this;

        window.fetch = function (input, init) {
            let id = that.getUniqueID();
            that.reqList[id] = {};
            let item = that.reqList[id] || {};

            let query = [],
                url = '',
                method = 'GET',
                requestHeader = null;

            // handle `input` content
            if (tool.isString(input)) { // when `input` is a string
                method = init.method ? init.method : 'GET';
                url = input;
                requestHeader = init.headers ? init.headers : null
            } else { // when `input` is a `Request` object
                method = input.method || 'GET';
                url = input.url;
                requestHeader = input.headers;
            }

            query = url.split('?');

            item.id = id;
            item.method = method;
            item.requestHeader = requestHeader;
            item.url = url;
            item.name = query.shift() || '';
            item.name = item.name.replace(new RegExp('[/]*$'), '').split('/').pop() || '';

            if (query.length > 0) {
                item.name += '?' + query;
                item.getData = {};
                query = query.join('?'); // => 'b=c&d=?e'
                query = query.split('&'); // => ['b=c', 'd=?e']
                for (let q of query) {
                    q = q.split('=');
                    item.getData[q[0]] = q[1];
                }
            }

            if (item.method === "post") {
                if (tool.isString(input)) {
                    if (tool.isString(init.body && init.body)) {
                        let arr = init.body.split('&');
                        item.postData = {};
                        for (let q of arr) {
                            q = q.split('=');
                            item.postData[q[0]] = q[1];
                        }
                    } else if (tool.isPlainObject(init.body && init.body)) {
                        item.postData = init.body && init.body;
                    } else {
                        item.postData = '[object Object]';
                    }
                } else {
                    item.postData = '[object Object]';
                }
            }

            //   UNSENT
            if (!item.startTime) {
                item.startTime = (+new Date());
            }

            return _fetch(url, init).then((response) => {
                response.clone().json().then((json) => {
                    item.endTime = +new Date();
                    item.costTime = item.endTime - (item.startTime || item.endTime);
                    item.status = response.status;
                    item.header = {};
                    for (let pair of response.headers.entries()) {
                        item.header[pair[0]] = pair[1];
                    }
                    item.response = json;
                    item.readyState = 4;
                    const contentType = response.headers.get('content-type');
                    item.responseType = contentType.includes('application/json') ? 'json' : contentType.includes('text/html') ? 'text' : '';
                    item.req_type = 'fetch';
                    that.filterData(item)
                    return json;
                })
                return response;
            })
        };
    }

    // filterData 支持的参数如下:
    // {
    //     costTime: 0,
    //     endTime: 1678775515422,
    //     getData: "",
    //     method: "GET",
    //     postData: "",
    //     readyState: 4,
    //     req_type: "xml",
    //     response: "{ 请求 api 响应的json字符串 }",
    //     responseType: "",
    //     status: 200,
    //     url: "api/system/user/menus"
    // }
    filterData({ url, method, req_type, response, getData, postData}){
        if(!url) return;
        const req_data = {
            url,
            method,
            req_type,
            response,
            getData, //query参数
            postData
        }

        // TODO: 注意，这里是对【响应】的数据进行监听拦截，而不是对【请求】的数据进行监听拦截
        // console.log('拦截的结果01:',req_data)

        forwardTo(req_data)
    }

    /**
     * generate an unique id string (32)
     * @private
     * @return string
     */
    getUniqueID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

const network = new RewriteNetwork();

// // 【通信: 注入页面的 js -> install.js】
// // 利用postMessage方法和content_script进行通信、在拦截请求的方法里面去发送数据给content_script
// const senMes = (data) =>{
//     window.postMessage(data, '*');
// }
// console.log('拦截的结果02:',req_data)
// senMes(req_data)
