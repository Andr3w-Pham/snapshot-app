const express = require("express");
const router = express.Router();
const passport = require("passport");

// use passport strategy
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"]
  })
);
// create a callback route
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
  
);

router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});


// export Router
module.exports = router;
