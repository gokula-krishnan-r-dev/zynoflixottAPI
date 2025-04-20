import { watchModel } from "../model/watch.model";
import { Response } from "express";

export const watchLater = async (req: any, res: Response) => {
  try {
    const { video_id } = req.body;
    if (!video_id)
      return res.status(200).json({ message: "video_id is required" });

    if (!req.userId)
      return res.status(200).json({ message: "user_id is required" });

    const video = await watchModel.findOne({
      user_id: req.userId,
      video_id,
    });

    // delete if already exits
    if (video) {
      await watchModel.findByIdAndDelete(video._id);
      return res
        .status(200)
        .json({ message: "video removed from watch later" });
    }

    if (video)
      return res
        .status(200)
        .json({ message: "video already in watch later", video });

    const watch = new watchModel({
      user_id: req.userId,
      video_id,
      user: req.userId,
      video: video_id,
    });
    await watch.save();
    res.status(200).json({ message: "video added to watch later" });
  } catch (error) {
    console.log(error, "error");

    res
      .status(400)
      .json({ message: "failed to add video to watch later list" });
  }
};

export const getWatchLater = async (req: any, res: Response) => {
  try {
    const watch = await watchModel.find({ user_id: req.userId });
    res.status(200).json(watch);
  } catch (error) {
    res.status(400).json({ message: "failed to get watch later list" });
  }
};
