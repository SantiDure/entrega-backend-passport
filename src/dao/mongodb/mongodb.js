import mongoose from "mongoose";

await mongoose.connect(
  "mongodb+srv://SantiDure:Sd232702@cluster0.gb6sgd5.mongodb.net/ecommerce"
);

export { productsManager } from "./models/Product.js";
export { cartsManager } from "./models/Cart.js";
