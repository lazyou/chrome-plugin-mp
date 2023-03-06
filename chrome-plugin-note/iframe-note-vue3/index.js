window.onload = function() {
    const App = {
        data: () => {
            return {
                text: "",
                textStatus: true,
            };
        },
        created() {
            this.init();
        },
        methods: {
            init() {
                console.log('textToggle');
                // 执行chrome脚本
                chrome.tabs.executeScript({
                    code:"$('body').prepend(`<h1>页面新增内容</h1>`)"
                });
            },
            textToggle() {
                console.log('textToggle');
                this.textStatus = !this.textStatus;
            },
            textChange() {
                console.log('textChange');
                console.log(this.text)
            },
        }
    };
    const app = Vue.createApp(App);
    app.use(ElementPlus);
    app.mount("#vue-app");
}
