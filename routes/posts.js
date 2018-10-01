const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const multer = require('multer');
const path  = require('path');
// bring in the helper ensure authenticated function
const {ensureAuthenticated} = require('../helper/auth')
const User = mongoose.model('users');
const Post = mongoose.model('posts');

//////////////
// Create storage engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
}).array('myImage', 10);

// Check File Type
const checkFileType = (file, cb) => {
// Allowed ext
const filetypes = /jpeg|jpg|png|gif/;
// Check ext
const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
// Check mime
const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}
///////////////////////////////////////////////////////////////////////////////////////////////////
router.use(express.static('public'));

// // Upload to DB
router.post('/upload', (req, res) => {

  upload(req, res, (err) => {
    if (err) {
      console.log('error from upload fucntion')
      res.render('posts/new', {
        msg: err
      });
    } else {
      // res.send('test');
      if(req.files == undefined) {
        res.render('posts/new', {
          msg: 'Error: No file selected'
        });
      } else {
        // save to database
        let newPost = {
          files: req.files,
          user: req.user.id
        }
        new Post(newPost)
        .save()
        .then (posts => {
          console.log('posted')
          // console.log(blogs);
          res.redirect('/posts/index');
        })
      }
    }
  });
});

/////
router.get('/index', (req, res) => {
  Post.find()
  .populate('user')
  .sort({date: 'desc'})
   .then(posts => {
     console.log('found posts');
     console.log(posts);
     res.render('posts/index', {
       posts: posts
     });
   })
   .catch(err => console.log(err));
});

// End of upload to DB
///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
/////////////


// add form
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('posts/new')
})

//post route to save to the DB
// router.post('/', (req, res) => {

//     let newPost = {
//       title: req.body.title,
//       description: req.body.description,
//       // update user id to the post & saving that to the DB
//       files: req.files,
//       user: req.user.id
//     }

//     new Post(newPost)
//     .save()
//     .then(posts => {
//       console.log(posts)
//       res.redirect('/dashboard');
//     })
//     .catch(err => console.log(err));
  
// })

// Posts Index
// router.get('/index', (req, res) => {
//   Post.find()
//     .populate('user')
//     .sort({date: 'desc'})
//     .then(posts => {
//       res.render('posts/index', {
//         posts: posts
//       });
//     });
// });

router.get('/:id/edit', ensureAuthenticated, (req, res) => {
  Post.findById({
    _id: req.params.id
  })
  .then(post => {
    console.log(req.user.id);
    // if the post does not belong to logged in user
    if(post.user != req.user.id) {
      // redirect back to posts page
      req.flash("error_msg", "Access Denied");
      res.redirect('/posts/index');
    } else {
      console.log(post)
      res.render('posts/edit', {
         post: post
      });
    }
  })
  .catch(err => {
    console.log(req.user._id);
    console.log(err)
  })
});

router.put('/:id', (req, res) => {
  Post.findById({
    _id: req.params.id
  })
  .then(post => {
    // update the post with new values from the form
    post.title = req.body.title,
    post.description = req.body.description
    // save the updated post
    post.save()
      .then(() => res.redirect('/dashboard'))
      .catch((err) => console.log(err));
  });

});

router.get('/show/:id', (req, res) => {
  Post.findOne({
    _id: req.params.id
  })
  // bring in user info from collection to access image, firstname & lastname
  .populate('user')
  .then(post => {
    console.log(post);
    res.render('posts/show', {
      post:post
    })
  })
  .catch(err => console.log(err));
});

// List posts from a user
router.get('/user/:userId', (req, res) => {
  Post.find({user: req.params.userId})
    .populate('user')
    .then(posts => {
      res.render('posts/index', {
        posts:posts 
      })
    })
    .catch(err => console.log(err));
})

// Delete the post
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Post.findById({
    _id: req.params.id
  })
  .then(post => {
    console.log(req.user.id);
    // if the post does not belong to logged in user
    if(post.user != req.user.id) {
      // redirect back to posts page
      req.flash('error_msg', 'Access Denied');
      res.redirect('/posts/index');
      // else, delete only if current user's post
    } else {
      post.remove()
      .then(() => {
        req.flash('success_msg', 'You have successfully deleted the post');
        res.redirect('/dashboard');
      })
      .catch(err => {
        console.log(req.user.id);
        console.log(err)
      }) 
    }
  })
})

// ////////////////////////////////////////////////////////////////////////////////

module.exports = router;
