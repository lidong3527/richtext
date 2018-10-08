const webAR = new WebAR(1500, '/webar/recognize');

const threeHelper = new ThreeHelper();

var videoIndex = 0;

var videoLength;

var videoArr = [];

document.querySelector('#openCamera').addEventListener('click', function () {

    document.getElementById('video').play()
    document.getElementById('littleV').play()

    const videoSetting = {width: window.screen.width, height: window.screen.height};

    const video = document.querySelector('#video');
    const videoDevice = document.querySelector('#videoDevice');

    const openCamera = (video, deviceId, videoSetting) => {
        webAR.openCamera(video, deviceId, videoSetting)
            .then((msg) => {
                // 打开摄像头成功
                // 将视频铺满全屏(简单处理)
                let videoWidth = video.offsetWidth;
                let videoHeight = video.offsetHeight;

                if (window.innerWidth < window.innerHeight) {
                    // 竖屏
                    if (videoHeight < window.innerHeight) {
                        video.setAttribute('height', window.innerHeight.toString() + 'px');
                    }
                } else {
                    // 横屏
                    if (videoWidth < window.innerWidth) {
                        video.setAttribute('width', window.innerWidth.toString() + 'px');
                    }
                }
            })
            .catch((err) => {
                alert(err);
                alert('打开视频设备失败');
            });
    };

    // 列出视频设备
    webAR.listCamera(videoDevice)
        .then(() => {
            // videoDevice.onchange = () => {
            //     openCamera(video, videoDevice.value, videoSetting);
            // };
            openCamera(video, videoDevice.value, videoSetting);
            // openCamera(video, videoDevice.value, videoSetting);

            // document.querySelector('#start').style.display = 'inline-block';
        })
        .catch((err) => {
            console.info(err);
            alert('没有可使用的视频设备');
        });

    // openCamera(video, '', videoSetting)
}, false);

document.querySelector('#start').addEventListener('click', () => {
    document.querySelector('#start').style.display = 'none';
    document.querySelector('#stop').style.display = 'inline-block';
    webAR.startRecognize((msg) => {
        // 识别成功后，msg=地址
        console.log('地址', msg);

        var param = {
            "method": 'getARBookItemByEasyARId',
            "targetId": msg,
        };
        WebServiceUtil.requestLittleAntApi(true, JSON.stringify(param), {
            onResponse: result => {
                if (result.msg == '调用成功' || result.success) {
                    // threeHelper.loadObject('asset/model/trex_v3.fbx');

                    if (!WebServiceUtil.isEmpty(result.response)) {
                        var arr = result.response.video.split(',');

                        if (arr[0].substr(arr[0].length - 3, arr[0].length - 1) == 'mp4') {
                            buildVideo(arr)
                        } else if (arr[0].substr(arr[0].length - 3, arr[0].length - 1) == 'pdf') {
                            buildPdf(arr[0])
                        } else {
                            getOfficeHadleFileBySourcePath(arr[0])
                        }
                    } else if (result.response == null) {
                        document.querySelector('#start').style.display = 'inline-block';
                        document.querySelector('#stop').style.display = 'none';
                    }

                }
            },
            onError: function (error) {

            }
        });


        // 加载本地模型
        // threeHelper.loadObject('asset/model/trex_v3.fbx');
        // webAR.trace('加载模型');

    });
}, false);

document.querySelector('#stop').addEventListener('click', () => {
    document.querySelector('#start').style.display = 'inline-block';
    document.querySelector('#stop').style.display = 'none';
    webAR.stopRecognize();
}, false);

/*document.querySelector('#right').addEventListener('click', () => {

    videoIndex += 1;

    // document.querySelector('#left').style.display = 'inline-block';
    if (videoIndex + 1 == videoLength) {
        document.querySelector('#right').style.display = 'none';
    }

    var videoSrc = videoArr[videoIndex];//新的视频播放地址
    document.getElementById("littleV").src = videoSrc;
    document.getElementById("littleV").play();

}, false)*/

/*document.querySelector('#left').addEventListener('click', () => {

    videoIndex -= 1;

    document.querySelector('#right').style.display = 'inline-block';
    if (videoIndex == 0) {
        document.querySelector('#left').style.display = 'none';
    }

    var videoSrc = videoArr[videoIndex];//新的视频播放地址
    document.getElementById("littleV").src = videoSrc;
    document.getElementById("littleV").play();

}, false)*/

document.querySelector('#close').addEventListener('click', () => {

    var video = document.getElementById('littleV');
    video.pause(); //暂停控制
    document.querySelector('#videoDiv').style.display = 'none'
    document.querySelector('.footer').style.display = 'none';

    document.querySelector('#start').style.display = 'inline-block';
    document.querySelector('#stop').style.display = 'none';
    document.querySelector('#myList').style.display = 'none';
    document.querySelector('#close').style.display = 'none';

    document.querySelector('#littleV').style.display = 'none';

}, false)

document.querySelector('#closePdf').addEventListener('click', () => {

    document.querySelector('#start').style.display = 'inline-block';
    document.querySelector('#stop').style.display = 'none';
    document.querySelector('#closePdf').style.display = 'none';

    document.querySelector('#littleV').style.display = 'none';
    document.querySelector('#pdf_iframe').style.display = 'none';

    document.querySelector('#close').click()
}, false)

/**
 * 构建video标签
 * @param data
 */
function buildVideo(data) {

    document.querySelector('#videoDiv').style.display = 'block';
    document.querySelector('#start').style.display = 'none';
    document.querySelector('#stop').style.display = 'none';
    document.querySelector('#myList').style.display = 'block';

    document.querySelector('#littleV').style.display = 'inline-block';

    var arr = []

    data.forEach(function (v, i) {
        var pptURL = v.replace("60.205.111.227", "www.maaee.com");
        pptURL = pptURL.replace("60.205.86.217", "www.maaee.com");
        if (pptURL.indexOf("https") == -1 && pptURL.indexOf("http") != -1) {
            pptURL = pptURL.replace("http", "https");
        }
        arr.push(pptURL)
    });

    videoLength = arr.length;

    videoArr = arr;

    var videoSrc = arr[0];//新的视频播放地址
    document.getElementById("littleV").src = videoSrc;

    document.getElementById("littleV").play();

    document.querySelector('#close').style.display = 'inline-block';
    document.querySelector('.footer').style.display = 'none';


    if (videoLength > 1) {
        // document.querySelector('#right').style.display = 'inline-block';
    }

    buildTags(videoArr)

}

function buildTags(videoArr) {
    var imgs = '<div class="teach_title">相关教材</div><div class="myList_cont"><div class="myList_cont_div">'

    for (var i = 0; i < videoArr.length; i++) {
        imgs += '<li><img onclick="imgOnClick(videoArr[' + i + '],videoArr)" class="videoArr" src="./asset/imgs/icon-bg.png"></li>'
    }

    imgs += '</div></div>'

    document.getElementById("myList").innerHTML = imgs
}

function imgOnClick(src, videoArr) {

    document.querySelector('#stop').style.display = 'none';
    document.querySelector('#closePdf').style.display = 'none';
    document.querySelector('#pdf_iframe').style.display = 'none';

    if (src.substr(src.length - 3, src.length - 1) == 'mp4') {
        var videoSrc = src;//新的视频播放地址
        document.getElementById("littleV").src = videoSrc;
        document.getElementById("littleV").play();
    } else if (src.substr(src.length - 3, src.length - 1) == 'pdf') {
        document.getElementById("littleV").pause()
        buildPdf(src)
    } else {
        document.getElementById("littleV").pause()
        getOfficeHadleFileBySourcePath(src)
        // buildTags(videoArr)
    }

}

function buildPdf(src) {

    document.querySelector('#pdf_iframe').style.display = 'block';
    document.querySelector('#closePdf').style.display = 'inline-block';

    var pdfURL = src.replace("60.205.111.227", "www.maaee.com");
    pdfURL = pdfURL.replace("60.205.86.217", "www.maaee.com");
    if (pdfURL.indexOf("https") == -1 && pdfURL.indexOf("http") != -1) {
        pdfURL = pdfURL.replace("http", "https");
    }

    var pdf_URL = 'https://www.maaee.com/Excoord_For_Education/js/pdfjs/web/viewer.html?file=' + pdfURL;
    $('#pdf_iframe')[0].src = pdf_URL
}

/**
 * 根据office源文件找到office文件的转码文件信息
 * false=> htmlPath
 * true=>  pdfPath
 * @param path
 * @param flag
 */
function getOfficeHadleFileBySourcePath(path) {

    var param = {
        "method": 'getOfficeHadleFileBySourcePath',
        "sourcePath": path,
    };

    WebServiceUtil.requestLittleAntApi(true, JSON.stringify(param), {
        onResponse: result => {
            if (result.msg == '调用成功' || result.success) {

                var src = result.response.pdfPath || result.response.htmlPath;

                var pdfURL = src.replace("60.205.111.227", "www.maaee.com");
                pdfURL = pdfURL.replace("60.205.86.217", "www.maaee.com");
                if (pdfURL.indexOf("https") == -1 && pdfURL.indexOf("http") != -1) {
                    pdfURL = pdfURL.replace("http", "https");
                }

                if (WebServiceUtil.isEmpty(result.response.pdfPath) == false) {
                    var pdf_URL = 'https://www.maaee.com/Excoord_For_Education/js/pdfjs/web/viewer.html?file=' + pdfURL;
                    $('#pdf_iframe')[0].src = pdf_URL
                } else {
                    $('#pdf_iframe')[0].src = pdfURL
                }

                document.querySelector('#pdf_iframe').style.display = 'block';
                document.querySelector('#closePdf').style.display = 'inline-block';

            }
        },
        onError: function (error) {

        }
    });

}
