import { Router } from "express";
import { onlySessionActive } from "../middlewares/autorizaciones.js";
import passport from "passport";
export const sessionRouter = Router();

sessionRouter.post(
  "/",
  passport.authenticate("loginLocal", {
    failWithError: true,
  }),
  async (req, res, next) => {
    res.status(201).json({ status: "success", message: "login success" });
  },
  (error, req, res, next) => {
    res.status(401).json({ status: "error", message: error.message });
  }
);
sessionRouter.get("/githublogin", passport.authenticate("loginGithub"));

sessionRouter.get(
  "/githubcallback",
  passport.authenticate("loginGithub", {
    successRedirect: "/profile",
    failureRedirect: "/login",
  })
);

sessionRouter.get("/current", onlySessionActive, (req, res) => {
  res.json(req.user);
});
sessionRouter.delete("/current", async (req, res) => {
  req.session.destroy((err) => {
    res.status(204).json({ message: "logout success" });
  });
});
