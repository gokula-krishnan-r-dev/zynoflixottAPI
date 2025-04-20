import { Server } from "socket.io";
import sockets from "./socket";

const chat = require("express")();
// const http = require("http").createServer(chat);
import http from "http";
// const io = require("socket.io")(http);
const PORT = process.env.PORT || 3003;
const httpServer = http.createServer(chat);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "*",
      "http://localhost:3000/chat",
      "zynoflixott.com",
      "www.zynoflixott.com",
      "https://zynoflixott.com",
      "https://www.zynoflixott.com",
      "http://zynoflixott.com",
      "http://www.zynoflixott.com",
      "https://chat.zynoflixott.com",
      "http://chat.zynoflixott.com",
      "https://zynoflixott.com/",
      "http://localhost:3001",
      "https://zynoflixott-web.vercel.app",
    ],
  },
});

const Chat = () => {
  io.on("connection", sockets);
  httpServer.listen(PORT, () => {
    console.log("Server is running at http://localhost:3003");
  });

  return chat;
};

export default Chat;
