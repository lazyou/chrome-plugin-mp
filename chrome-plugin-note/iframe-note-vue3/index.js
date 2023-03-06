window.onload = function() {
    const App = {
        data() {
            return {
                message: "Hello Element Plus",
            };
        },
    };
    const app = Vue.createApp(App);
    app.use(ElementPlus);
    app.mount("#app");
}
