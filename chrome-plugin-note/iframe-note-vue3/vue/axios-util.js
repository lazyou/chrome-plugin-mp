// vue 专用的工具封装
// let csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

function messageError(message) {
    ElementPlus.ElMessage({
        message: message,
        type: 'error',
        offset: 200,
        center: true,
        duration: 5 * 1000,
        showClose: true,
    });
}

function messageSuccess(message) {
    ElementPlus.ElMessage({
        message: message,
        type: 'success',
        duration: 5 * 1000
    });
}

/**
 * 再次确认弹框 useage: confirmWarning().then().catch(err => {})
 * @param thenFunc
 * @param catchFunc
 * @returns {Promise<unknown> | Promise<unknown>}
 */
function confirmWarning(thenFunc) {
    return ElementPlus.ElMessageBox.confirm(
        '重要操作, 是否继续?',
        '提示',
        {
            cancelButtonText: '取消',
            confirmButtonText: '确定',
            type: 'warning',
            // center: true,
        }
    ).then(() => {
        thenFunc();
    }).catch(() => {

    });
}

// response interceptor
axios.interceptors.response.use(
    response => {
        // console.log('http.js response response:');
        // console.log(response);

        const res = response.data;

        if (response.status === 200 && response.data && response.data.message) {
            messageSuccess(response.data.message);
        }

        // 根据 http 状态码来判定接口情况
        if (response.status > 204) {
            messageError(res.message);

            return Promise.reject(new Error(res.message || 'Error'));
        } else {
            return res;
        }
    },
    error => {
        // debug 时打开
        // console.log('http.js response error:');
        // console.log(error.response); // TODO: 只有这样才能访问到 400 错误响应的数据

        const response = error.response;

        // TODO: 其他错误码
        if (response.status === 400 || response.status === 403) {
            let message = response.data.message || response.statusText;
            messageError(message);
            return Promise.reject(error);
        }

        if (response.status === 401) {
            let loginURL = '/admin/auth/login';
            if (window.location.pathname !== loginURL) {
                window.location.href = loginURL;
            } else {
                messageError('请先登录');
            }

            return Promise.reject(error);
        }

        if (response.status === 500) {
            messageError('服务器内部错误，请联系管理员');
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);
