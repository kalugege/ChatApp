dotenv.config();
import express, { Router } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import {adminRouter} from './router/Admin'
import { router } from "./router/Usr";
import  path  from "path";
import multer from 'multer';
import { standardRouter } from "./router/StandardRouter";
const __dirname = path.resolve();
import expressBusboy from 'express-busboy';

const app = express();
app.use(cors());
const options = {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  maxIdleTimeMS: 270000,
  minPoolSize: 2,
  maxPoolSize: 4
}


app.use(express.static(path.join(__dirname, 'view')));
app.set('views', path.join(__dirname, 'view')); // this is the folder where we keep our pug files
app.set('view engine', 'pug');

mongoose
  .connect(process.env.MONGO_URL, options)
  .then((result) => {
    console.log("connect");
  })
  .catch((error) => {
    console.log("fail");

  });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// app.use(dataBase);

app.use("/", standardRouter);
app.use("/user", router);
app.use("/admin",adminRouter);


app.use((err, _req, res, next) => {
  if (err) {
    err.event = _req.event;
    console.error(err);
    if (err.message == "Method not supported.") {
      res.status(501).json({ message: err.message });
    } else {
      res.status(500).json({ message: "Internal error", key: "error" });
    }
  }
  next();
});
const serverPort = process.env.API_PORT || 1337;
app.listen(serverPort, () => {
  console.log(`server running on port: ${serverPort}`);
});
