import { Request, Response } from "express";
import MembershipModel from "../model/membership.model";
import { IUserProfile, User } from "../model/user.model";

const Razorpay = require("razorpay");

export const monthlySub = async (req: any, res: Response) => {
  const { amount, currency, membershipType } = req.body;

  const razorpayInstance = new Razorpay({
    key_id: process.env.PAY_KEY_ID,
    key_secret: process.env.PAY_KEY_SECRET,
  });

  const options = {
    amount: amount, // amount in smallest currency unit
    currency: currency || "INR",
    receipt: "order_rcptid_11",
    payment_capture: "0",
  };

  try {
    const orderRazo = await razorpayInstance.orders.create(options);

    const order = await MembershipModel.create({
      user_id: req.userId,
      amount: options.amount,
      transactionId: orderRazo.id,
      order: orderRazo,
      membershipType,
    });
    await order.save();

    const user: any = await User.findById(req.userId);

    user.membership === "active";
    user.membershipId = order._id;
    user.isMembership = true;

    await user.save();

    res.status(200).json({ order });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const getMonthlySub = async (req: any, res: Response) => {
  try {
    const order = await MembershipModel.find({
      user_id: req.userId,
    });
    res.status(200).json({ order });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

//  PUT update monthly subscription
export const updateMonthlySub = async (req: any, res: Response) => {
  try {
    const user_id = req.userId;
    const { status, isVideo_uploaded } = req.body;
    const order: any = await MembershipModel.findById(req.params.id);

    if (order.paymentStatus === "success") {
      res.status(400).json({ error: "Payment already done!" });
      return;
    }

    if (order.user_id !== user_id) {
      res
        .status(400)
        .json({ error: "You are not authorized to update this order!" });
      return;
    }

    order.paymentStatus = status;
    if (isVideo_uploaded) {
      order.isVideo_uploaded = isVideo_uploaded;
    }
    await order.save();

    const user: IUserProfile | any = await User.findById(user_id);
    user.membership = "active";
    await user.save();

    res.status(200).json({ order, status: "success" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const uploadVideoCount = async (req: any, res: Response) => {
  try {
    const user_id = req.userId;
    const order: any = await MembershipModel.findById(req.params.id);

    if (!order) {
      res.status(400).json({ error: "No order found!" });
      return;
    }

    if (order.user_id !== user_id) {
      res
        .status(400)
        .json({ error: "You are not authorized to update this order!" });
      return;
    }

    if (order.paymentStatus !== "success") {
      res.status(400).json({ error: "Payment not done!" });
      return;
    }

    if (order.isVideo_uploaded) {
      res.status(400).json({ error: "Video already uploaded!" });
      return;
    }

    if (order.isVideo_uploaded) {
      res.status(400).json({ error: "Video already uploaded!" });
      return;
    }

    order.isVideo_uploaded = true;
    await order.save();

    res.status(200).json({ order, status: "success" });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};
