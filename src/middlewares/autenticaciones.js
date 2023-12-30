import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { usersManager } from "../dao/mongodb/models/User.js";
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
} from "../config.js";
passport.use(
  "loginLocal",
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async function verificationCallback(username, password, done) {
      try {
        const datosUsuario = await usersManager.login(username, password);
        done(null, datosUsuario);
      } catch (error) {
        done(error);
      }
    }
  )
);

passport.use(
  "loginGithub",
  new GithubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
    },
    async (_, __, profile, done) => {
      let user = await usersManager.findOne({ email: profile.username });
      if (!user) {
        user = await usersManager.create({
          name: profile.displayName,
          email: profile.username,
        });
      }
      done(null, user.toObject());
    }
  )
);

passport.serializeUser((user, next) => {
  next(null, user);
});
passport.deserializeUser((user, next) => {
  next(null, user);
});

export const passportInitialize = passport.initialize();
export const passportSession = passport.session();
