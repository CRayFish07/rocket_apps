(function($){

rocket.subview.index_header_searchbox = rocket.subview.extend({

    el: '#index_page_header_searchbox'

    ,init: function(options){
        var me = this;

        /*
        me.appendTo(new rocket.subview.ui_searchbox(
            $.extend({}, options)
            ,me
        ), '#index_page_header_searchbox');
        */
        me.$input = me.$('input[type="text"]');
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        ec.on('pagebeforechange', me.onpagebeforechange, me);

        me.$input.on('keydown', function(e){
            e.stopPropagation();
        })
        .on('input', function(e){
            e.stopPropagation();
            ec.trigger('input', {text: me.$input.val()});
        });
    }

    ,render: function(model){
        var me = this;
    }

    ,onpagebeforechange: function(params){
        var me = this,
            ec = me.ec,
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == ec){
            me.show();
        }
    }

    ,onkeydown: function(e){
        var me = this,
            key = e.which; 

        switch(key){
            // "g" key down
            case 71:
                if(e.shiftKey){
                    me.goLast();
                }
                else{
                    me.goFirst();
                }
                break;

            // "0" key down
            case 79:
                me.goArticle();
                break;

            // "j" key down
            case 74:
                me.goDown();
                break;

            // "k" key down
            case 75:
                me.goUp();
                break;

        }
    }

});

})(Zepto);

