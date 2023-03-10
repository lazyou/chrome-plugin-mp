window.onload = function() {
    const App = {
        data: () => {
            return {
                text: "",
                textStatus: true,
                tabHost: '', // 当前标签域名
            };
        },
        created() {
            this.init()
            this.tabHostInit()
            this.textInitDelay()
        },
        watch: {
            // 每当 question 改变时，这个函数就会执行
            tabHost(newTabHost, oldTabHost) {
                console.log('newTabHost tabHost:', newTabHost)
                console.log('oldTabHost tabHost:', oldTabHost)
            }
        },
        methods: {
            init() {
                console.log('init')

                // // 在vue执行执行chrome脚本
                // chrome.tabs.executeScript({
                //     code:"$('body').prepend(`<h1>页面新增内容</h1>`)"
                // })
            },
            tabHostInit() {
                chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
                    let url = tabs[0].url
                    let parseUrl = new URL(url)
                    this.tabHost = parseUrl.host
                })
            },
            // 根据当前tab url，从 storage 里取笔记缓存
            textInitDelay() {
                setTimeout(() => {
                    chrome.storage.sync.get(this.getStorageObj(), (saveObj) => {
                        this.text = saveObj[this.tabHost] ?? ''
                    })
                }, 100)
            },
            // 根据当前tab url，将 笔记缓存 存入 storage 里
            textSave() {
                // if (this.text) {
                chrome.storage.sync.set(this.getStorageObj(), function() {
                    console.log('textSave: 保存成功！')
                })
                // } else {
                //     console.log('textSave: text 为空，不保存')
                // }
            },
            textToggle() {
                this.textStatus = !this.textStatus;
            },
            textChange() {
                this.textSave()
            },
            getTabHost() {
                return this.tabHost ?? 'unknown.com'
            },
            getStorageObj() {
                let saveObj = {}
                saveObj[this.getTabHost()] = this.text

                return saveObj;
            }
        }
    };

    const app = Vue.createApp(App)
    app.use(ElementPlus)
    app.mount("#vue-app")
}
