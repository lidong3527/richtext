$(function () {

    var loginUser = null
    var locationHref = window.location.href;
    var locationSearch = locationHref.substr(locationHref.indexOf("?") + 1);
    var loginUserId = locationSearch.split('&')[0].split('=')[1]
    getLittleVideoUserById(loginUserId)

    var enter_editor = false; // 文本是否在编辑状态
    var editor_this = this; //当前编辑的标签this对象
    var enter_editor_image = false; //图片+视频是否在编辑状态
    var article = {};
    article.attacheMents = [];
    var videoList = []; //视频对象
    InitializePage();

    let screenHeight = document.body.offsetHeight
// 为window绑定resize事件
    $(window).resize(function () {
        let nowHeight = document.body.offsetHeight;
        if (nowHeight < screenHeight) {
            // 将底部弹起的按钮隐藏（可使用给按钮添加相应消失类）
            $('.bottom_nav').hide();

        } else {
            // 将按钮正常显示（可使用给按钮移除相应消失类）
            $('.bottom_nav').show();
        }
    });

    $('#addPic').on('click', function () {
        $('.picAddPanel').slideDown()
        $(".tagAddPanel_bg").css('display', 'block');
    })

    $('.hide_editor_position_image').on('click', function () {
        $('.editor_position_image').css('display', 'none')
    })

    $('.hide_editor_position').on('click', function () {
        $('.editor_position').css('display', 'none')
    })

    //点击上传图片事件
    $('#changeImage').click(function () {

        var data = {
            method: 'selFilesSuccess',
        };
        var str = '';
        Bridge.callHandler(data, function (res) {
            // 拿到照片地址

            if (str == '') {
                var type = res.substring(res.length - 1, res.length);

                if (type == 1) {
                    $('#editor_box').css("display", "block")
                    appendImage(res);
                } else {//认为是视频
                    var phoneType = navigator.userAgent;
                    if (phoneType.indexOf('iPhone') > -1 || phoneType.indexOf('iPad') > -1) {
                        var cover = res.split('&')[1].split('=')[1]
                        var src = res.split('?')[0]

                        $('#editor_box').css("display", "block")
                        appendVideo(src, cover);

                    } else {
                        var src = res.split('?')[0]
                        var videoDiv = $("<video class='upload_box_video' />").attr('src', src);
                        upload_video_pic(src, videoDiv)
                    }
                }
                str = res;
            } else if (str == res) {
                return
            }

        }, function (error) {
            console.log(error);
        });


        // var inputFileFlag = false;
        // $("#upload").click();
        // //取消加绑定change事件解决change事件无法控制
        // $("#upload").off("change");
        // $("#upload").change(function () {
        //     if (this.files[0]) {
        //         var formData = new FormData();
        //         formData.append("file" + 0, this.files[0]);
        //         formData.append("name" + 0, this.files[0].name);
        //         $.ajax({
        //             type: "POST",
        //             url: "https://jiaoxue.maaee.com:8890/Excoord_Upload_Server/file/upload",
        //             enctype: 'multipart/form-data',
        //             data: formData,
        //             // 告诉jQuery不要去处理发送的数据
        //             processData: false,
        //             // 告诉jQuery不要去设置Content-Type请求头
        //             contentType: false,
        //             xhr: function () {        //这是关键  获取原生的xhr对象  做以前做的所有事情
        //                 var xhr = jQuery.ajaxSettings.xhr();
        //                 xhr.upload.onload = function () {
        //                     console.log('上传完成隐藏进度条');
        //                     $('.progressText').text('上传完成')
        //                     // setTimeout(function(){
        //                     $('#progress')[0].style.display = 'none';
        //                     $('.progress-bar')[0].style.width = '0%';
        //                     $('.progressText').text('进度: 0%');
        //                     // },500);
        //                 };
        //                 xhr.upload.onprogress = function (ev) {
        //                     if ($('#progress')[0].style.display == 'none') {
        //                         $('#progress')[0].style.display = 'block';
        //                     } else {
        //                         // console.log(((ev.loaded / ev.total) * 100).toFixed(0) + '%', 'ev');
        //                         //显示进度条
        //                         $('.progress-bar')[0].style.width = ((ev.loaded / ev.total) * 100).toFixed(0) + '%';
        //                         $('.progressText').text('进度: ' + ((ev.loaded / ev.total) * 100).toFixed(0) + '%')
        //                     }
        //                 };
        //                 return xhr;
        //             },
        //             success: function (res) {
        //                 //返回在线图片地址
        //                 var type = res.substring(res.length - 3, res.length);
        //                 if (type == 'jpg' || type == 'png' || type == 'gif' || type == 'peg' || type == 'JPG' || type == 'PNG' || type == 'PEG' || type == 'GIF') {
        //                     $('#editor_box').css("display", "block")
        //                     appendImage(res);
        //                 } else {//认为是视频
        //                     var videoDiv = $("<video class='upload_box_video' />").attr('src', res);
        //                     upload_video_pic(res, videoDiv)
        //                 }
        //             }
        //         });
        //     }
        // })

    })

    function upload_video_pic(videoPath, videoDiv) {
        var video;//video标签
        var scale = 0.8;//第一帧图片与源视频的比例
        //ｖｉｄｅｏ标签
        video = videoDiv[0];//赋值标签
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
                    $('#editor_box').css("display", "block")
                    appendVideo(videoPath, res);
                }
            });
        })
    }

    //点击图片append图片进入编辑框
    $('#image_box').on('click', '.upload_box_image', function (e) {
        $('#editor_box').css("display", "block")
        appendImage(e.currentTarget.src);
    })

    //点击视频append视频进入编辑框
    $('#image_box').on('click', '.upload_box_video', function (e) {
        console.log($(this).attr('cover'), '封面');
        $('#editor_box').css("display", "block")
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

    //添加文本 ---->  editor
    function appendText(text) {
        $('#editor_box').append(text);
    }

    document.getElementById('edit_div').addEventListener('focus', function () {
        $("#edit_div").css('line-height', 1.6)
        // $("#edit_div").css('color', 'black');
        $('.editor_position .delete').css('display', 'none')
        $('.editor_position').show();
        $('.editorCont').css({position: 'relative'})
        $('.editor_position').css({top: 'auto', right: $(this).offset().left, bottom: '54px'})
        for (var i = 0; i < $('.previewEditArea').length; i++) {
            $('.previewEditArea').eq(i).css('border', '1px solid #fff')
        }
        for (var i = 0; i < $('.editor_image').length; i++) {
            $('.editor_image').eq(i).css({border: '1px solid #fff'})
        }
    })

    function settingStyles(O) {
        //首行缩进
        if (O.css('text-indent') == '0px') {
            $('#align').removeClass('active')
        } else {
            $('#align').addClass('active')
        }
        if (O.css('font-weight') == '400') {
            $('.B').removeClass('active')
        } else {
            $('.B').addClass('active')
        }
        if (O.css('font-style') == 'normal') {
            $('.I').removeClass('active')
        } else {
            $('.I').addClass('active')
        }
        if (O.css('text-decoration').indexOf('underline') == -1) {
            $('.U').removeClass('active')
        } else {
            $('.U').addClass('active')
        }
        $('.defaultColor').css({backgroundColor: O[0].style.color})
        if (O[0].style.fontSize == '') {
            $('#font_Size').html(18)
        } else {
            $('#font_Size').html(O[0].style.fontSize.split('px')[0])
        }
    }

    //可编辑标签文本点击事件
    $('.editor_box').on('click', '.previewEditArea', function () {

        var _this = $(this);
        $('.section').css('display', 'none')
        $('.editor_position_image').hide();
        for (var i = 0; i < $('.previewEditArea').length; i++) {
            $('.previewEditArea').eq(i).css('border', '1px solid #fff')
        }
        for (var i = 0; i < $('.editor_image').length; i++) {
            $('.editor_image').eq(i).css({border: '1px solid #fff'})
        }
        $(this).css({border: '1px solid #BCBCBC'});
        $('.delete').css('display', 'block');
        $('.left_line > div').css('width', '304px');
        $('.fontColor_cont').css('left', '-41px');
        $('.fontSize_cont').css('left', '-85px');
        $('.editor_position').show(200);

        $('.editor_position .left_line>div').hide();
        $('.font_btn').removeClass('active');

        $('.editor_position').css({top: $(this).offset().top - 20, bottom: 'auto'})
        $('.editorCont').css({position: 'static'})
        editor_this = this;
        //判断当前样式
        settingStyles(_this)

        //增加字体样式
        $('.font_num').removeClass('active')
        for (var i = 0; i < document.getElementsByClassName('font_num').length; i++) {
            if (document.getElementsByClassName('font_num')[i].innerHTML == $(this).css('font-size').substr(0, 2)) {
                $(document.getElementsByClassName('font_num')[i]).addClass('active')
            }
        }
    })

    //输入div双击｜单击操作
    $("#edit_div").on("click", function () {
        var _this = $(this);
        //可编辑标签文本点击事件
        editor_this = this;

        $("#edit_div").attr('contenteditable', 'true');
        if (this.innerHTML == '单击编辑内容') {
            this.innerHTML = ''
            $("#edit_div").focus();
        }
        $('.section').css('display', 'block');
        $('.left_line > div').css('width', '314px');
        $('.fontColor_cont').css('left', '-1px');
        $('.fontSize_cont').css('left', '-45px');
        $('.editor_position .left_line>div').hide();
        $('.font_btn').removeClass('active');
        $('.editor_position_image').hide();

        //判断当前样式
        settingStyles(_this)

        //增加字体样式
        $('.font_num').removeClass('active')
        for (var i = 0; i < document.getElementsByClassName('font_num').length; i++) {
            if (document.getElementsByClassName('font_num')[i].innerHTML == $(this).css('font-size').substr(0, 2)) {
                $(document.getElementsByClassName('font_num')[i]).addClass('active')
            }
        }
    });

    //图片标签 视频 点击事件
    $('.editor_box').on('click', '.editor_image,.editor_video', function (e) {
        $('.delete').css('display', 'block')
        $('.editor_position').hide();
        //清除上一个边框

        for (var i = 0; i < $('.previewEditArea').length; i++) {
            $('.previewEditArea').eq(i).css('border', '1px solid #fff')
        }
        for (var i = 0; i < $('.editor_image').length; i++) {
            $('.editor_image').eq(i).css({border: '1px solid #fff'})
        }
        $(this).css({border: '1px solid #BCBCBC', padding: '1px'});
        $('.editor_position_image').show(200);
        $('.editor_position_image').css({top: $(this).offset().top - 10})
        editor_this = this;

        if (Math.round($(this).css('width').substr(0, 3) / $(window).width() * 10) == 9) {
            console.log('100')
        } else if (Math.round($(this).css('width').substr(0, 3) / $(window).width() * 10) == 5) {
            console.log('50')
        } else {
            console.log('80')
        }

        //获取this当前宽度
        $('#image_width').val($(this).css('max-width').substring(0, $(this).css('max-width').length - 1))

        //获取当前图片是否为封面
        $('#checkCover')[0].checked = isSelectedForCover($(this).attr('cover'));
        console.log($(this).attr('cover'), 'cover');
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
            $(document).off('click');
        })

    })

    //分段
    $('#paragraph').on('click', function () {
        $(this).parents('.right_cont').find('.font_btn').removeClass('active');
        $('#font_Size').html(18)
        $('.defaultColor').css({backgroundColor: '#000'})
        $('#editor_box').css("display", "block")
        $(".icon_indent").attr("showFlag", "false")
        for (var i = 0; i < $('.dOrN').length; i++) {
            $('.dOrN').eq(i).hide()
            $('.dOrN').eq(i).attr("showFlag", "false")
        }

        var Dom = $('#edit_div').clone().removeAttr('id').attr('class', 'previewEditArea')[0]

        // //1.内容append
        appendText(Dom)

        //2.输入div清空，聚焦
        $('#edit_div').text('').attr('style', '').focus();
        //清除工具栏选中样式
        $('.fontSpan').removeClass('active');
    })

    //字体加粗
    $('.B').mousedown(function () {
        if ($(editor_this).css('font-weight') == 400) {
            $(editor_this).css({'font-weight': 900});
            $(this).addClass('active');
        } else {
            $(editor_this).css({'font-weight': 400});
            $(this).removeClass('active');
        }

        for (var i = 0; i < $('.dOrN').length; i++) {
            $('.dOrN').eq(i).hide()
            $('.dOrN').eq(i).attr("showFlag", "false")
        }

        if (event && event.preventDefault)
            event.preventDefault();
        //IE阻止默认事件
        else
            window.event.returnValue = false;
        return false;
    })

    //字体倾斜
    $('.I').mousedown(function () {
        console.log($(editor_this).css('font-style'));
        if ($(editor_this).css('font-style') == 'italic') {
            $(this).removeClass('active');
            $(editor_this).css({'font-style': 'normal'});
        } else {
            $(this).addClass('active');
            $(editor_this).css({'font-style': 'italic'});
        }

        for (var i = 0; i < $('.dOrN').length; i++) {
            $('.dOrN').eq(i).hide()
            $('.dOrN').eq(i).attr("showFlag", "false")
        }

        if (event && event.preventDefault)
            event.preventDefault();
        //IE阻止默认事件
        else
            window.event.returnValue = false;
        return false;
    })

    //字体下划线
    $('.U').mousedown(function () {
        var arr = $(editor_this).css('text-decoration').split(' ')
        if (arr[0] == 'none') {
            $(this).addClass('active');
            $(editor_this).css({'text-decoration': 'underline'});
        } else {
            $(this).removeClass('active');
            $(editor_this).css({'text-decoration': 'none'});
        }

        for (var i = 0; i < $('.dOrN').length; i++) {
            $('.dOrN').eq(i).hide()
            $('.dOrN').eq(i).attr("showFlag", "false")
        }

        if (event && event.preventDefault)
            event.preventDefault();
        //IE阻止默认事件
        else
            window.event.returnValue = false;
        return false;
    })

    //字号被点击
    $('.font_num').mousedown(function () {
        var _this = $(this);
        _this.parent().find('.fontSpan').removeClass('active');
        _this.addClass('active');
        $(editor_this).css({'font-size': this.innerText + 'px'});
        $('#font_Size').html(_this.html())

        for (var i = 0; i < $('.dOrN').length; i++) {
            $('.dOrN').eq(i).hide()
            $('.dOrN').eq(i).attr("showFlag", "false")
        }

        if (event && event.preventDefault)
            event.preventDefault();
        //IE阻止默认事件
        else
            window.event.returnValue = false;
        return false;
    })

    //色号被点击
    $('.color_word').mousedown(function () {
        $(editor_this).css({color: this.style.backgroundColor})

        for (var i = 0; i < $('.dOrN').length; i++) {
            $('.dOrN').eq(i).hide()
            $('.dOrN').eq(i).attr("showFlag", "false")
        }
        $('.defaultColor').css({backgroundColor: this.style.backgroundColor})

        if (event && event.preventDefault)
            event.preventDefault();
        //IE阻止默认事件
        else
            window.event.returnValue = false;
        return false;
    })

    //宽高比被点击
    $('#WorH').click(function () {
        if ($(".WorH").attr("showFlag") === 'false') {
            for (var i = 0; i < $('.dOrN').length; i++) {
                $('.dOrN').eq(i).hide()
                $('.dOrN').eq(i).attr("showFlag", "false")
            }
            $(this).addClass('active');
            $('.WorH').show();
            $(".WorH").attr("showFlag", "true")
        } else {
            $(this).removeClass('active');
            $('.WorH').hide();
            $(".WorH").attr("showFlag", "false")
        }
    })

    //宽高比数值被点击
    $('.ratio').click(function () {
        var _this = $(this);
        if (_this.hasClass('active')) {
            _this.removeClass('active');
        } else {
            _this.parent().children().removeClass('active');
            _this.addClass('active');
        }
        $(editor_this).css({'max-width': this.innerHTML});
        for (var i = 0; i < $('.dOrN').length; i++) {
            $('.dOrN').eq(i).hide()
            $('.dOrN').eq(i).attr("showFlag", "false")
        }
    })

    //首行缩进

    $('#align').mousedown(function () {
        var _this = $(this);
        if ($(".icon_indent").attr("showFlag") === 'false') {
            for (var i = 0; i < $('.dOrN').length; i++) {
                $('.dOrN').eq(i).hide()
                $('.dOrN').eq(i).attr("showFlag", "false")
            }
            _this.addClass('active');
            $(".icon_indent").attr("showFlag", "true")
        } else {
            _this.removeClass('active');
            $(".icon_indent").attr("showFlag", "false")
        }

        if ($(editor_this).css('text-indent') == '0px') {
            $(editor_this).css({'text-indent': '2em'});
        } else {
            $(editor_this).css({'text-indent': '0em'});
        }

        if (event && event.preventDefault)
            event.preventDefault();
        //IE阻止默认事件
        else
            window.event.returnValue = false;
        return false;
    })

    //格式
    $('#format').on('click', function () {
        var _this = $(this);
        _this.parents('.right_cont').find('.font_btn').removeClass('active');
        if ($(".formal_cont").attr("showFlag") === 'false') {
            for (var i = 0; i < $('.dOrN').length; i++) {
                $('.dOrN').eq(i).hide()
                $('.dOrN').eq(i).attr("showFlag", "false")
            }
            _this.addClass('active');
            $('.formal_cont').show()
            $(".formal_cont").attr("showFlag", "true")
        } else {
            _this.removeClass('active');
            $('.formal_cont').hide()
            $(".formal_cont").attr("showFlag", "false")
        }
    })

    //大小
    $('#font_Size').mousedown(function () {
        var _this = $(this);
        // _this.parents('.right_cont').find('.font_btn').removeClass('active');
        if ($(".fontSize_cont").attr("showFlag") === 'false') {
            for (var i = 0; i < $('.dOrN').length; i++) {
                $('.dOrN').eq(i).hide()
                $('.dOrN').eq(i).attr("showFlag", "false")
            }
            // _this.addClass('active');
            $('.fontSize_cont').show()
            $(".fontSize_cont").attr("showFlag", "true")
        } else {
            _this.removeClass('active');
            $('.fontSize_cont').hide()
            $(".fontSize_cont").attr("showFlag", "false")
        }

        if (event && event.preventDefault)
            event.preventDefault();
        //IE阻止默认事件
        else
            window.event.returnValue = false;
        return false;
    })

    //颜色

    $('#fontColor').mousedown(function () {
        var _this = $(this);
        // _this.parents('.right_cont').find('.font_btn').removeClass('active');
        if ($(".fontColor_cont").attr("showFlag") === 'false') {
            for (var i = 0; i < $('.dOrN').length; i++) {
                $('.dOrN').eq(i).hide()
                $('.dOrN').eq(i).attr("showFlag", "false")
            }
            _this.addClass('active');
            $('.fontColor_cont').show()
            $(".fontColor_cont").attr("showFlag", "true")
        } else {
            _this.removeClass('active');
            $('.fontColor_cont').hide()
            $(".fontColor_cont").attr("showFlag", "false")
        }

        if (event && event.preventDefault)
            event.preventDefault();
        //IE阻止默认事件
        else
            window.event.returnValue = false;
        return false;
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
                console.log('移除第k项');
                article.attacheMents.splice(k, 1);
            }
        }
    }

    function selectCover(attachmentPath, selected) {
        article.attacheMents.forEach(function (attachment) {
            if (attachmentPath == attachment.cover) {
                attachment.isMainCover = selected;
            }
        });
        console.log(article);
    }

    function isSelectedForCover(attachmentPath) {
        var attacheMents = article.attacheMents;
        for (var k in attacheMents) {
            if (attacheMents[k].cover == attachmentPath) {
                return attacheMents[k].isMainCover;
            }
        }
    }

    //发布事件
    $('#submit').on('click', function () {

        for (var i = 0; i < $('.previewEditArea').length; i++) {
            $('.previewEditArea').eq(i).css('border', '1px solid #fff')
        }
        for (var i = 0; i < $('.editor_image').length; i++) {
            $('.editor_image').eq(i).css({border: '1px solid #fff'})
        }

        var DomVal = $('#edit_div')[0].innerHTML
        if (DomVal !== '单击编辑内容' && DomVal.length != 0) {
            $('#editor_box').css("display", "block")
            var Dom = $('#edit_div').clone().removeAttr('id').attr('class', 'previewEditArea')[0]
            appendText(Dom)
            $('#edit_div').text('')
        }

        if ($('#title').val() == '') {
            layer.msg('标题不能为空!');
            return
        }

        if ($('#author').val() == '') {
            layer.msg('作者不能为空!');
            return
        }


        //取消p标签编辑事件 准备发布
        $('#editor_box > div').attr('contenteditable', 'false');
        // $('#editor_box > div')
        if ($('#editor_box').html() != '') {
            var data = {};
            data.method = 'mobile-submit';
            article.content = $('#editor_box').html();
            article.title = $('#title').val().replace(/\n/g, " ");
            article.author = $('#author').val();
            article.type = 1; //１发布
            data.article = article;
            // sendMessageTo(data);  //发送消息
            //发布  关闭窗口
            saveArticleInfo(data)
        } else {
            layer.msg('文章内容不能为空!');
        }
    })

    $('#checkCover').on('change', function (e) {
        if (e.currentTarget.checked) {  //设为封面
            selectCover($(editor_this).attr('cover'), true);
        } else {  //取消封面
            selectCover($(editor_this).attr('cover'), false);
        }
    })

    $('#closePanel').on('click', function () {
        console.log('后退')
    })

    $('.tagAddPanel_bg').on('click', function () {
        $('.picAddPanel').slideUp(function () {
            $(".tagAddPanel_bg").css('display', 'none');
        })
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

        } else if (res.method == 'clearRichTestSign') {
            //清空编辑器内容
            window.location.reload();
        }
    })

    //初始化页面元素
    function InitializePage() {
        $('.editor_position').hide();
        $('.editor_position_image').hide();
        $('#preview').hide();
        $('#title').val();
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

    function getLittleVideoUserById(id) {

        var param = {
            "method": 'getLittleVideoUserById',
            "uid": id,
        };

        WebServiceUtil.ApiYouYang(JSON.stringify(param), {
            onResponse: result => {
                if (result.success) {
                    loginUser = result.response
                }
            },
            onError: function (error) {
                // Toast.fail(error, 1);
            }
        });
    }

    function saveArticleInfo(article) {
        var article = article.article
        var imageList = [];
        var attacheMents = article.attacheMents;
        var newAttachMents = [];
        for (var k in attacheMents) {
            newAttachMents.push({
                userId: loginUser.uid,
                type: attacheMents[k].type == 'image' ? 0 : 1,
                path: attacheMents[k].path,
                coverPath: attacheMents[k].cover,
                isCover: attacheMents[k].isMainCover,
            })

            if (attacheMents[k].isMainCover) {
                imageList.push(attacheMents[k].cover);
            }
        }
        saveArticleInfoFinal(article.title, article.content, article.author, article.type, imageList, newAttachMents);
    }

    function saveArticleInfoFinal(title, html, author, type, imgArray, articleAttachments) {
        var param = {
            "method": 'saveArticleInfo',
            "articleInfoJson": {
                "userId": loginUser.uid,
                "schoolId": loginUser.schoolId,
                "gradeId": loginUser.gradeId,
                "status": type,
                "articleTitle": title,
                "articleContent": html,
                "author": author,
                "articleAttachments": WebServiceUtil.isEmpty(articleAttachments) ? [] : articleAttachments
            }
        };
        WebServiceUtil.ApiYouYang(JSON.stringify(param), {
            onResponse: result => {
                if (result.success) {
                    layer.msg('发布成功');
                    //关闭
                    setTimeout(function () {
                        var data = {
                            method: 'finish',
                        };
                        Bridge.callHandler(data, null, function (error) {
                            console.log(error);
                        });
                    }, 1000)
                } else {
                    layer.msg("发布失败");
                }
            },
            onError: function (error) {
                layer.msg(error, 1);
            }
        });
    }

})