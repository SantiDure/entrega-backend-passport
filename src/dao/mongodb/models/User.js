import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { hashCompare } from "../../../utils/criptograph.js";

const collection = "users";

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: randomUUID },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
  },
  {
    strict: "throw",
    versionKey: false,
    statics: {
      login: async function (email, password) {
        let datosUsuario;

        if (email === "adminCoder@coder.com" && password === "adminCod3r123") {
          datosUsuario = {
            email: "admin",
            first_name: "admin",
            last_name: "admin",
            rol: "admin",
          };
        } else {
          const user = await mongoose
            .model(collection)
            .findOne({ email })
            .lean();

          if (!user) {
            throw new Error("login failed");
          }

          if (!hashCompare(password, user["password"])) {
            throw new Error("login failed");
          }

          datosUsuario = {
            email: user["email"],
            first_name: user["first_name"],
            last_name: user["last_name"],
            rol: "user",
          };
        }
        return datosUsuario;
      },
    },
  }
);

export const usersManager = mongoose.model(collection, userSchema);
