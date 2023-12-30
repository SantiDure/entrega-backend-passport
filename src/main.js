import express, { Router } from "express";
import handlebars from "express-handlebars";
import { apiRouter } from "./routers/api.router.js";
import { webRouter } from "./routers/web.router.js";
import { Server } from "socket.io";
import { productsManager } from "./dao/mongodb/mongodb.js";
import { messagesManager } from "./dao/mongodb/models/Message.js";
import { sesiones } from "./middlewares/sesiones.js";
import {
  passportInitialize,
  passportSession,
} from "./middlewares/autenticaciones.js";

const app = express();
app.use(sesiones);
app.use(passportInitialize, passportSession);
app.engine("handlebars", handlebars.engine());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

app.use("/api", apiRouter);

const PORT = 8080;

const server = app.listen(PORT, () =>
  console.log(`servidor levantado en el puerto ${PORT}`)
);

//WEBSOCKET
const websocketServer = new Server(server);
app.use("/static", express.static("./static"));
app.use("/", webRouter);
websocketServer.on("connection", async (socket) => {
  console.log(socket.id);
  //getProducts
  socket.emit("getProducts", await productsManager.find());

  //add
  socket.on(
    "addProduct",
    async ({ title, description, code, price, stock, category, thumbnail }) => {
      await productsManager.create({
        title,
        description,
        code,
        price,
        stock,
        category,
        thumbnail,
      });
      websocketServer.emit("getProducts", await productsManager.find());
    }
  );
  socket.on("disconnecting", () => {
    console.log(socket.id + " se fue");
  });
  //delete
  socket.on("deleteProduct", async (productID) => {
    await productsManager.deleteOne({ _id: productID });
    websocketServer.emit("getProducts", await productsManager.find());
  });

  //getMessage
  socket.emit("getMessages", await messagesManager.find());
  //addMessage
  socket.on("addMessage", async ({ nombreUsuario, emailUsuario, message }) => {
    await messagesManager.create({
      user: nombreUsuario,
      emailUser: emailUsuario,
      content: message,
    });
    websocketServer.emit("getMessages", await messagesManager.find());
  });
});
