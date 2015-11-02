fis.config.merge({
    roadmap : {
        path : [
            {
                reg : /^\/.+-aio.*\.css$/i,
                release : "/static$&"
            },
            {
                reg : /^\/.+-aio.*\.js$/i,
                release : "/static$&"
            },
            {
                reg : /^\/.*markdown\.js$/i,
                release : "/static$&"
            },
            {
                reg : /^\/.*bootstrap(-theme)?\.min\.css$/i,
                release : "/static$&"
            },
            {
                reg : /^\/.+\.(png|gif|jpg|jpeg)$/i,
                release : "/static$&"
            },
            {
                reg : /^\/mynotes\/\w+\.html$/i,
                release : '/template$&'
            }
        ]
    }
});

fis.config.del('modules.optimizer.html');
