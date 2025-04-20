import { Response } from "express";
import CommentModel from "../model/comment.model";

export const CreateComment = async (req: any, res: Response) => {
  try {
    // Create a new comment
    const comment = await CommentModel.create({
      userId: req.userId,
      videoId: req.params.video_id,
      content: req.body.content,
      user: req.userId,
    });
    res.status(201).json({ comment });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Somthing Went Wrong!" });
  }
};

export const getComment = async (req: any, res: Response) => {
  try {
    // Get all comments
    const comments = await CommentModel.find();
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ error: "Somthing Went Wrong!" });
  }
};

export const getCommentById = async (req: any, res: Response) => {
  try {
    // Get a comment by ID
    const comment = await CommentModel.findById(req.params.id);
    res.status(200).json({ comment });
  } catch (error) {
    res.status(500).json({ error: "Somthing Went Wrong!" });
  }
};

export const getCommentByVideoId = async (req: any, res: Response) => {
  try {
    // Get all comments by video ID
    const comments = await CommentModel.find({
      videoId: req.params.video_id,
    })
      .populate("user")
      .sort({ createdAt: -1 });
    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ error: "Somthing Went Wrong!" });
  }
};
