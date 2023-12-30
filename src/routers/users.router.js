import { Router } from "express";
import { usersManager } from "../dao/mongodb/models/User.js";
import { hashear } from "../utils/criptograph.js";

export const usersRouter = Router();

usersRouter.post("/", async (req, res) => {
  try {
    req.body.password = hashear(req.body.password);
    const user = await usersManager.create(req.body);
    res.status(201).json({ status: "succes", payload: user });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

usersRouter.put("/", async function (req, res) {
  try {
    if (req.body.password) {
      req.body.password = hashear(req.body.password);
    }

    const updated = await usersManager.findOneAndUpdate(
      { email: req.body.email },
      { $set: req.body },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ status: "error", message: "usuario no encontrado" });
    }

    res.json({ status: "success", payload: updated });
  } catch (error) {
    res.status(400).json({ status: "error", message: error.message });
  }
});
