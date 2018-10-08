$(function () {


    var enter_editor = false; // 文本是否在编辑状态
    var editor_this = this; //当前编辑的标签this对象
    var enter_editor_image = false; //图片+视频是否在编辑状态
    var clearImgBorder = true;
    var article = {};
    article.attacheMents = [];
    // var coverList = [];//封面列表
    var videoList = []; //视频对象
    // var imageList = []; //图片对象
    InitializePage();

    // accept=".jpg,.png,.gif,.PNG,.JPG,.mp4,.MP4,.GIF"
    //点击上传图片事件
    $('#changeImage').click(function () {
        var inputFileFlag = false;
        $("#upload").click();
        //取消加绑定change事件解决change事件无法控制
        $("#upload").off("change");
        $("#upload").change(function () {
            if (this.files[0]) {
                var formData = new FormData();
                formData.append("file" + 0, this.files[0]);
                formData.append("name" + 0, this.files[0].name);
                $.ajax({
                    type: "POST",
                    url: "https://jiaoxue.maaee.com:8890/Excoord_Upload_Server/file/upload",
                    enctype: 'multipart/form-data',
                    data: formData,
                    // 告诉jQuery不要去处理发送的数据
                    processData: false,
                    // 告诉jQuery不要去设置Content-Type请求头
                    contentType: false,
                    xhr: function () {        //这是关键  获取原生的xhr对象  做以前做的所有事情
                        var xhr = jQuery.ajaxSettings.xhr();
                        xhr.upload.onload = function () {
                            // console.log('上传完成隐藏进度条');
                            $('.progressText').text('上传完成')
                            // setTimeout(function(){
                            $('#progress')[0].style.display = 'none';
                            $('.progress-bar')[0].style.width = '0%';
                            $('.progressText').text('进度: 0%');
                            // },500);
                        };
                        xhr.upload.onprogress = function (ev) {
                            if ($('#progress')[0].style.display == 'none') {
                                $('#progress')[0].style.display = 'block';
                            } else {
                                // console.log(((ev.loaded / ev.total) * 100).toFixed(0) + '%', 'ev');
                                //显示进度条
                                $('.progress-bar')[0].style.width = ((ev.loaded / ev.total) * 100).toFixed(0) + '%';
                                $('.progressText').text('进度: ' + ((ev.loaded / ev.total) * 100).toFixed(0) + '%')
                            }
                        };
                        return xhr;
                    },
                    success: function (res) {
                        //返回在线图片地址
                        var type = res.substring(res.length - 3, res.length);
                        console.log(type, 'type')
                        if (type == 'jpg' || type == 'png' || type == 'gif' || type == 'peg' || type == 'JPG' || type == 'PNG' || type == 'PEG' || type == 'GIF') {
                            var imageDiv = $("<img class='upload_box_image' />").attr('src', res);
                            var imageBox = $("<span class='image_box_upload'><i class='deleteImage_upload'></i></span>");
                            $(imageBox).append(imageDiv);
                            //image ---> uploadBox
                            $('#image_box').append(imageBox);
                        } else {//认为是视频
                            var videoDiv = $("<video class='upload_box_video' />").attr('src', res);
                            //image ---> uploadBox
                            var imageBox = $("<span class='image_box_upload'><i class='deleteImage_upload'></i></span>");
                            $(imageBox).append(videoDiv);

                            $('#image_box').append(imageBox);
                            upload_video_pic(res, videoDiv);
                            //处理ｃａｎｖａｓ截图

                            // var videoDiv = `<video class='upload_box_video' controls="controls">
                            // <source type="video/mp4" src=${res}/>
                            // </video>`
                            // var imageBox = `<span class='image_box_upload'><i class='deleteImage_upload'></i>
                            //         ${videoDiv}
                            // </span>`;
                            //
                            // $('#image_box').append(imageBox);
                            // upload_video_pic(res, videoDiv);

                        }
                    }
                });
            }
        })

    })


    function upload_video_pic(videoPath, videoDiv) {
        console.log(videoDiv, 'videoDiv');
        var video;//video标签
        var scale = 0.8;//第一帧图片与源视频的比例
        // var videoList = $(".upload_box_video");
        // console.log(videoList,'videoList');
        // for(var i=0;i<videoList.length;i++){
        //
        // }
        //ｖｉｄｅｏ标签
        video = $(".upload_box_video")[videoList.length];//赋值标签
        video.setAttribute("crossOrigin", 'Anonymous');
        video.addEventListener("loadeddata", function () {//加载完成事件，调用函数
            var canvas = document.createElement('canvas');//canvas画布
            canvas.width = video.videoWidth * scale;
            canvas.height = video.videoHeight * scale;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);//画图
            var image = canvas.toDataURL("image/png");
            var $Blob = getBlobBydataURI(image, 'image/jpeg');
            var formData = new FormData();
            formData.append("filePath", $Blob, "file_" + Date.parse(new Date()) + ".png");
            $.ajax({
                type: "POST",
                url: "https://jiaoxue.maaee.com:8890/Excoord_Upload_Server/file/upload",
                enctype: 'multipart/form-data',
                data: formData,
                // 告诉jQuery不要去处理发送的数据
                processData: false,
                // 告诉jQuery不要去设置Content-Type请求头
                contentType: false,
                success: function (res) {
                    // console.log(res, 'base64');
                    videoList.push({
                        cover: res,
                        videoPath: videoPath,
                        isCover: false,
                    })
                    videoDiv.attr('cover', res);
                    // console.log(videoList, 'videoList');
                }
            });
        })
    }


    //点击图片append图片进入编辑框
    $('#image_box').on('click', '.upload_box_image', function (e) {
        // console.log(e);
        appendImage(e.currentTarget.src);
        // console.log(e.currentTarget.src);
    })

    //点击视频append视频进入编辑框
    $('#image_box').on('click', '.upload_box_video', function (e) {
        // console.log($(this).attr('cover'), '封面');
        appendVideo($(this).attr('src'), $(this).attr('cover'));
    })

    //点击上传图片区域的删除  ++ 点击删除视频
    $('#image_box').on('click', '.deleteImage_upload', function () {
        $(this).parent().remove();
    })

    //点击编辑栏删除 删除当前选中的标签 文本
    $('#deleteLabel').on('click', function (e) {
        $(editor_this).remove();
        $('.editor_position').hide();
    })

    //点击编辑栏删除 删除当前选中的标签 图片 + 视频
    $('#deleteLabel_image').on('click', function (e) {
        removeAttachment($(editor_this).attr('src'));
        $(editor_this).remove();
        $('.editor_position_image').hide();
    })

    //input文章输入区域失去焦点事件
    $('#editor_input').on("blur", function () {
        var str = $('#editor_input').val();
        //将回车替换为br标签
        str = str.replace(/(\r\n)|(\n)/g, '<br>');
        if ($('#editor_input').val() != '') {
            // txt append ----> editor
            appendText(str);
        }
    })


    //字体加粗
    $('.B').click(function () {
        if ($(editor_this).css('font-weight') == 400) {
            $(editor_this).css({'font-weight': 900});
        } else {
            $(editor_this).css({'font-weight': 400});
        }

    })

    //字体倾斜
    $('.I').click(function () {
        // console.log($(editor_this).css('font-style'));
        if ($(editor_this).css('font-style') == 'italic') {
            $(editor_this).css({'font-style': 'normal'});
        } else {
            $(editor_this).css({'font-style': 'italic'});
        }

    })

    //字体下划线
    $('.U').click(function () {
        // console.log($(editor_this).css('text-decoration'));
        if ($(editor_this).css('text-decoration') == 'none solid rgb(0, 0, 0)') {
            $(editor_this).css({'text-decoration': 'underline'});
        } else {
            $(editor_this).css({'text-decoration': 'none'});
        }

    })

    //首行缩进
    $('.indent').click(function () {
        // console.log($(editor_this).css('text-indent'));
        if ($(editor_this).css('text-indent') == '0px') {
            $(editor_this).css({'text-indent': '2em'});
        } else {
            $(editor_this).css({'text-indent': '0em'});
        }

    })

    //字体大小
    $('#fontSize').on('input', function () {
        // console.log('焦点');
        // console.log($(this).val());
        $(editor_this).css({'font-size': $(this).val() + 'px'})

    })

    //字体颜色
    $('.jscolor').on('change', function () {
        $(editor_this).css({color: '#' + $(this).val()})
    })

    //行间距
    $('#lineSpac').on('input', function () {
        $(editor_this).css({'line-height': $(this).val() + 'px'})
    })

    //字间距
    $('#fontSpac').on('input', function () {
        $(editor_this).css({'letter-spacing': $(this).val() + 'px'})
    })

    //图片+视频宽度
    $('#image_width').on('input', function () {
        $(editor_this).css({'max-width': $(this).val() + '%'});
    })

    //
    $('#editor_box').on('mouseover', function () {
        // console.log('mouserover');
        clearImgBorder = false;
    })

    $('#editor_box').on('mouseout', function () {
        // console.log('mouseout');
        clearImgBorder = true;

    })

    //指针划入p标签编辑栏
    $(document).on('mouseenter', '.editor_position', function () {
        enter_editor = true;
    });

    //指针划出p标签编辑栏
    $(document).on('mouseleave', '.editor_position', function () {
        // console.log('已划出')
        enter_editor = false;
        $(editor_this).focus();
    });

    // $(document).on('blur', '.editor_position', function () {
    //     console.log('失去焦');
    //     $('.editor_position').hide();
    // });


    //指针划入图片+视频标签编辑栏
    $(document).on('mouseenter', '.editor_position_image', function () {
        // enter_editor_image = true;
        $(document).off('click');
    });

    //指针划出图片+视频标签编辑栏
    $(document).on('mouseleave', '.editor_position_image', function () {
        console.log('已划出')
        //图片标签文本失去焦点事件
        $(document).on('click', function () {
            // console.log('图片失去焦点事件');
            $('.editor_position_image').hide(200);
            if (clearImgBorder) {
                $(editor_this).css({border: '1px solid #fff'});
                $(document).off('click');
            }

        })
        // enter_editor_image = false;
    });

    //可编辑标签文本点击事件
    $('.editor_box').on('click', '.editor_text', function (e) {
        // clearImgBorder = false;
        // selectEventText(this);
        //
        // $('p').mouseup(function () {
        //     var txt = window.getSelection ? window.getSelection() : document.selection.createRange().text;
        //     alert(txt);
        // })
        //清除上一个边框
        $(editor_this).css({border: '1px solid #fff'});
        $(this).css({border: '1px solid #fff'});
        editor_this = this;
        var color = colorRGB2Hex($(this).css('color'));
        $(editor_this).css({border: '1px solid #778'});
        $('.editor_position').show(200);
        $('#jscolor').css({color: '#fff'})
        $('#jscolor').val(color);
        $('#jscolor').css({background: '#'+color})
        //向上偏移40
        var yy = e.originalEvent.y || e.originalEvent.layerY || 0;
        $('.editor_position').css({top: yy - 40, left: $(this).offset().left})

        //设置font-size Input 内的值
        $('#fontSize').val($(this).css('font-size').substring(0, $(this).css('font-size').length - 2));
        //设置行间距的input值
        $('#lineSpac').val($(this).css('line-height').substring(0, $(this).css('line-height').length - 2));
        //设置字间距的input值
        $('#fontSpac').val($(this).css('letter-spacing'));

    })

    //可编辑标签文本失去焦点事件
    $('.editor_box').on('blur', '.editor_text', function () {
        if (!enter_editor) {   //不在编辑状态下再隐藏
            $(this).css({border: '1px solid #fff'});
            $('.editor_position').hide(200);
        }
    })

    //图片标签 视频 点击事件
    $('.editor_box').on('click', '.editor_image,.editor_video', function (e) {
        //清除上一个边框
        $(editor_this).css({border: '1px solid #fff'});
        $(this).css({border: '1px solid #778', padding: '1px'});
        $('.editor_position_image').show(200);
        $('.editor_position_image').css({top: $(this).offset().top, left: $(this).offset().left})
        editor_this = this;

        //获取this当前宽度
        $('#image_width').val($(this).css('max-width').substring(0, $(this).css('max-width').length - 1))

        // console.log(this);
        //获取当前图片是否为封面
        $('#checkCover')[0].checked = isSelectedForCover($(this).attr('cover'));
        // console.log($(this).attr('cover'), 'cover');
        // if(coverList.indexOf(this.src) == -1){
        //     $('#checkCover')[0].checked = false;
        // }else{
        //     $('#checkCover')[0].checked = true;
        //
        // }
        //阻止冒泡
        e.stopPropagation();
        //图片失去焦点事件
        $(document).on('click', function () {
            $('.editor_position_image').hide(200);
            if (clearImgBorder) {
                $(editor_this).css({border: '1px solid #fff'});
                $(document).off('click');
            }
        })

    })


    //添加视频 ---->  editor
    function appendVideo(videoPath, videoCover) {
        $("#editor_box").append("<div class='video_content'><video  playsinline=\"true\"  webkit-playsinline=\"true\" class='editor_video' poster=" + videoCover + " src=" + videoPath + " cover=" + videoCover + " controls=\"controls\" controlslist=\"nodownload nofullscreen\" x5-video-player-type=\"h5\" playsinline webkit-playsinline></div>");
        addAttachment(videoCover, videoPath, 'video');
    }


    //添加图片 ---->  editor
    function appendImage(imagePath) {
        var editorImageDiv = $('<image class="editor_image" >').attr('src', imagePath);
        editorImageDiv.attr('cover', imagePath);
        $('#editor_box').append(editorImageDiv);
        addAttachment(imagePath, imagePath, 'image');
    }

    function addAttachment(coverPath, attachmentPath, type) {
        var attachent = {};
        attachent.type = type;
        attachent.cover = coverPath;
        attachent.path = attachmentPath;
        attachent.isMainCover = false;
        article.attacheMents.push(attachent);
    }

    function removeAttachment(attachmentPath) {

        var attachment = article.attacheMents;
        for (var k in attachment) {
            if (attachment[k].path == attachmentPath) {
                // console.log('移除第k项');
                article.attacheMents.splice(k, 1);
            }
        }
    }

    function selectCover(attachmentPath, selected) {
        article.attacheMents.forEach(function (attachment) {
            if (attachmentPath == attachment.cover) {
                attachment.isMainCover = selected;
            }
            // else{
            //     attachment.isMainCover = false;
            // }
        });
        // console.log(article);
    }


    function isSelectedForCover(attachmentPath) {
        var attacheMents = article.attacheMents;
        for (var k in attacheMents) {
            if (attacheMents[k].cover == attachmentPath) {
                return attacheMents[k].isMainCover;
            }
        }
        // article.attacheMents.forEach(function(attachment){
        //     if(attachmentPath == attachment.path){
        //         console.log(attachment.isMainCover,'匹配到');
        //
        //     }
        //     return false;
        // });
    }

        //添加文本 ---->  editor
    function appendText(text) {
        var txt = $("<div class='editor_text' contenteditable=\"true\"></div>").html(text);
        $('#editor_box').append(txt);
        $('#editor_input').val('');
    }


    //发布事件
    $('#submit').on('click', function () {
        //取消p标签编辑事件 准备发布
        $('#editor_box > div').attr('contenteditable', 'false');
        // $('#editor_box > div')
        $(editor_this).css({'border': '0'});
        if ($('#editor_box').html() != '') {
            var data = {};
            data.method = 'submit';
            article.content = $('#editor_box').html();
            article.title = $('#title').val().replace(/\n/g, " ");
            article.author = $('#author').val();
            article.type = 1; //１发布
            data.article = article;
            sendMessageTo(data);  //发送消息
            console.log(data.article, '发布时候的data');
            return;
            window.location.reload();
        } else {
            alert('文章内容不能为空!');
        }
    })

    //保存事件
    $('#draft').on('click', function () {
        //取消p标签编辑事件 准备发布
        $('#editor_box > div').attr('contenteditable', 'false');
        $(editor_this).css({'border': '0'});
        if ($('#editor_box').html() != '') {
            // var str = $('#title').val().replace(/\n/g," ");
            // console.log(str)
            // console.log($('#title').val(),'$(\'#title\').val()');
            // return;
            var data = {};
            data.method = 'submit';
            article.content = $('#editor_box').html();
            article.title = $('#title').val().replace(/\n/g, " ");
            article.author = $('#author').val();
            article.type = 0; //0草稿
            data.article = article;
            sendMessageTo(data);  //发送消息
            window.location.reload();
        } else {
            alert('文章内容不能为空!');
        }
    })

    //点击预览触发事件
    $('#preview_button').click(function () {
        //取消p标签编辑事件 准备发布
        $('#editor_box > div').attr('contenteditable', 'false');
        $(editor_this).css({'border': '1px solid #fff'});
        // $('#preview').html($('#editor_box').html());
        // $('#preview').show(100);
        var data = {};
        data.method = 'openPrieview';
        data.response = {
            label:$('#editor_box').html(),
            title:$('#title').val().replace(/\n/g, " "),
            author:$('#author').val(),
            date:formatYMD(new Date().getTime())
        };
        sendMessageTo(data);
    });

    /**
     * 时间戳转年月日
     * @param nS
     * @returns {string}
     */
    formatYMD = function (nS) {
        var da = new Date(parseInt(nS));
        var year = da.getFullYear();
        var month = da.getMonth() + 1;
        var date = da.getDate();
        var ymdStr = [year, month, date].join('-');
        return ymdStr;
    };

    //点击取消编辑
    $('#exit_button').click(function () {
        var data = {};
        data.method = 'exit_editor';
        sendMessageTo(data);
    })


    $('#checkCover').on('change', function (e) {
        if (e.currentTarget.checked) {  //设为封面
            // if(coverList.length >= 3){
            //     console.log('移除再添加')
            //     coverList.shift();
            //     coverList.push(editor_this.src);
            // }else{
            //     console.log('直接添加')
            //     coverList.push(editor_this.src);
            // }
            // console.log($(editor_this).attr('cover'),'            console.log(editor_this.cover);\n');
            selectCover($(editor_this).attr('cover'), true);
        } else {  //取消封面
            // coverList.indexOf(editor_this.src);
            // coverList.splice( coverList.indexOf( editor_this.src ), 1 );
            selectCover($(editor_this).attr('cover'), false);
        }
    })

    function sendMessageTo(data) {
        window.parent.postMessage(JSON.stringify(data), '*');
    }

    //监听接受消息
    window.addEventListener('message', (e) => {
        var res = JSON.parse(e.data);
        if (res.method == 'editor') {
            article = res.article;
            $('#editor_box').html('');
            $('#editor_box').html(article.content);
            // //更改为可编辑状态
            $('#editor_box > div').attr('contenteditable', 'true');
            $('#title').val(article.title);
            $('#author').val(article.author);
            // console.log($('#editor_box img'),'imag');
            // for(var k in $('#editor_box img')){
            //     // console.log($($('#editor_box img')[k]).attr('src'),'path');
            //     // console.log($($('#editor_box img')[k]).attr('cover'),'cover');
            // }
            // console.log($('#editor_box video'),'video');
            // console.log(res.response.articleImgs);
            console.log(article, '编辑时候的data');

        } else if (res.method == 'clearRichTestSign') {
            //清空编辑器内容
            window.location.reload();
        } else if (res.method == 'closeMask') {
            $('#editor_box > div').attr('contenteditable', 'true');
        }
    })

    //初始化页面元素
    function InitializePage() {
        $('.editor_position').hide();
        $('.editor_position_image').hide();
        $('#preview').hide();
        $('#title').val();
    }


    //ｒｂｇ　转换　十六进制　颜色
    function colorRGB2Hex(color) {
        var rgb = color.split(',');
        var r = parseInt(rgb[0].split('(')[1]);
        var g = parseInt(rgb[1]);
        var b = parseInt(rgb[2].split(')')[0]);

        var hex = "" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        return hex;
    }

    //首先需要 吧 base64 流转换成 blob 对象，文件对象都继承它
    function getBlobBydataURI(dataURI, type) {
        var binary = atob(dataURI.split(',')[1]);
        var array = [];
        for (var i = 0; i < binary.length; i++) {
            array.push(binary.charCodeAt(i));
        }
        return new Blob([new Uint8Array(array)], {type: type});
    }

    //点击预览框关闭事件
    // $('#preview').click(function () {
    //     $(this).hide();
    //     $('#phone').html('');
    //     //重新打开p标签编辑事件
    //     $('#editor_box > div').attr('contenteditable', 'true');
    //     var data = {};
    //     data.method = 'closePrieview';
    //     sendMessageTo(data);
    // })

    // $('#editor_box').on('mouseover','.editor_text',function(){
    //     console.log(112233);
    //     $(this).css({border: '1px dashed #4cbcd8'});
    // });
    //
    // $('#editor_box').on('mouseleave','.editor_text',function(){
    //     console.log(112233);
    //     $(this).css({border: '1px dashed #fff'});
    // })

    //


    //获取选中的文字方法
    function selectEventText(o, fn) {
        o.onmouseup = function (e) {
            console.log('触发了当前元素onmouseup事件');

            var event = window.event || e;
            var target = event.srcElement ? event.srcElement : event.target;
            if (/input|textarea/i.test(target.tagName) && /firefox/i.test(navigator.userAgent)) {
                //Firefox在文本框内选择文字
                var staIndex = target.selectionStart;
                var endIndex = target.selectionEnd;
                if (staIndex != endIndex) {
                    var sText = target.value.substring(staIndex, endIndex);
                    console.log(sText);
                }
            } else {
                //获取选中文字
                var sText = document.selection == undefined ? document.getSelection().toString() : document.selection.createRange().text;
                if (sText != "") {
                    console.log(sText);
                }
            }
            console.log(sText);
        }
        //鼠标的onmouseUp事件万一脱离了操作区域，触发不了mouseup事件，用leave事件进行替代
        o.onmouseleave = function (e) {
            console.log('触发了当前元素onmouseleave事件');

            var event = window.event || e;
            var target = event.srcElement ? event.srcElement : event.target;
            if (/input|textarea/i.test(target.tagName) && /firefox/i.test(navigator.userAgent)) {
                //Firefox在文本框内选择文字
                var staIndex = target.selectionStart;
                var endIndex = target.selectionEnd;
                if (staIndex != endIndex) {
                    var sText = target.value.substring(staIndex, endIndex);
                    console.log(sText);
                }
            } else {
                //获取选中文字
                var sText = document.selection == undefined ? document.getSelection().toString() : document.selection.createRange().text;
                if (sText != "") {
                    console.log(sText);
                }
            }
            console.log(sText);
        }
    }

})