import MessageModel from "../model/message.model";
import RoomModel from "../model/room.model";
import BaseController from "../service/BaseController";

export default class MessageController extends BaseController {
  joinRoom = async ({ roomId, userId, name }: any) => {
    try {
      if (!roomId || !userId || !name) {
        console.log("Invalid roomId, userId, or name");
        return;
      }

      this.socket.join(roomId);
      console.log(userId, "userId");

      const savedRoomId = roomId;
      let skt = this.socket.broadcast;
      skt = savedRoomId ? skt.to(savedRoomId) : skt;

      const roomCount = this.socket.adapter.rooms.get(roomId)?.size || 0;
      console.log("Number of users in room:", roomCount);

      const room = await RoomModel.findOne({ roomId });

      if (room) {
        skt.emit("get-user", { roomId, isOnline: true, userId });
        return;
      }

      skt.emit("get-user", { roomId, isOnline: true, userId });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  sendMessage = async ({ content, roomId, sender }: any) => {
    try {
      let skt = this.socket.broadcast;
      skt = roomId ? skt.to(roomId) : skt;

      const newMessage = new MessageModel({
        content,
        roomId,
        room: roomId,
        userId: sender,
        sender,
      });

      await newMessage.save();
      skt.emit("message-from-server", { content, sender });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };
}
