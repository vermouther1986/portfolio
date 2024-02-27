const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../modles/user-modles");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");
passport.serializeUser((user, done) => {
  console.log("serializeUser user now");
  done(null, user._id);
});
passport.deserializeUser((_id, done) => {
  console.log("deserializeUser user now");
  User.findById({ _id }).then((user) => {
    console.log("Found user");
    done(null, user);
  });
});
passport.use(
  new LocalStrategy((username, password, done) => {
    console.log(username, password);
    User.findOne({ email: username })
      .then(async (user) => {
        if (!user) {
          return done(null, false);
        }
        await bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            return done(done, false);
          }
          if (!result) {
            return done(null, false);
          } else {
            return done(null, user);
          }
        });
      })
      .catch((err) => {
        return done(null.false);
      });
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/redirect",
    },

    (accessToken, refreshToken, profile, done) => {
      console.log(profile);
      User.findOne({ googleID: profile.id }).then((founduser) => {
        if (founduser) {
          console.log("user areadly");
          done(null, founduser);
        } else {
          new User({
            name: profile.displayName,
            googleID: profile.id,
            email: profile.emails[0].value,
            thumbnail: profile.photos[0].value,
          })
            .save()
            .then((newsuser) => {
              console.log("create new user");
              done(null, newsuser);
            });
        }
      });
    }
  )
);
