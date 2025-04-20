import MessageController from "./controllers/messageController";
const sockets = (socket: any) => {
  console.log("User connected.");
  const messageController = new MessageController(socket);

  socket.on("join-room", messageController.joinRoom);
  socket.on("send-message", messageController.sendMessage);
  // socket.on("add-heart", messageController.addHeart);
  // socket.on("typing-started", typingController.typingStarted);
  // socket.on("typing-stoped", typingController.typingStoped);
  // socket.on("new-room-created", roomController.newRoomCreated);
  // socket.on("room-removed", roomController.roomRemoved);
  // socket.on("is-online", roomController.isOnline);
  // socket.on("add-online-user", roomController.addOnlineUser);
  // socket.on("remove-online-user", roomController.removeOnlineUser);
  // socket.on("add-emote", roomController.addEmote);
  // socket.on("add-poll", roomController.addPoll);
  // socket.on("get-poll", roomController.getPoll);
  // socket.on("add-pin", roomController.addPin);
  // socket.on("off-online", roomController.offOnline);

  socket.on("disconnect", (socket: any) => {
    console.log("User left.", socket);
  });
};

export default sockets;
