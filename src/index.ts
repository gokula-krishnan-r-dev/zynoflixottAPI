import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import routor from "./routes/router";
import Chat from "./Chat";
import bodyParser from "body-parser";
dotenv.config();

const MONGODB_URI =
  "mongodb+srv://gokula2323:wqSbxeNfSxVd1eyw@cluster0.vd91zsm.mongodb.net/ott?retryWrites=true&w=majority";
// "mongodb+srv://gokul:UPw3fCb6kDmF5CsE@cluster0.klfb9oe.mongodb.net/ott?retryWrites=true&w=majority"
mongoose.connect(MONGODB_URI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
});

dotenv.config();
const connectToMongoDB = mongoose.connection;

connectToMongoDB.on(
  "error",
  console.error.bind(console, "MongoDB connection error:")
);

connectToMongoDB.once("open", () => {
  console.log("Connected to MongoDB");
});

Chat();
const app: Express = express();
const port = process.env.PORT || 8080;
app.use(
  cors({
    origin: [
      "http://13.200.249.153",
      "http://localhost:3000",
      "http://13.200.249.153:3000",
      "http://zynoflixott.com",
      "http://www.zynoflixott.com",
      "http://zynoflixott.com:3000",
      "http://www.zynoflixott.com:3000",
      "https://zynoflixott.com",
      "https://www.zynoflixott.com",
      "http://localhost:3001",
      "https://zynoflixott-web.vercel.app",
      "https://2a9e-203-192-241-134.ngrok-free.app",
    ],
    credentials: true,
  })
);
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use(bodyParser.json({ limit: "22200000mb" })); // Adjust the limit as needed
app.use(bodyParser.urlencoded({ limit: "522222222222220mb", extended: true }));
app.use("/api", routor);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
