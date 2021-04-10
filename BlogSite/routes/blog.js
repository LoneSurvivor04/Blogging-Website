var express = require("express");
var router  = express.Router();
var blog = require("../models/blog");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var geocoder = require('geocoder');
var { isLoggedIn, checkUserblog, checkUserComment, isAdmin } = middleware; // destructuring assignment

// Define escapeRegex function for search feature
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//INDEX - show all blog
router.get("/", function(req, res){
  if(req.query.search && req.xhr) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all blog from DB
      blog.find({name: regex}, function(err, allblog){
         if(err){
            console.log(err);
         } else {
            res.status(200).json(allblog);
         }
      });
  } else {
      // Get all blog from DB
      blog.find({}, function(err, allblog){
         if(err){
             console.log(err);
         } else {
            if(req.xhr) {
              res.json(allblog);
            } else {
              res.render("blog/index",{blog: allblog, page: 'blog'});
            }
         }
      });
  }
});

//CREATE - add new blog to DB
router.post("/", isLoggedIn, function(req, res){
  // get data from form and add to blog array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }

    var newblog = {name: name, image: image, description: desc, author:author};
    // Create a new blog and save to DB
    blog.create(newblog, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to blog page
            console.log(newlyCreated);
            res.redirect("/blog");
        }
    });
  });

//NEW - show form to create new blog
router.get("/new", isLoggedIn, function(req, res){
   res.render("blog/new"); 
});

// SHOW - shows more info about one blog
router.get("/:id", function(req, res){
    //find the blog with provided ID
    blog.findById(req.params.id).populate("comments").exec(function(err, foundblog){
        if(err || !foundblog){
            console.log(err);
            req.flash('error', 'Sorry, that blog does not exist!');
            return res.redirect('/blog');
        }
        console.log(foundblog)
        //render show template with that blog
        res.render("blog/show", {blog: foundblog});
    });
});

// EDIT - shows edit form for a blog
router.get("/:id/edit", isLoggedIn, checkUserblog, function(req, res){
  //render edit template with that blog
  res.render("blog/edit", {blog: req.blog});
});

// PUT - updates blog in the database
router.put("/:id", function(req, res){
 
    var newData = {name: req.body.name, image: req.body.image, description: req.body.description};
    blog.findByIdAndUpdate(req.params.id, {$set: newData}, function(err, blog){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/blog/" + blog._id);
		}
    });
  });

// DELETE - removes blog and its comments from the database
router.delete("/:id", isLoggedIn, checkUserblog, function(req, res) {
    Comment.remove({
      _id: {
        $in: req.blog.comments
      }
    }, function(err) {
      if(err) {
          req.flash('error', err.message);
          res.redirect('/');
      } else {
          req.blog.remove(function(err) {
            if(err) {
                req.flash('error', err.message);
                return res.redirect('/');
            }
            req.flash('error', 'blog deleted!');
            res.redirect('/blog');
          });
      }
    })
});

module.exports = router;

