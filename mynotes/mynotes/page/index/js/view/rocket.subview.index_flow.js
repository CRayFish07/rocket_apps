(function($){

rocket.subview.index_flow = rocket.subview.extend({

    el: '#index_page_flow'

    ,events: {
        'click .flow-item': 'onclick'
    }

    ,lineTemplate: _.template($('#template_index_flow').text())

    ,init: function(options){
        var me = this;

        me.contextNum = 99;
        me.model = new rocket.model.article_list(
            {}
            ,$.extend(
                {
                    contextNum: me.contextNum
                }
                , me.options
            )
        );

        me.isFirstLoad = true;

        me.$currentLine = null;

        me.showLoading(me.$el);

        me.scrollLock = 0;
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        ec.on('pagebeforechange', me.onpagebeforechange, me);

        me.model.on('change', me.onmodelchange, me);

        ec.on('keydown', me.onkeydown, me);
        ec.on('input', me.oninput, me); 

        me.registerScrollEvent();
    }

    ,render: function(model){
        var me = this,
            data = model.getData();

        me.$el.append(
            me.lineTemplate({
                articles: data 
            })
        );

        me.scrollLock = 0;

        if(me.isFirstLoad){
            me.isFirstLoad = false;
            me.hideLoading();
            // me.highlightFirstLine();
        }
    }

    ,onmodelchange: function(model, xhr){
        var me = this; 

        me.render(model);
    }

    ,onpagebeforechange: function(params){
        var me = this,
            ec = me.ec,
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == ec){
            if(me.isFirstLoad){
                me.model.fetch({
                    reqdata: {
                        from_article_id: 1
                        ,context_num: me.contextNum
                    }
                });
            }
            me.show();
        }
    }

    ,registerScrollEvent: function(){

        var me = this;

        $(window).on('scroll', function(){

            if (! me.ec.isActivePage()
                || me.scrollLock 
                || me.model.toEnd 
                ){
                return;
            }

            me.scrollLock = 1;

            var body = document.body,
                scrollTop = body.scrollTop,
                scrollHeight = body.scrollHeight,
                clientHeight = body.clientHeight;

            if (scrollTop + clientHeight > scrollHeight - 100) {
                me.getMoreNext();
            }
            else {
                me.scrollLock = 0;
            }

            // console.log( scrollHeight, clientHeight, scrollTop); 
        });

    }

    ,oninput: function(params){
        console.log(params);
        this.doFilter(params.text);
    }

    ,getRegExp: function(str){
        var reg = str;
        if(reg) {
            reg = reg.replace(/[*?\[\]{}\\.|-]/g, '\\$&');
        }
        else {
            reg = '[\\s\\S]*';
        }
        return new RegExp(reg, 'gi');
    }

    ,doFilter: function(filter){
        var me = this,
            reg = me.getRegExp(filter);;

        me.$('.flow-item').each(function(index, item){
            var $item = $(item);
            if(reg.test($item.text())){
                $item.show();
                console.log('show: ', $item.text());
            }
            else {
                $item.hide();
                console.log('hide: ', $item.text());
            }
        });
    }

    ,onclick: function(e){
        var $target = $(e.target).closest('.flow-item'); 
        this.goArticle($target.data('note-id'));
    }

    ,onkeydown: function(params){
        var me = this,
            e = params.event,
            key = e.which,
            hit = false; 

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

            // "o" key down
            case 79:
                hit = true;
                me.goArticle();
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

            // "/" key down
            case 191:
                hit = true;
                me.startSearch();
                break;

            // "d" key down
            case 68:
                if(e.ctrlKey){
                    hit = true;
                    me.goNextFrame();
                }
                break;

            // "u" key down
            case 85:
                if(e.ctrlKey){
                    hit = true;
                    me.goPrevFrame();
                }
                break;

        }

        if(hit){
            e.preventDefault();
            e.stopPropagation();
        }
    }

    ,getMoreNext: function(){
        var me = this,
            $lastLine = me.$('.flow-item').last(),
            articleID = 0; // 1-based

        if($lastLine.length){
            articleID = $lastLine.data('note-id');
        }

        me.model.fetch({
            reqdata: {
                from_article_id: articleID - 0 + 1 
                ,context_num: me.contextNum
            }
        });
    }

    ,goArticle: function(noteId){
        var me = this;

        me.navigate([
            '#article'
            ,'/'
            ,noteId
        ].join(''));
    }

    ,startSearch: function(){
        var me = this; 
        me.ec.trigger('startsearch');
    }

});

})(Zepto);
