var models = require('../models'),
    async = require('async');

module.exports = function(callback){

    async.parallel([
        function(next){
            models.Image.count({}, next);
        },
        function(next){
            models.Comment.count({}, next);
        },
        function(next){
           models.Image.aggregate([
               {
                    $group : {
                        _id: '1',
                         viewsTotal: { $sum : '$views' }
                    }
                }],
                function(err, result){
                    //console.log('views', result);
                    var viewsTotal = 0;
                    if(result != undefined && result.length > 0){
                        viewsTotal += result[0].viewsTotal;
                    }
                    next(null, viewsTotal);
            });
        },
        function(next){
            models.Image.aggregate([
                { 
                    $group : {
                    _id : '1', 
                    likesTotal : { $sum : '$likes' }}
                }], 
                function(err, result){
                    //console.log('likes', result);
                    var likesTotal = 0;
                    if(result != undefined && result.length > 0){
                        likesTotal += result[0].likesTotal;
                    }
                    next(null, likesTotal);
                });
        }
    ], function(err, results){
        //console.log('stats results', results);
        var stats = {
            images:   results[0],
            comments: results[1],
            views:    results[2],
            likes:    results[3] 
        }
        callback(null, stats);
    });
};