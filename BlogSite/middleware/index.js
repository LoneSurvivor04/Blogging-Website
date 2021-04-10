var Comment = require('../models/comment');
var blog = require('../models/blog');
module.exports = {
  isLoggedIn: function(req, res, next){
      if(req.isAuthenticated()){
          return next();
      }
      req.flash('error', 'You must be signed in to do that!');
      res.redirect('/login');
  },
  checkUserblog: function(req, res, next){
    blog.findById(req.params.id, function(err, foundblog){
      if(err || !foundblog){
          console.log(err);
          req.flash('error', 'Sorry, that blog does not exist!');
          res.redirect('/blog');
      } else if(foundblog.author.id.equals(req.user._id) || req.user.isAdmin){
          req.blog = foundblog;
          next();
      } else {
          req.flash('error', 'You don\'t have permission to do that!');
          res.redirect('/blog/' + req.params.id);
      }
    });
  },
  checkUserComment: function(req, res, next){
    Comment.findById(req.params.commentId, function(err, foundComment){
       if(err || !foundComment){
           console.log(err);
           req.flash('error', 'Sorry, that comment does not exist!');
           res.redirect('/blog');
       } else if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
            req.comment = foundComment;
            next();
       } else {
           req.flash('error', 'You don\'t have permission to do that!');
           res.redirect('/blog/' + req.params.id);
       }
    });
  },
  isAdmin: function(req, res, next) {
    if(req.user.isAdmin) {
      next();
    } else {
      req.flash('error', 'This site is now read only thanks to spam and trolls.');
      res.redirect('back');
    }
  } 
}