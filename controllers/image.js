var fs = require('fs'),
    path = require('path'),
    sidebar = require('../helpers/sidebar'),
    Models = require('../models'),
    md5 = require('MD5'),
    util = require('util');;

module.exports = {
  index: function(req, res){

    var viewModel = {
      image: {},
      comments: []
    };

    Models.Image.findOne({ filename: {$regex: req.params.image_id } },
       function(err, image){
         if(err) throw err;

         if(image){
           image.views = image.views + 1;
           viewModel.image = image;
           image.save();

          Models.Comment.find({ image_id: image._id}, {}, { sort: {'timestamp': 1 } }, 
            function(err, comments){
              if(err) throw err;

              viewModel.comments = comments;
              //res.render('image', viewModel);
              sidebar(viewModel, function(viewModel){
                res.render('image', viewModel);
              });
            });
         }else{
           res.redirect('/');
         }
       });
  },
  create: function(req, res){
    var saveImage = function(){
      var possible = 'abcdefghijklmnopqrstuvwxyz0123456789',
          imgUrl = '';

      for(var i = 0; i < 6; i++ ){
        imgUrl += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      Models.Image.find({ filename: imgUrl }, function(err, images) {
        if(images.length > 0) {
          saveImage();
        } else {
          /*console.log(`Path: ${req.files[0].path}`);
          console.log(`OriginalName: ${req.files[0].originalname}`);*/

          var tempPath = req.files[0].path,
              ext = path.extname(req.files[0].originalname).toLowerCase(),
              targetPath = path.resolve('./public/upload/' + imgUrl + ext);
          
          if(ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.gif') {
            fs.rename(tempPath, targetPath, function(err) {
              if(err) throw err;

            var newImg = new Models.Image({
              title: req.body.title,
              description: req.body.description,
              filename: imgUrl + ext
              });
              newImg.save(function(err, image){
                console.log(`Successfully inserted image ${image.filename}`);
                res.redirect('/images/' + image.uniqueId);
              });
            });
          } else {
            fs.unlink(tempPath, function(err) {
              if(err) throw err;

              res.json(500, {error: 'Only image files are allowed.'})
            });
          }          
        }
      });
    };
    saveImage();
  },
  like: function(req, res) {
    Models.Image.findOne({ filename: { $regex: req.params.image_id }}, 
      function(err, image) {
        if(!err && image) {
          image.likes = image.likes + 1;
          image.save(function(err) {
            if(err)
              res.json(err);
            else
              res.json({ likes: image.likes })
          });
        }
    });
  },
  comment: function(req, res) {
    Models.Image.findOne({ filename: { $regex: req.params.image_id} }, 
      function(err, image) {
        if(!err && image) {
          var newComment = new Models.Comment(req.body);
          newComment.gravatar = md5(newComment.email);
          newComment.image_id = image._id;
          //console.log(util.inspect(req.body, { compact: true, depth: 10, breakLength: 80 }));
          newComment.save(function(err, comment) {
            if(err) throw err;

            res.redirect('/images/' + image.uniqueId + '#' + comment._id);
          });
        }else {
          res.redirect('/');
        }
    });
  },
  remove: function(req, res) {
    Models.Image.findOne({ filename: { $regex: req.params.image_id } }, 
      function(err, image){
        if(err) throw err;

        console.log('Image found!', image);

        fs.unlink(path.resolve('./public/upload/' + image.filename), 
          function(err){
            if(err) throw err;

            console.log('image path', path.resolve('./public/upload/' + image.filename));

            Models.Comment.remove({ image_id: image._id }, 
                function(err) {
                  image.remove(function(err) {
                    if(!err)
                      res.json(true);
                    else 
                      res.json(false);
                  });
                });
          });
      });
  }
};