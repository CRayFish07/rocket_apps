(function($){

/**
 * 提供层级导航需要的数据结构和API接口
 * 由于记录了完整的用户的浏览轨迹，后续可用于用户浏览轨迹的数据分析
 */
rocket.globalview.searchbox = rocket.globalview.extend({

    el: '#globalview_searchbox'

    , init: function(options){
        var me = this;

        me.append(new rocket.subview.ui_searchbox(
            $.extend({}, options)
            , me
        ));
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec,
            keydownLocking = false;

        me.on('routechange', me.onroutechange, me);
        me.on('commitsearch', me.oncommitsearch, me);

        $(document).on('keydown', function(e){
            if(
                // @note: omit form keydown
                $(e.target).closest('form').length == 0
                && !keydownLocking ){

                keydownLocking = true;

                var key = e.which;
                // "/" key down
                if(191 == key) {
                    me.show();
                    ec.trigger('startsearch');
                }

                setTimeout(function(){
                    keydownLocking = false;
                }, 100);
            }
        });
    }

    ,onroutechange: function(params){
        var me = this,
            from = params.from || null,
            to = params.to || null,
            fromAction = from && from.action || null,
            toAction = to && to.action || null,
            pageviews = params.pageviews;

        if(to){
            // 每次路由变化，均记录route信息
            // me.addRoute();
            // me.showRouteTrail();
        }
    }

    , oncommitsearch: function(){
        var me = this;
        me.hide();
    }

});

})(Zepto);


