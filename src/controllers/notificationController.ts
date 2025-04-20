import { Request, Response } from "express";
import notificationModel from "../model/notification.model";

export const SendNotification = async (req: any, res: Response) => {
  const { title, message, receiver } = req.body;
  const notification = new notificationModel({
    title,
    message,
    receiver,
    send: false,
    sender: req.userId,
    user: req.userId,
  });

  try {
    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ error: "" });
  }
};

export const GetNotification = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const notifications = await notificationModel
      .find({
        receiver: userId,
      })
      .populate("user")
      .sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: "" });
  }
};

export const GetNotificationById = async (req: Request, res: Response) => {
  try {
    const notification = await notificationModel.findById(req.params.id);
    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ error: "" });
  }
};
