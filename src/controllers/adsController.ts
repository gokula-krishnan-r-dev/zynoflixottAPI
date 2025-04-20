import { Request, Response } from "express";
import Ad from "../model/ads.model";

export const createAds = async (req: any, res: Response) => {
  try {
    const ads_video = req.files["ads_video"][0].location;
    if (!ads_video) {
      return res.status(400).json({ error: "Please provide a video" });
    }

    const { title, link } = req.body;
    if (!title || !link) {
      return res.status(400).json({ error: "Please provide a title and link" });
    }

    const ads = await Ad.create({
      title,
      video: ads_video,
      link,
    });
    res.status(201).json(ads);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Something Went wrong!" });
  }
};

export const getAds = async (req: Request, res: Response) => {
  try {
    const query = req.query.query;
    if (query) {
      const ads = await Ad.find({ title: { $regex: query, $options: "i" } });
      return res.status(200).json(ads);
    }

    const ads = await Ad.find({});
    res.status(200).json(ads);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something Went wrong!" });
  }
};

export const activeAds = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ads = await Ad.findById(id);
    if (!ads) {
      return res.status(404).json({ error: "Ads not found" });
    }

    ads.active = !ads.active;
    await ads.save();
    res.status(200).json(ads);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something Went wrong!" });
  }
};
