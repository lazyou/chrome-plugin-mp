

// 向content-script注入JS片段
// 获取当前选项卡ID
function getCurrentTabId(callback)
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
	{
		if(callback) callback(tabs.length ? tabs[0].id: null);
	});
}

function executeScriptToCurrentTab(code)
{
	getCurrentTabId((tabId) =>
	{
		chrome.tabs.executeScript(tabId, {code: code});
	});
}

// 自动填充八篇公众号文章
document.getElementById('auto_choose_videos').addEventListener('click', () => {
    executeScriptToCurrentTab(`
    // (默认有视频的情况下)选择第一个视频 -- OK -- START
    function sleep (time) {
        return new Promise((resolve) => setTimeout(resolve, time));
    }

    // 视频数据长度, 无则为0
    function getVideosLength() {
        return document.getElementsByClassName('more-video__item-wrp').length;
    }

    // 点击视频消息发起ajax请求
    function getVideoList() {
        document.getElementById('js_add_appmsg').click(); // 点击新建消息
        document.getElementsByClassName('create_article_item')[2].click(); // 点击 视频消息 (触发列表ajax请求)
    }

    // 获取下一页视频链接
    function getVideoListNext() {
      document.getElementsByClassName('weui-desktop-btn weui-desktop-btn_mini')[0].click();
    }

    // 选中某个视频
    function clickVideo(index) {
        document.getElementsByClassName('more-video__item-wrp')[index].click(); // 点击具体某个视频
        sleep(200).then(() => {
            document.getElementsByClassName('weui-desktop-btn_primary')[0].click(); // 点击确认按钮
        });
    }

    // 已选中视频长度
    function getExistVideoLen() {
        return document.getElementsByClassName('js_appmsg_item').length;
    }

    function initVideos(total, i, isAjax) {
        if (getExistVideoLen() === 8) {
            alert('八篇视频已选好');
            return true;
        }

        console.log('i:');
        console.log(i);

        if (i == 0 && getVideosLength() > 0) {
            console.log('getFirstVideo');
            clickVideo(i);
            i++;
        }

        sleep(200).then(() => {
            console.log('sleep i:');
            console.log(i);

            if (i < total) {
                if (getVideosLength() == 0 && !isAjax) {
                    console.log('getVideoList');
                    isAjax = true;
                    getVideoList();

                    sleep(1000).then(() => {
                        initVideos(total, i, isAjax);
                    });
                } else {
                    if (getVideosLength() > 0) {
                        let less = i+1;
                        if (getVideosLength() < less) {
                            alert("首页视频数量少于" + less + "篇, 请手动选择")
                            return false;
                        } else {
                            sleep(200).then(() => {
                                console.log('clickVideo');
                                isAjax = false;
                                clickVideo(i);
                                i++;
                                initVideos(total, i, isAjax);
                            });
                        }
                    } else {
                        console.log('no videos');
                        initVideos(total, i, isAjax);
                    }
                }
            } else {
                console.log('end');
            }
        });
    }

    initVideos(8, 0, false);
    `);
});
