import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GithubStrategy } from "passport-github2";
import { usersManager } from "../dao/mongodb/models/User.js";
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  COOKIE_OPTS,
  JWT_SECRET,
} from "../config.js";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { decrypt, encrypt } from "../utils/criptograph.js";

export async function appendJwtAsCookie(req, res, next) {
  try {
    const token = await encrypt(req.user);
    res.cookie("auth", token, COOKIE_OPTS);
    next();
  } catch (error) {
    next(error);
  }
}

export async function removeJwtFromCookies(req, res, next) {
  res.clearCookie("auth", COOKIE_OPTS);
  next();
}

passport.use(
  "jwt",
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromExtractors([
        function (req) {
          let token = null;
          if (req?.signedCookies) {
            token = req.signedCookies["auth"];
          }
          return token;
        },
      ]),
      secretOrKey: JWT_SECRET,
    },
    function loginUser(user, done) {
      // console.log(user)
      done(null, user);
    }
  )
);

export async function authenticate(req, res, next) {
  if (!req.token) {
    return res.status(401).json({
      error: "no access token provided",
    });
  }

  try {
    const decoded = await decrypt(req.token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      error: "authentication failed",
    });
  }
}

passport.use(
  "loginLocal",
  new LocalStrategy(
    {
      usernameField: "email",
    },
    async function verificationCallback(email, password, done) {
      try {
        const datosUsuario = await usersManager.login(email, password);
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
      let user = await usersManager.findOne({ email: profile.displayName });
      if (!user) {
        user = await usersManager.create({
          email: profile.email,
          first_name: profile.displayName,
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
