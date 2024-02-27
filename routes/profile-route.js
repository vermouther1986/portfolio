const router = require("express").Router();
const Post = require("../modles/post-mode");
const authCheak = (req, res, next) => {
  // console.log(req.user);
  console.log(req.originalUrl);
  req.session.returnTo = req.originalUrl;
  if (!req.isAuthenticated()) {
    res.redirect("/auth/login");
  } else {
    next();
  }
};

router.get("/", authCheak, async (req, res) => {
  let postFound = await Post.find({ author: req.user._id });
  res.render("profile", { user: req.user, posts: postFound });
});
router.get("/post", authCheak, (req, res) => {
  res.render("post", { user: req.user });
});
router.post("/post", authCheak, async (req, res) => {
  console.log(req.body);
  let { title, content } = req.body;
  let newpost = await new Post({
    title,
    content,
    author: req.user._id,
  });
  try {
    newpost.save();
    res.status(200).redirect("/profile");
  } catch (err) {
    req.flash("error_msg", "both title and content are requirede");
    res.redirect("/profile/post");
  }
});
module.exports = router;
