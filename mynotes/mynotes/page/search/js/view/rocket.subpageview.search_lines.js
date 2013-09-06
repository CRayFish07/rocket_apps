(function($){

rocket.subpageview.search_lines = rocket.subpageview.extend({

    className: 'search-page-lines'

    ,lineTemplate: _.template($('#template_search_lines').text())

    ,init: function(options){
        var me = this;

        me.keywords = options.keywords;

        me.model = new rocket.model.search_notes(
            {}
            ,$.extend({}, me.options)
        );

        me.isFirstLoad = true;
        me.contextNum = 1;
        me.countPerRequest = 20;

        me.$currentLine = null;

        me.total = 0;

        // 适用于翻页模式
        me.currentFirst = 1;

        // 适用于无限下拉模式
        me.currentLast = 0;

        me.showLoading(me.$el);
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        me.model.on('change', me.onmodelchange, me);
    
        ec.on('keydown', me.onkeydown, me);
    }

    ,unregisterEvents: function(){
        var me = this,
            ec = me.ec;
        
        me.model.off('change', me.onmodelchange, me);
    
        ec.off('keydown', me.onkeydown, me);
    }

    ,render: function(model){
        var me = this,
            lines = model.getLines(),
            total = me.total,
            reqCount = me.countPerRequest,
            totalPages = Math.ceil(total / reqCount);

        mynotes.helper.highlight(me.keywords, lines);

        me.$el.html(
            me.lineTemplate({
                lines: lines 
            })
        );

        if(me.isFirstLoad){
            me.isFirstLoad = false;
            me.ec.trigger('pageinfochange', {
                total: totalPages 
                ,current: 1
            });
        }

        me.hideLoading(500);
        me.highlightFirstLine();
        me.scrollIntoView();


        /** 无限下拉模式适用
        me.$el.append(
            me.lineTemplate({
                lines: lines 
            })
        );

        if(me.isFirstLoad){
            me.isFirstLoad = false;
            me.hideLoading();
            me.highlightFirstLine();
        }
        */
    }

    ,onmodelchange: function(model, xhr){
        var me = this; 

        var curLast = me.currentLast,
            reqCount = me.countPerRequest,
            retCount = model.getLines().length;

        me.total = model.getTotal();

        // @note: 无限下拉模式
        me.currentLast = retCount < reqCount 
            ? curLast + retCount 
            : curLast + reqCount;

        // console.log([
        //     me.total
        //     ,me.currentLast
        // ].join('_'));

        me.render(model);
    }

    ,onsubpagebeforechange: function(params){          
        var me = this,                                 
            from = params.from,                        
            to = params.to,                            
            param = params.params,                     
            featureString = me.getFeatureString(param);

        if(to == me.ec                                 
            && featureString == me.featureString){     
                                                       
            if(me.isFirstLoad){                        
                me.model.fetch({
                    reqdata: {
                        key_words: me.keywords 
                        ,context_num: me.contextNum
                        ,from: 1 
                        ,count: me.countPerRequest 
                    }
                });
            }
          
            // @note: 平滑子页面，显示不隐藏
            me.$el.show();                             
        }
  
    }

    ,onkeydown: function(params){
        var me = this,
            e = params.event,
            targetSubpage = params.targetSubpage,
            key = e.which,
            hit = false; 

        if(me != targetSubpage
            || !me.isActiveSubpage()){
            return;
        }

        switch(key){
            // "g" key down
            case 71:
                hit = true;
                if(e.shiftKey){
                    me.goLast();
                }
                else{
                    me.goFirst();
                }
                break;

            // "h" key down
            case 72:
                hit = true;
                me.goArticleList();
                break;

            // "o" key down
            case 79:
                hit = true;
                me.goNotes();
                break;

            // "j" key down
            case 74:
                hit = true;
                me.goDown();
                break;

            // "k" key down
            case 75:
                hit = true;
                me.goUp();
                break;

            // ", | <" key down
            case 188:
                hit = true;
                me.goPrevPage();
                break;

            // ". | >" key down
            case 190:
                hit = true;
                me.goNextPage();
                break;

            // "/" key down
            case 191:
                hit = true;
                me.startSearch();
                break;

        }

        if(hit){
            e.preventDefault();
            e.stopPropagation();
        }
    }

    ,highlightFirstLine: function(){
        var me = this,
            $lines = me.$('.line'),
            $firstLine = $lines.first();

        if($firstLine.length){
            me.$currentLine 
                && me.$currentLine.removeClass('current-line');
            $firstLine.addClass('current-line');
            me.$currentLine = $firstLine;
        }
    }

    ,highlightLastLine: function(){
        var me = this,
            $lines = me.$('.line'),
            $lastLine = $lines.last();

        if($lastLine.length){
            me.$currentLine 
                && me.$currentLine.removeClass('current-line');
            $lastLine.addClass('current-line');
            me.$currentLine = $lastLine;
        }
    }

    ,highlightNextLine: function(){
        var me = this,
            $lines = me.$('.line');
            $currentLine = me.$currentLine;

        if(!$currentLine){
            return;
        }

        var $nextLine = $currentLine.next();

        if($nextLine.length){
            $currentLine.removeClass('current-line');
            $nextLine.addClass('current-line');
            me.$currentLine = $nextLine;
        }
    }

    ,highlightPrevLine: function(){
        var me = this,
            $lines = me.$('.line');
            $currentLine = me.$currentLine;

        if(!$currentLine){
            return;
        }

        var $prevLine = $currentLine.prev();

        if($prevLine.length){
            $currentLine.removeClass('current-line');
            $prevLine.addClass('current-line');
            me.$currentLine = $prevLine;
        }
    }

    ,goFirst: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }

        me.highlightFirstLine();
        me.scrollIntoView();
    }

    ,goLast: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }

        me.highlightLastLine();
        me.scrollIntoView();
    }

    ,goDown: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }

        me.highlightNextLine();
        me.scrollIntoView();

        if(me.isArrivingEnd('next')){
            console.log('arriving tail...');

            // @note: 暂关闭无限下拉模式，使用分页方式
            // me.getMoreNext();
        }
    }

    ,goUp: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }

        me.highlightPrevLine();
        me.scrollIntoView();

        if(me.isArrivingEnd('prev')){
            console.log('arriving head...');
            // me.getMorePrev();
        }
    }

    ,scrollIntoView: function(){
        var me = this;

        if(!me.$currentLine){
            return;
        }
        
        var $line = me.$currentLine, 
            viewHeight = me.$el.height(),
            viewScrollTop = me.el.scrollTop,
            lineTop = $line[0].offsetTop,
            lineHeight = $line.height();

        // console.log([
        //     viewHeight
        //     ,viewScrollTop
        //     ,lineTop
        //     ,lineHeight
        // ].join('_'));

        // @note: 当前行向下跑出视口
        if(lineTop + lineHeight > viewHeight + viewScrollTop){
            me.el.scrollTop = lineTop + lineHeight - viewHeight;
        }
        // @note: 当前行向上跑出视口
        else if(lineTop < viewScrollTop){
            me.el.scrollTop = lineTop;
        }

    }

    // 是否接近两端
    ,isArrivingEnd: function(direction){
        var me = this,
            $currentLine = me.$currentLine, 
            i = 3;

        if(!$currentLine.length
            || direction != 'prev'
                && direction != 'next'){
            return false;
        }

        while(i > 0){
            $currentLine = $currentLine[direction]();   
            if($currentLine.length == 0){
                break;
            }
            i--;
        } 

        // 距两端3行时触发
        if(i == 1){
            return true;
        }
        return false;
    }



    /** 
     * 以下方法适用于翻页模式: goPage, goNextPage, goPrevPage
     */
    ,goPage: function(pageNo){
        var me = this,
            total = me.total,
            reqCount = me.countPerRequest,
            totalPages = Math.ceil(total / reqCount);

        // @todo: mutex

        if(pageNo > totalPages){
            console.log('exceeds pages boundary');
            return;
        }

        me.showLoading(me.$el);
        me.model.fetch({
            reqdata: {
                key_words: me.keywords 
                ,context_num: me.contextNum
                ,from: (pageNo - 1) * reqCount + 1 
                ,count: reqCount 
            }
            ,success: function(){
                me.currentFirst = ( pageNo - 1 ) * reqCount + 1;

                me.ec.trigger('pageinfochange', {
                    total: totalPages 
                    ,current: pageNo
                });
            }
        });
    }

    ,goNextPage: function(){
        var me = this,
            total = me.total,
            curFirst = me.currentFirst,
            reqCount = me.countPerRequest,
            totalPages = Math.ceil(total / reqCount),
            pageNo = Math.floor(curFirst / reqCount) + 1;

        if(curFirst + reqCount > total){
            console.log('no next page');
            return;
        }
        
        me.goPage(pageNo + 1);
    }

    ,goPrevPage: function(){
        var me = this,
            total = me.total,
            curFirst = me.currentFirst,
            reqCount = me.countPerRequest,
            totalPages = Math.ceil(total / reqCount),
            pageNo = Math.floor(curFirst / reqCount) + 1;

        if(curFirst - reqCount < 1){
            console.log('no prev page');
            return;
        }
        
        me.goPage(pageNo - 1);
    }


    
    /** 
     * 以下方法适用于无限下拉模式: getMoreNext 
     */
    ,getMoreNext: function(){
        var me = this,
            curLast = me.currentLast;

        if(curLast >= me.total){
            console.log('no more lines');
            return;
        }

        me.model.fetch({
            reqdata: {
                key_words: me.keywords 
                ,context_num: me.contextNum
                ,from: curLast + 1 
                ,count: me.countPerRequest 
            }
        });
    }

    ,goArticleList: function(){
        var me = this;
        setTimeout(function(){
            me.navigate(
                '#index'
            );
        }, 500);
    }

    ,goNotes: function(){
        var me = this,
            $currentLine = me.$currentLine,
            innerLineNo = 1;

        if(!$currentLine){
            return;
        }

        innerLineNo = $currentLine.find('.inner-line-number')
            .text() - 0 + 1;

        setTimeout(function(){
            me.navigate([
                '#notes'
                , '/' + innerLineNo
                , '/' + encodeURIComponent(me.keywords)
            ].join(''));
        }, 500);
    }

    ,startSearch: function(){
        var me = this; 
        me.ec.trigger('startsearch');
    }

});

})(Zepto);