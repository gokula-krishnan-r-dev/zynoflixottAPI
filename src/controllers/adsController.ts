import express, { Express, Request, Response } from "express";
import AdsModel from "../model/ads.model";
import { getFileUrl } from "./blobHelpers";

export const createAds = async (req: any, res: Response) => {
  try {
    const ads_video = getFileUrl(req.files["ads_video"][0]);
    const newAds = await AdsModel.create({
      title: req.body.title,
      ads_video,
      description: req.body.description,
    });
    res.status(201).json({ message: "Ads created", ads: newAds });
  } catch (error: any) {
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const getAds = async (req: Request, res: Response) => {
  try {
    const query = req.query.query;
    if (query) {
      const ads = await AdsModel.find({ title: { $regex: query, $options: "i" } });
      return res.status(200).json(ads);
    }

    const ads = await AdsModel.find({});
    res.status(200).json(ads);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Something Went wrong!" });
  }
};

export const activeAds = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ads = await AdsModel.findById(id);
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
