(function($){

rocket.subpageview.article_lines 
    = rocket.subpageview.uibase_vimlikepage.extend({

    className: 'article-page-lines'

    ,lineTemplate: _.template($('#template_article_lines').text())

    ,init: function(options){
        var me = this;

        me.articleID = options.articleid;
        me.initialLine = options.line;

        me.model = new rocket.model.article(
            {}
            ,$.extend({}, me.options)
        );

        me.$el.addClass('markdown-body');

        me.isFirstLoad = true;
        // @note: request all lines of article
        me.contextNum = 0;

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
        
        // ec.on('pagebeforechange', me.onpagebeforechange, me);

        me.model.off('change', me.onmodelchange, me);

        ec.off('keydown', me.onkeydown, me);
    }

    ,render: function(model){
        var me = this,
            data = model.getData();

        me.$el.append(
            markdown.toHTML(
                me.lineTemplate({
                    lines: data[1]
                })
            )
        );

        me.hideLoading();
    }

    ,onmodelchange: function(model, xhr){
        var me = this; 

        me.render(model);
        me.ec.trigger('articleinfochange', { info: model.toJSON() } );
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
                me.model.fetch({});
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
                me.goBack();
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

    ,goBack: function(){
        var me = this;
        setTimeout(function(){
            history.back();
        }, 500);
    }

});

})(Zepto);
