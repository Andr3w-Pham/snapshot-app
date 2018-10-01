const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('posts');


router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

router.get('/', (req, res) => {
  console.log(req.user);
  res.render('index/home')
});

router.get('/dashboard',(req, res) => {
  Post.find({user: req.user.id})
  .then(posts => {
    res.render('index/dashboard', {
      posts: posts
    });
  })
  .catch(err => console.log(err));
});

module.exports = router;