/**
 * Created by admin on 2017/3/6.
 */
$(function(){
    //设置吸顶
    var off_top = $('.nav').offset().top;
    $(window).on('scroll',function () {
        var scr_top = $(window).scrollTop();
        if(scr_top>=off_top){
            $('.nav').css({
                'position':'fixed',
                'top':0
            });
            $('.nav img').css({
                'opacity':1
            })
        }else {
            $('.nav').css({
                'position':'absolute',
                top:off_top
            });
            $('.nav img').css({
                'opacity':0
            })
        }
    });
    //设置返回顶部
    $(window).on('scroll',function(){
        var src_top = $(window).scrollTop();
           if( src_top >= off_top){
               $('.back_top').fadeIn(200);
           }else {
               $('.back_top').fadeOut(200);
           }
    });
    $('.back_top').on('click',function(){
        $('html body').animate({
            scrollTop : 0
        })
    });
    //添加li
    var itemArray;
    itemArray = store.get('itemArry')|| [];
    render_view();
    $('input[type=submit]').on('click',function(event){
        event.preventDefault();//去掉默认行为
        var in_content = $('input[type=text]').val();
        if ($.trim(in_content)==''){
            alert("请输入内容");
            return;
        }else{
            var item = {
                title : '',
                content : '',
                isClick : false,
                remind_time : '',
                is_notice : false
            };
            item.title = in_content;
            itemArray.push(item);
            render_view();
        }
    });
    function render_view(){
        store.set('itemArray',itemArray);
        $('.task').empty();
        $('.finish_task').empty();
        for(var i = 0;i<itemArray.length;i++){
            var obj = itemArray[i];
            if (obj == undefined ||!obj){//为了规范和严格要进行元素的判定
                continue;
            }
            var tag = '<li data-index='+ i +' >'+
                '<input type="checkbox"'+(obj.isCheck?'checked':'')+' >'+
                '<span class="item_title">'+ obj.title +' </span>'+
                '<span class="del">删除</span>'+
                '<span class="detail">详情</span>'+
                '</li>';
            if (obj.isCheck){
                $('.finish_task').prepend(tag);
            }else{
                $('.task').prepend(tag);
            }
        }
    }
    //切换
    $('.header li').click(function(){
        $(this).addClass('curr').siblings().removeClass('curr');
        var index = $(this).index();
        //切换底部的盒子
        $('.body').eq(index).addClass('active').siblings().removeClass('active');
    });
    $('body').on('click','.del',function(){
        var item = $(this).parent();
        var index = item.data('index');
        if (index == undefined || !itemArray[index])return;//为了代码严格，我们可以回索引进行判断
        delete itemArray[index];
        item.slideUp(400,function(){
            item.remove();
        });
        //储存数据
        store.set('itemArray',itemArray);
    });
    //点击待办事项，让对应的事项有待办变为已经完成
    $('body').on('click','input[type=checkbox]',function () {
        /*确定点击的索引*/
        var item = $(this).parent();
        var index = item.data('index');
        if (index == undefined || !itemArray[index])return;
        var obj = itemArray[index];
        obj.isCheck = $(this).is(':checked');
        itemArray[index] = obj;
        render_view();
    });
    //弹出详情页窗口
    var cur_index = 0;
    $('body').on('click','.detail',function(){
        $('.mask').fadeIn();
        var item = $(this).parent();
        var index = item.data('index');
        var obj = itemArray[index];
        $('.detail_header .title').text(obj.title);
        $('.detail_body textarea').val(obj.content);
        $('.detail_body input[type =text]').val(obj.remind_time);
    });
    $('.mask').click(function () {
        $(this).fadeOut();
    });
    $('.close').click(function () {
        $('.mask').fadeOut();
    });
    //阻止冒泡
    $('.detail_content').on('click',function(event){
        event.stopPropagation();
    });
    $.datetimepicker.setLocale('ch');
    $('#date_time').datetimepicker();
    //更新数据和界面
    $('.detail_body button').on('click',function(){
        var item = itemArray[cur_index];
        item.title = $('.detail_body textarea').val();
        item.remind_time = $('.detail_body input[type = text]').val();
        /*is_notice：表示有没有提醒去做对应事项*/
        item.is_notice = false;
        itemArray[cur_index] = item;
        store.set('itemArray',itemArray);
        render_view();
        $('.mask').fadeOut();
    });
    setInterval(function(){
        var cur_time = (new Date()).getTime();
        for(var i = 0;i < itemArray.length;i++){
            var item = itemArray[i];
            if(item==undefined||!item||item.remind_time.length<1||item.is_notice){
                continue
            };
            var rem_time = (new Date(item.remind_time)).getTime();
            //如果当前时间大于提醒时间，那么要有铃声提醒
            if(cur_time - rem_time >1){
                $('video').get(0).play();
                $('video').get(0).currentTime = 0;
                item.is_notice = true;
                itemArray[i] = item;
                store.set('itemArray',itemArray);
            }
        }
    },2000);

});
