const router = require("express").Router();
const passport = require("passport");
const User = require("../modles/user-modles");
const bcrypt = require("bcrypt");
// const flash = require("connect-flash");

router.get("/login", (req, res) => {
  res.render("login", { user: req.user });
});
router.get("/signup", (req, res) => {
  res.render("signup", { user: req.user });
});
router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/auth/login",
    failureFlash: "Wrong email or password",
  }),
  (req, res) => {
    if (req.session.returnTo) {
      let newpath = req.session.returnTo;
      req.session.returnTo = "";
      res.redirect(newpath);
    } else {
      res.redirect("/profile");
    }
    // res.redirect("/profile");
  }
);
router.post("/signup", async (req, res) => {
  console.log(req.body);
  let { name, email, password } = req.body;
  const exitemail = await User.findOne({ email });
  // if (exitemail) return res.status(400).send("email areadly exit");
  if (exitemail) {
    req.flash("error_msg", "email has areadly been registered");
    return res.redirect("/auth/signup");
  }
  const hash = await bcrypt.hash(password, 10);
  password = hash;
  const newuser = new User({
    name,
    email,
    password,
  });
  try {
    // const saveuser = await newuser.save();
    // res.status(200).send({
    //   message: "user saved",
    //   userdone: saveuser,
    // });
    await newuser.save();
    req.flash("success_msg", "Registration succeeds,you can login now");
    res.redirect("/auth/login");
  } catch (err) {
    // console.log(err.errors.name.properties.message);
    req.flash("error_msg", err.errors.name.properties.message);
    res.redirect("/auth/signup");

    // res.flash("error_msg","");
  }
});
router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);
router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
  if (req.session.returnTo) {
    let newpath = req.session.returnTo;
    req.session.returnTo = "";
    res.redirect(newpath);
  } else {
    res.redirect("/profile");
  }
  // res.redirect("/profile");
});
module.exports = router;
