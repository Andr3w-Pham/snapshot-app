const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
// image uploader start
const multer = require('multer');
// const GridFsStorage = require('multer-gridfs-storage');
// const Grid = require('gridfs-stream');
// const db = require('./config/database');
const path  = require('path');
// image uploader end

// bring in the helper ensure authenticated function
const {ensureAuthenticated} = require('../helper/auth')

// Require model
require('../models/Post')
// Create user model
const Post = mongoose.model('posts');

///////////////////////////////////////////////////////////////////////////////
// Set The Storage Engine
// Create mongo connection
// const conn = mongoose.createConnection(db.mongoURI);

// Init gfs
// let gfs;

// conn.once('open', () => {
//   // Init stream
//   gfs = Grid(conn.db, mongoose.mongo);
//   gfs.collection('uploads');
// });

// Create storage engine
// const storage = new GridFsStorage({
//   url: mongoURI,
//   file: (req, file) => {
//     return new Promise((resolve, reject) => {
//       crypto.randomBytes(16, (err, buf) => {
//         if (err) {
//           return reject(err);
//         }
//         const filename = buf.toString('hex') + path.extname(file.originalname);
//         const fileInfo = {
//           filename: filename,
//           bucketName: 'uploads'
//         };
//         resolve(fileInfo);
//       });
//     });
//   }
// });
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

// add form
router.get('/new', ensureAuthenticated, (req, res) => {
  res.render('posts/new')
})

//post route to save to the DB
router.post('/', (req, res) => {
  console.log('in the post route');
  console.log(req.body);
  // res.send('ok');
  let errors = [];
  if (!req.body.title) {
    errors.push({text: "Title must be present"});
  }
  if (!req.body.description) {
    errors.push({text: "Description must be present"});
  }
  if (errors.length > 0) {
    res.render('posts/new', {
      title: req.body.title,
      description: req.body.description,
      errors: errors,
    });

  } else {
    // save to db
    // res.send('passed');
    let newPost = {
      title: req.body.title,
      description: req.body.description,
      // update user id to the post & saving that to the DB
      user: req.user.name
    }
    new Post(newPost)
    .save()
    .then(posts => {
      console.log(posts)
      res.redirect('/posts/index');
    })
    .catch(err => console.log(err));
  }
})
// show all posts from database
router.get('/index', (req, res) => {
  Post.find()
  .then(posts => {

    console.log(posts);
    res.render('posts/index', {
      posts:posts
    });
  })
  .catch(err => console.log(err));
});

router.get('/:id/edit', ensureAuthenticated, (req, res) => {
  Post.findById({
    _id: req.params.id
  })
  .then(post => {
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
      .then(() => res.redirect('/posts/index'))
      .catch((err) => console.log(err));
  });

});

// Delete the post
router.delete('/:id', ensureAuthenticated, (req, res) => {
  Post.findById({
    _id: req.params.id
  })
  .then(post => {
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
        res.redirect('/posts/index');
      })
      .catch(err => console.log(err));
    }
  })
})
///////////////////////////////////////////////////////////////////////////////
// Upload to DB
// router.post('/upload', (req, res) => {

//   upload(req, res, (err) => {
//     if (err) {
//       console.log('error')
//       res.render('home', {
//         msg: err
//       });
//     } else {
//       // res.send('test');
//       if(req.body.files == undefined) {
//         res.render('home', {
//           msg: 'Error: No file selected'
//         });
//       } else {
//         // save to database
//         let newPost = {
//           files: req.body.files
//         }
//         new Post(newPost)
//         .save()
//         .then (posts => {
//           console.log(posts);
//           res.redirect('/');
//         })
//       }
//     }
//   });
// });

///////////////////////////////////////////////////////////////////////////////
router.get('/upload', (req, res) => {
  // res.send('Hello World!');
  res.render('upload');
});
// Upload Image Locally
router.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err){
      res.render('home', {
        msg: err
      });
    } else {

        console.log(req.files)
        res.render('home', {
          msg: 'File Uploaded!',
          files: req.files
        });

    }
  });
});

////////////////////////////////////////////////////////////////////////////////

module.exports = router;
