import mongoose from "mongoose";
import { MDB_CNX_STR } from "../../config.js";

export function connectDb() {
  mongoose.connect(MDB_CNX_STR);
  return console.log(`DB conectada a ${MDB_CNX_STR}`);
}

export { productsManager } from "./models/Product.js";
export { cartsManager } from "./models/Cart.js";
