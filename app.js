// requires express package
const express = require('express');
const app = express();
//handlebar package to render views
const exphbs  = require('express-handlebars');

// mongoose
const mongoose = require('mongoose');

// require body parser to parse through the form content
const bodyParser = require('body-parser');
// image uploader start
// const multer = require('multer');
// const path  = require('path');
// image uploader end
const methodOverride = require('method-override');
//use express-session to maintain a user's session.
const session = require('express-session');

// flash messages
const flash = require('connect-flash');

const passport = require('passport');

// bring in the helper ensure authenticated function
const {ensureAuthenticated} = require('./helper/auth')

const db = require('./config/database')
// if on production use production port else use 3000
const port = process.env.PORT || 3000;

// Load routes
const users = require('./routes/users');
const posts = require('./routes/posts');
// Load passport config
require('./config/passport')(passport);

// ///////////////////////////////////////////////////////////////////////////////
// // Set The Storage Engine
// const storage = multer.diskStorage({
//   destination: './public/uploads/',
//   filename: (req, file, cb) => {
//     cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   }
// });

// // Init Upload
// const upload = multer({
//   storage: storage,
//   limits:{fileSize: 1000000},
//   fileFilter: (req, file, cb) => {
//     checkFileType(file, cb);
//   }
// }).array('myImage', 10);

// // Check File Type
// const checkFileType = (file, cb) => {
//   // Allowed ext
//   const filetypes = /jpeg|jpg|png|gif/;
//   // Check ext
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   // Check mime
//   const mimetype = filetypes.test(file.mimetype);

//   if(mimetype && extname){
//     return cb(null,true);
//   } else {
//     cb('Error: Images Only!');
//   }
// }
// ///////////////////////////////////////////////////////////////////////////////////////////////////



// connect to the mongo // Db
mongoose.connect(db.mongoURI, {useNewUrlParser: true})
.then(() => console.log('Connected to DB'))
.catch((err) => console.log(err));



//////////////////////////////////////////////////////////////
// ALL Middlewaress Starts here
// middleware for static css files
app.use(express.static('public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// middleware for express handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// override with POST having ?_method=DELETE
app.use(methodOverride('_method'));


// express-session middleware must always be placed BEFORE! passport middleware
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'secure',
  resave: false,
  saveUninitialized: true
}))

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// middleware for flash messages
app.use(flash());

app.use((req, res, next) => {
  // Declare a global variable for success msg
  res.locals.success_msg = req.flash('success_msg');
  //Declare a global variable for error msg
  res.locals.error_msg = req.flash('error_msg');
  //Declare a global variable for user
  res.locals.user = req.user;
  next();
})

// End of all Middlewares
////////////////////////////////////////////////////////////////////////////////
app.get('/', (req, res) => {
  // res.send('Hello World!');
  res.render('home');
});
// About page
app.get('/about', (req, res) => {
  // res.send('about');
  res.render('about');
});
////////////////////////////////////////////////////////////////////////////////


// Whenever you hit a route called /users it goes and look for the variable users [const users = require('./routes/users')]
app.use('/users', users);
app.use('/posts', posts);

///////////////////////////////////////////////////////////////////////////////

// Upload Image Locally
// app.post('/upload', (req, res) => {
//   upload(req, res, (err) => {
//     if(err){
//       res.render('home', {
//         msg: err
//       });
//     } else {
//
//         console.log(req.files)
//         res.render('home', {
//           msg: 'File Uploaded!',
//           files: req.files
//         });
//
//     }
//   });
// });


// start a server
app.listen(port, () => console.log(`Server started on port ${port}`));

///////////////////////////////////////////////////////////////////////////////
