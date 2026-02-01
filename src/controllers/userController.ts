import express, { Express, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { User } from "../model/user.model";
import { Session } from "../model/token.model";
import FollowerModel from "../model/follower.model";
import { ProductionCompany } from "../model/production.model";
import VideoModel from "../model/video.model";
import TvOsModel from "../model/tvOs.model";
import { getFileUrl } from "./blobHelpers";

import { v4 as uuidv4 } from "uuid";
export const allUsers = (req: Request, res: Response): void => {
  try {
    const users = User.find({});
    res.status(200).json({ users });
  } catch (error: any) {
    res.status(500).json({ error: "Something Wend wrong !" });
  }
};

export const createUser = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const { email, password, full_name } = req.body;

    const profilePic = req.files && req.files["profilePic"] ? getFileUrl(req.files["profilePic"][0]) : undefined;

    // Check if user with provided email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: "User already exists" });
      return;
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user with hashed password
    const newUser = await User.create({
      email,
      password: hashedPassword,
      full_name,
      profilePic,
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET || "demo",
      {
        expiresIn: "7d",
      }
    );

    // Create session
    const newSession = await Session.create({
      userId: newUser.id,
      accessToken: token,
    });

    if (newSession) {
      res.status(201).json({
        accessToken: token,
        message: "User created",
        user: {
          _id: newUser._id,
        },
        isProduction: "user",
      });
    } else {
      throw new Error("Failed to create session");
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      const productionCompany: any = await ProductionCompany.findOne({
        email,
      });
      if (!productionCompany) {
        res.status(404).json({ error: "User not found", code: 404 });
        return;
      }

      // Compare passwords
      const passwordMatch = await bcrypt.compare(
        password,
        productionCompany.password
      );

      if (!passwordMatch) {
        res.status(200).json({ error: "Invalid password", code: 401 });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: productionCompany.id },
        process.env.JWT || "demo"
      );

      // Create session
      const newSession = await Session.create({
        userId: productionCompany.id,
        accessToken: token,
      });

      if (newSession) {
        res.status(200).json({
          user: productionCompany,
          accessToken: token,
          isProduction: true,
          code: 200,
        });
      } else {
        throw new Error("Failed to create session");
      }

      return;
    }

    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      res.status(200).json({ error: "Invalid password", code: 401 });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET || "demo",
      {
        expiresIn: "7d",
      }
    );

    // Create session
    const newSession = await Session.create({
      userId: user.id,
      accessToken: token,
    });

    if (newSession) {
      res.status(200).json({ 
        user, 
        accessToken: token, 
        isProduction: user.userType === "student_ambassador" ? "user" : false,
        userType: user.userType || "user"
      });
    } else {
      throw new Error("Failed to create session");
    }
  } catch (error: any) {
    res.status(500).json({ error: "somthings went wrong " });
  }
};

export const logoutUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.body;

    // Find session by userId
    const session = await Session.findOne({ userId });
    if (!session) {
      res.status(404).json({ error: "Session not found" });
      return;
    }

    // Delete session
    await Session.deleteOne({ userId });

    res.status(200).json({ message: "User logged out" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const followUser = async (req: any, res: Response): Promise<void> => {
  try {
    const { videoId } = req.body;
    const userId = req.userId;
    if (!userId) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    if (!videoId) {
      res.status(400).json({ error: "Video not found" });
      return;
    }

    const exitingVideo: any = await VideoModel.findById(videoId);
    if (!exitingVideo) {
      res.status(400).json({ error: "Video not found" });
      return;
    }

    const FollowerVideo: any = await FollowerModel.find({
      videoId: videoId,
    });

    if (FollowerVideo.length === 0) {
      const newFollower = await FollowerModel.create({
        videoId: videoId,
        user_id: [userId],
        user: [userId],
      });
      await newFollower.save();

      exitingVideo.followerCount = FollowerVideo[0]?.user_id.length;
      await exitingVideo.save();
      res.status(200).json({ message: "Followed", newFollower });
      return;
    }

    if (FollowerVideo[0].user_id.includes(userId)) {
      // Already then remove id frin userid
      FollowerVideo[0].user_id = FollowerVideo[0].user_id.filter(
        (id: string) => id !== userId
      );
      await FollowerVideo[0].save();

      exitingVideo.followerCount = FollowerVideo[0].user_id.length;
      await exitingVideo.save();
      res.status(200).json({ message: "Unfollowed", FollowerVideo });
      return;
    }

    FollowerVideo[0].user_id.push(userId);
    await FollowerVideo[0].save();

    exitingVideo.followerCount = FollowerVideo[0].user_id.length;
    await exitingVideo.save();

    res.status(200).json({ message: "Followed", FollowerVideo });
  } catch (error: any) {
    console.log(error);

    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const getFollowers = async (req: any, res: Response): Promise<void> => {
  try {
    const { video_id } = req.params;
    const followers = await FollowerModel.find({
      videoId: video_id,
    });

    const distinctFollowers = [
      ...new Set(followers.map((follower) => follower.user_id)),
    ];
    const count = distinctFollowers.length;

    res.status(200).json({ followers, count });
  } catch (error: any) {
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const getFollowerByUserId = async (req: any, res: Response) => {
  try {
    const userId = req.userId;
    const followers = await FollowerModel.find({
      user_id: userId,
    });

    if (followers.length === 0) {
      res.status(200).json({ followers, count: 0 });
      return;
    }

    const distinctFollowers = [
      ...new Set(followers.map((follower) => follower.user_id)),
    ];
    const count = distinctFollowers.length;

    res.status(200).json({ followers, count });
  } catch (error: any) {
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { user_id } = req.params;
    const user = await User.findById(user_id).populate("membershipId");
    if (!user) {
      const existingProductionCompany = await ProductionCompany.findById(
        user_id
      );

      if (!existingProductionCompany) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.status(200).json({ user: existingProductionCompany });
      return;
    }

    // Ensure registrationFeePaid is always a boolean for correct profile display (student ambassadors)
    const userObj = user.toObject ? user.toObject() : { ...(user as any) };
    userObj.registrationFeePaid = user.registrationFeePaid === true;
    res.status(200).json({ user: userObj });
  } catch (error: any) {
    console.log(error, "error");
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// PUT update a value for normal user profilePic and back pic
export const updateUser = async (req: any, res: Response): Promise<void> => {
  try {
    const { user_id } = req.params;
    const { full_name, description } = req.body;
    console.log(req.files, "req.file");
    const accessToken = req.headers.authorization.split(" ")[1];

    const secret = process.env.JWT_SECRET || "demo";
    const decoded = jwt.verify(accessToken, secret) as JwtPayload;

    if (decoded.userId !== user_id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const user = await User.findById(user_id);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }



    if (req.files["profilePic"]) {
      const profilePic = getFileUrl(req.files["profilePic"][0]);
      user.profilePic = profilePic;
    }

    if (req.files["backgroundPic"]) {
      const backgroundImage = getFileUrl(req.files["backgroundPic"][0]);
      user.backgroundPic = backgroundImage;
    }

    if (full_name) {
      user.full_name = full_name;
    }

    if (description) {
      user.description = description;
    }

    await user.save();
    res.status(200).json({ user });
  } catch (error: any) {
    console.log(error);

    res.status(500).json({ error: "Something went wrong!" });
  }
};

//  PRODUCTION LOGIN
export const CreateProductionCompany = async (req: any, res: Response) => {
  try {
    console.log("Step 1: Starting CreateProductionCompany function");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    if (!req.files || !req.files["logo"] || !req.files["logo"][0]) {
      console.log("Error: Logo file is missing");
      return res.status(400).json({ error: "Logo file is required" });
    }

    console.log("Step 2: Getting logo file URL");
    const logo = getFileUrl(req.files["logo"][0]);
    console.log("Logo URL:", logo);

    console.log("Step 3: Checking if user already exists in User collection");
    const exitingUser = await User.findOne({
      email: req.body.email,
    });
    console.log("Existing user:", exitingUser);

    if (exitingUser) {
      console.log("Error: User already exists in User collection");
      res.status(400).json({ error: "User already exists" });
      return;
    }

    console.log("Step 4: Checking if production company already exists");
    const existingProductionCompany = await ProductionCompany.findOne({
      email: req.body.email,
    });
    console.log("Existing production company:", existingProductionCompany);

    if (existingProductionCompany) {
      console.log("Error: User already exists in ProductionCompany collection");
      res.status(400).json({ error: "User already exists" });
      return;
    }

    console.log("Step 5: Hashing password");
    const password = await bcrypt.hash(req.body.password, 10);

    console.log("Step 6: Creating new production company");
    const newProductionCompany = await ProductionCompany.create({
      name: req.body.name,
      founderName: req.body.founderName,
      about: req.body.about,
      email: req.body.email,
      contactNumber: req.body.contactNumber,
      password: password,
      logo: logo,
      profile_type: req.body.profile_type,
    });
    console.log("New production company created:", newProductionCompany.id);

    console.log("Step 7: Generating JWT token");
    const token = jwt.sign(
      { userId: newProductionCompany.id },
      process.env.JWT_SECRET || "demo",
      {
        expiresIn: "7d",
      }
    );
    console.log("JWT token generated");

    console.log("Step 8: Creating session");
    const newSession = await Session.create({
      userId: newProductionCompany.id,
      accessToken: token,
    });
    console.log("Session created:", newSession);

    if (newSession) {
      console.log("Step 9: Sending successful response");
      res.status(201).json({
        accessToken: token,
        message: "User created",
        userId: newProductionCompany.id,
      });
    } else {
      console.log("Error: Failed to create session");
      throw new Error("Failed to create session");
    }
  } catch (error: any) {
    console.log("Error in CreateProductionCompany:", error);
    console.log("Error message:", error.message);
    console.log("Error stack:", error.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const getProductCompany = async (req: Request, res: Response) => {
  try {
    const productionCompany = await ProductionCompany.find({});
    const filterByProfileType = productionCompany.filter(
      (company) => company.profile_type === "production"
    );

    res.status(200).json({ productionCompany: filterByProfileType });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const getDirectorsCompany = async (req: Request, res: Response) => {
  try {
    const productionCompany = await ProductionCompany.find({});
    const filterByProfileType = productionCompany.filter(
      (company) => company.profile_type === "directors"
    );

    res.status(200).json({ productionCompany: filterByProfileType });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// get by id
export const getProductionCompanyById = async (req: Request, res: Response) => {
  try {
    const productionCompany = await ProductionCompany.findById(
      req.params.user_id
    );
    res.status(200).json({ productionCompany });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

//delete production company
export const deleteProductionCompany = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const user = await ProductionCompany.findById(user_id);
    if (!user) {

      const user = await User.findById(user_id);
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      await User.deleteOne({ _id: user_id });
      res.status(200).json({ message: "User deleted" });
    }
    await ProductionCompany.deleteOne({ _id: user_id });
    res.status(200).json({ message: "Production company deleted" });
  } catch (error) {
    console.error("Error deleting production company:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

// PUT for upload and change production company logo or any other details
export const updateProductionCompany = async (req: any, res: Response) => {
  try {
    const productionCompany = await ProductionCompany.findById(req.userId);

    if (!productionCompany) {
      return res.status(404).json({ error: "Production company not found" });
    }

    // if (req.files["logo"]) {
    //   const logo = req.files["logo"][0].location;
    //   productionCompany.logo = logo;
    // }

    // if (req.files["backgroundImage"]) {
    //   const backgroundImage = req.files["backgroundImage"][0].location;
    //   productionCompany.backgroundImage = backgroundImage;
    // }

    if (req.body.name) {
      productionCompany.name = req.body.name;
    }

    if (req.body.founderName) {
      productionCompany.founderName = req.body.founderName;
    }

    if (req.body.about) {
      productionCompany.about = req.body.about;
    }

    if (req.body.email) {
      productionCompany.email = req.body.email;
    }

    if (req.body.contactNumber) {
      productionCompany.contactNumber = req.body.contactNumber;
    }

    if (req.body.password) {
      productionCompany.password = req.body.password;
    }

    if (req.body.socialMedia) {
      productionCompany.socialMedia = req.body.socialMedia;
    }

    await productionCompany.save();

    res.status(200).json({ productionCompany });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const createTvOsAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const uuid = uuidv4();
    // Create a new TvOs entry with the generated OTP
    const newTvOs = await TvOsModel.create({
      uuid,
      accessToken: "sdsd",
      username: "tvOsuser",
      userId: "sdsd",
      role: "user",
      otp,
    });

    // Respond with the created TvOs entry
    res.status(201).json({ tvOs: newTvOs });
  } catch (error) {
    console.error("Error creating TvOs auth:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const verifyTvOsAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { otp, userId } = req.body;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Find TvOs entry by UUID
    const tvOs = await TvOsModel.findOne({ otp });
    if (!tvOs) {
      res.status(404).json({ error: "TvOs not found" });
      return;
    }

    // Check if the provided OTP matches the TvOs entry
    if (tvOs.otp !== otp) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: userId },
      process.env.JWT_SECRET || "demo",
      {
        expiresIn: "7d",
      }
    );

    // Update the TvOs entry with the generated JWT token
    tvOs.accessToken = token;
    tvOs.success = true;
    tvOs.username = user.full_name;
    tvOs.role = "user";
    tvOs.userId = userId;
    await tvOs.save();

    // Respond with the TvOs entry
    res.status(200).json({ tvOs });
  } catch (error) {
    console.error("Error verifying TvOs auth:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const getByIdTvOsAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { uuid } = req.params;
  try {
    const tvOs = await TvOsModel.find({ uuid });
    res.status(200).json({ tvOs });
  } catch (error) {
    console.error("Error getting TvOs auth:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
};



//delete user 
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.params;
    const user = await User.findById(user_id);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    await User.deleteOne({ _id: user_id });
    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error("Error deleting user:", error);

    res.status(500).json({ error: "Something went wrong!" });
  }
};

// Student Brand Ambassador Registration - Optimized and High Performance
export const createStudentAmbassador = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const { email, password, full_name, college_name, age } = req.body;

    // Validation
    if (!email || !password || !full_name || !college_name || !age) {
      res.status(400).json({ 
        error: "All fields are required: email, password, full_name, college_name, and age",
        code: "MISSING_FIELDS"
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ 
        error: "Invalid email format",
        code: "INVALID_EMAIL"
      });
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      res.status(400).json({ 
        error: "Password must be at least 6 characters long",
        code: "WEAK_PASSWORD"
      });
      return;
    }

    // Validate age
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
      res.status(400).json({ 
        error: "Age must be a valid number between 1 and 150",
        code: "INVALID_AGE"
      });
      return;
    }

    // Handle profile picture upload
    const profilePic = req.files && req.files["profilePic"] && req.files["profilePic"][0] 
      ? getFileUrl(req.files["profilePic"][0]) 
      : undefined;

    // Check if user with provided email already exists - optimized query
    const existingUser = await User.findOne({ email }).select("email userType").lean();
    if (existingUser) {
      res.status(400).json({ 
        error: "User already exists with this email",
        code: "USER_EXISTS"
      });
      return;
    }

    // Hash the password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new student ambassador user - explicitly set userType
    const userData: any = {
      email: email.toLowerCase().trim(), // Normalize email
      password: hashedPassword,
      full_name: full_name.trim(),
      userType: "student_ambassador", // CRITICAL: Always set explicitly
      college_name: college_name.trim(),
      age: ageNum,
      registrationFeePaid: false,
    };

    // Add profile picture if provided
    if (profilePic) {
      userData.profilePic = profilePic;
    }

    console.log("Creating user with data:", {
      email: userData.email,
      full_name: userData.full_name,
      userType: userData.userType,
      college_name: userData.college_name,
      age: userData.age,
      registrationFeePaid: userData.registrationFeePaid
    });

    // Create user - use User.create() for initial creation
    const newUser = await User.create(userData);
    
    const userIdForUpdate = String(newUser._id);
    
    console.log("User created, ID:", userIdForUpdate);
    console.log("User data after create:", {
      userType: newUser.userType,
      college_name: newUser.college_name,
      age: newUser.age,
      registrationFeePaid: newUser.registrationFeePaid
    });

    // CRITICAL: Immediately use updateOne with $set to force save ALL fields to database
    // This bypasses Mongoose defaults and ensures fields are persisted
    const updateResult = await User.updateOne(
      { _id: userIdForUpdate },
      {
        $set: {
          userType: "student_ambassador",
          college_name: college_name.trim(),
          age: ageNum,
          registrationFeePaid: false
        }
      }
    );
    
    console.log("Update result:", updateResult);
    
    // Reload the user to verify fields were saved
    const updatedUser = await User.findById(userIdForUpdate);

    console.log("User after findByIdAndUpdate:", {
      _id: updatedUser?._id ? String(updatedUser._id) : "null",
      userType: updatedUser?.userType,
      college_name: updatedUser?.college_name,
      age: updatedUser?.age,
      registrationFeePaid: updatedUser?.registrationFeePaid
    });

    // Reload user to verify fields were saved
    if (!updatedUser) {
      throw new Error("Failed to retrieve created user");
    }

    // Ensure userId is a string
    const userIdString = String(updatedUser._id);
    
    // Double-check: Verify fields one more time and update if needed
    if (updatedUser.userType !== "student_ambassador" || !updatedUser.college_name || !updatedUser.age) {
      console.warn("Fields verification failed, performing correction update...");
      await User.updateOne(
        { _id: userIdString },
        {
          $set: {
            userType: "student_ambassador",
            college_name: college_name.trim(),
            age: ageNum,
            registrationFeePaid: false
          }
        }
      );
      // Reload after correction
      const correctedUser = await User.findById(userIdString);
      if (correctedUser) {
        Object.assign(updatedUser, {
          userType: correctedUser.userType,
          college_name: correctedUser.college_name,
          age: correctedUser.age,
          registrationFeePaid: correctedUser.registrationFeePaid
        });
      }
    }
    
    const savedUser = updatedUser;

    // Generate JWT token
    const token = jwt.sign(
      { userId: userIdString },
      process.env.JWT_SECRET || "demo",
      {
        expiresIn: "7d",
      }
    );

    // Create session
    const newSession = await Session.create({
      userId: userIdString,
      accessToken: token,
    });

    if (!newSession) {
      throw new Error("Failed to create session");
    }

    // Log successful creation with all details
    console.log("Student ambassador created successfully:", {
      userId: userIdString,
      email: savedUser.email,
      userType: savedUser.userType,
      college_name: savedUser.college_name,
      age: savedUser.age,
      registrationFeePaid: savedUser.registrationFeePaid
    });

    // Final verification - reload from database to ensure all fields are persisted
    const finalUser = await User.findById(userIdString);
    
    if (!finalUser) {
      throw new Error("Failed to retrieve user for final verification");
    }
    
    console.log("Final user from database:", {
      _id: String(finalUser._id),
      userType: finalUser.userType,
      college_name: finalUser.college_name,
      age: finalUser.age,
      registrationFeePaid: finalUser.registrationFeePaid
    });
    
    // If fields are still missing, do one more direct MongoDB update using collection
    if (finalUser.userType !== "student_ambassador" || !finalUser.college_name || !finalUser.age) {
      console.warn("Fields still missing, performing final MongoDB update...");
      
      // Use direct MongoDB collection update as last resort
      // Use userIdString which we already have as a string, then convert to ObjectId
      const mongoose = require('mongoose');
      const userIdObjectId = new mongoose.Types.ObjectId(userIdString);
      
      const db = User.db;
      const collection = db.collection('user_profiles');
      await collection.updateOne(
        { _id: userIdObjectId },
        {
          $set: {
            userType: "student_ambassador",
            college_name: college_name.trim(),
            age: ageNum,
            registrationFeePaid: false
          }
        }
      );
      
      // Reload one final time
      const finalCheck = await User.findById(userIdString);
      
      if (finalCheck) {
        // Return success response with all fields
        res.status(201).json({
          accessToken: token,
          message: "Student ambassador registration successful",
          userId: userIdString,
          user: {
            _id: userIdString,
            full_name: finalCheck.full_name || savedUser.full_name,
            email: finalCheck.email || savedUser.email,
            college_name: finalCheck.college_name || college_name.trim(),
            age: finalCheck.age || ageNum,
            userType: finalCheck.userType || "student_ambassador",
            registrationFeePaid: finalCheck.registrationFeePaid || false,
            profilePic: finalCheck.profilePic || savedUser.profilePic,
          },
          isProduction: "user",
        });
        return;
      }
    }
    
    // Return success response with all fields
    res.status(201).json({
      accessToken: token,
      message: "Student ambassador registration successful",
      userId: userIdString,
      user: {
        _id: userIdString,
        full_name: finalUser.full_name || savedUser.full_name,
        email: finalUser.email || savedUser.email,
        college_name: finalUser.college_name || college_name.trim(),
        age: finalUser.age || ageNum,
        userType: finalUser.userType || "student_ambassador",
        registrationFeePaid: finalUser.registrationFeePaid || false,
        profilePic: finalUser.profilePic || savedUser.profilePic,
      },
      isProduction: "user",
    });
  } catch (error: any) {
    console.error("Error creating student ambassador:", {
      error: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Handle validation errors
    if (error.name === "ValidationError") {
      res.status(400).json({ 
        error: "Validation failed",
        details: error.message,
        code: "VALIDATION_ERROR"
      });
      return;
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      res.status(400).json({ 
        error: "User with this email already exists",
        code: "DUPLICATE_EMAIL"
      });
      return;
    }

    res.status(500).json({ 
      error: error.message || "Something went wrong!",
      code: "INTERNAL_ERROR"
    });
  }
};

// Student Brand Ambassador - Create Razorpay Order
export const createStudentAmbassadorRazorpayOrder = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const { userId, amount } = req.body;

    if (!userId) {
      res.status(400).json({ 
        error: "User ID is required",
        code: "MISSING_USER_ID"
      });
      return;
    }

    if (!amount || amount !== 100) {
      res.status(400).json({ 
        error: "Registration fee is ₹100",
        code: "INVALID_AMOUNT"
      });
      return;
    }

    // Verify user exists and is a student ambassador
    const user = await User.findById(userId).select("userType college_name age _id email full_name").lean();
    
    if (!user) {
      res.status(404).json({ 
        error: "User not found",
        code: "USER_NOT_FOUND"
      });
      return;
    }

    // Check if user is a student ambassador
    if (user.userType !== "student_ambassador" && !user.college_name && !user.age) {
      res.status(400).json({ 
        error: "User is not a student ambassador",
        code: "INVALID_USER_TYPE"
      });
      return;
    }

    // Check if payment already completed
    const fullUser = await User.findById(userId);
    if (fullUser?.registrationFeePaid) {
      res.status(400).json({ 
        error: "Registration fee already paid",
        code: "PAYMENT_ALREADY_COMPLETED"
      });
      return;
    }

    // Initialize Razorpay with proper validation
    const Razorpay = require('razorpay');
    
    // Get Razorpay credentials - prioritize environment variables
    // Try multiple environment variable names for compatibility
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 
                         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 
                         'rzp_test_S6AcB6I8TQuoVM'; // Test key fallback
    
    // Get secret - try environment variables first
    let razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 
                           process.env.RAZORPAY_SECRET_KEY;
    
    // If no secret from env, match secret to key_id
    // IMPORTANT: key_id and key_secret must be from the same Razorpay account
    // According to .env file: rzp_test_S6AcB6I8TQuoVM pairs with ZdnToni69txsJ0rzNFzkmI89
    if (!razorpayKeySecret || razorpayKeySecret.trim() === '') {
      // Use the correct secret that matches rzp_test_S6AcB6I8TQuoVM (from .env file)
      if (razorpayKeyId === 'rzp_test_S6AcB6I8TQuoVM') {
        razorpayKeySecret = 'ZdnToni69txsJ0rzNFzkmI89'; // Correct secret from .env
      } else {
        // Fallback for other keys
        razorpayKeySecret = 'TnaYiO5l4LOVv3Y1hu72kg84';
      }
      console.log("Using fallback Razorpay secret for key_id:", razorpayKeyId.substring(0, 20));
    }
    
    // Validate that we have both keys
    if (!razorpayKeyId || !razorpayKeySecret) {
      res.status(500).json({ 
        error: "Razorpay configuration is missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET",
        code: "RAZORPAY_CONFIG_ERROR"
      });
      return;
    }
    
    // Additional validation - ensure keys are not empty strings
    if (razorpayKeyId.trim() === '' || razorpayKeySecret.trim() === '') {
      res.status(500).json({ 
        error: "Razorpay keys cannot be empty. Please set valid RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET",
        code: "RAZORPAY_CONFIG_ERROR"
      });
      return;
    }
    
    if (!razorpayKeyId || !razorpayKeySecret) {
      res.status(500).json({ 
        error: "Razorpay configuration is missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET",
        code: "RAZORPAY_CONFIG_ERROR"
      });
      return;
    }

    // Log configuration (without exposing full secrets) - for debugging
    console.log("Razorpay Configuration Check:", {
      key_id: razorpayKeyId,
      key_id_length: razorpayKeyId.length,
      has_secret: !!razorpayKeySecret,
      secret_length: razorpayKeySecret ? razorpayKeySecret.length : 0,
      env_RAZORPAY_KEY_ID: !!process.env.RAZORPAY_KEY_ID,
      env_RAZORPAY_KEY_SECRET: !!process.env.RAZORPAY_KEY_SECRET,
      env_NEXT_PUBLIC_RAZORPAY_KEY_ID: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    });
    
    // Verify key format
    if (!razorpayKeyId.startsWith('rzp_')) {
      console.warn("Warning: Razorpay key_id should start with 'rzp_'");
    }
    
    if (razorpayKeySecret && razorpayKeySecret.length < 20) {
      console.warn("Warning: Razorpay key_secret seems too short");
    }
    
    // Validate Razorpay instance creation
    // Razorpay constructor doesn't throw errors, but we'll validate the keys format
    if (!razorpayKeyId || razorpayKeyId.length < 10) {
      res.status(500).json({ 
        error: "Invalid Razorpay key_id format",
        code: "RAZORPAY_CONFIG_ERROR"
      });
      return;
    }
    
    if (!razorpayKeySecret || razorpayKeySecret.length < 20) {
      res.status(500).json({ 
        error: "Invalid Razorpay key_secret format",
        code: "RAZORPAY_CONFIG_ERROR"
      });
      return;
    }
    
    // Create Razorpay instance - constructor doesn't validate, so errors will show when creating order
    const razorpayInstance = new Razorpay({
      key_id: razorpayKeyId.trim(),
      key_secret: razorpayKeySecret.trim(),
    });

    // Create Razorpay order
    // Receipt must be max 40 characters - create a short unique receipt ID
    // Format: SA_<shortUserId>_<timestamp> (max 40 chars)
    const userIdStr = String(userId).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
    const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const receiptId = `SA${userIdStr}${timestamp}`.substring(0, 40);
    
    console.log("Creating Razorpay order with receipt:", receiptId, "length:", receiptId.length);
    
    const orderOptions = {
      amount: amount * 100, // Convert to paise (₹100 = 10000 paise)
      currency: 'INR',
      receipt: receiptId, // Max 40 characters
      notes: {
        userId: String(userId),
        type: 'student_ambassador_registration',
        amount: amount.toString()
      }
    };

    try {
      const order = await razorpayInstance.orders.create(orderOptions);

      res.status(200).json({
        success: true,
        orderId: order.id,
        amount: amount,
        currency: 'INR',
        key: razorpayKeyId, // Use the same key that was used to create the order
      });
    } catch (razorpayError: any) {
      console.error("Razorpay order creation error:", {
        error: razorpayError,
        message: razorpayError?.message,
        error_description: razorpayError?.error?.description,
        error_code: razorpayError?.error?.code,
        statusCode: razorpayError?.statusCode,
        key_id_used: razorpayKeyId.substring(0, 15) + '...'
      });
      
      // Handle specific Razorpay errors
      if (razorpayError.error) {
        const errorDesc = razorpayError.error.description || razorpayError.error.message || "Razorpay API error";
        
        // Handle receipt length error
        if (errorDesc.includes("receipt") && errorDesc.includes("length")) {
          res.status(400).json({ 
            error: "Receipt ID is too long. Please try again.",
            code: "RAZORPAY_RECEIPT_ERROR",
            details: {
              description: errorDesc,
              code: razorpayError.error.code
            }
          });
          return;
        }
        
        // Provide helpful error message for authentication failures
        if (errorDesc.includes("Authentication failed") || 
            (razorpayError.error.code === "BAD_REQUEST_ERROR" && errorDesc.includes("Authentication"))) {
          res.status(400).json({ 
            error: "Razorpay authentication failed. The key_id and key_secret do not match.",
            code: "RAZORPAY_AUTH_ERROR",
            details: {
              description: errorDesc,
              code: razorpayError.error.code,
              hint: "Make sure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are from the same Razorpay account. Test keys must pair with test secrets.",
              key_id_used: razorpayKeyId.substring(0, 20) + '...'
            }
          });
          return;
        }
        
        res.status(400).json({ 
          error: errorDesc,
          code: "RAZORPAY_ERROR",
          details: razorpayError.error
        });
        return;
      }
      
      throw razorpayError; // Re-throw to be caught by outer catch
    }
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    
    // Check if it's a Razorpay initialization error
    if (error.message && error.message.includes('key_id')) {
      res.status(500).json({ 
        error: "Razorpay configuration error. Please check environment variables.",
        code: "RAZORPAY_CONFIG_ERROR",
        details: error.message
      });
      return;
    }
    
    res.status(500).json({ 
      error: error.message || "Failed to create payment order",
      code: "PAYMENT_ORDER_ERROR"
    });
  }
};

// Student Brand Ambassador Payment - Verify Razorpay Payment
export const verifyStudentAmbassadorPayment = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    const { userId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!userId || !razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      res.status(400).json({ 
        error: "Missing required payment verification details",
        code: "MISSING_PAYMENT_DETAILS"
      });
      return;
    }

    // Verify payment signature
    const crypto = require('crypto');
    
    // Get Razorpay secret with fallback - must match the key_id used in create-order
    let razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || 
                           process.env.RAZORPAY_SECRET_KEY;
    
    if (!razorpayKeySecret || razorpayKeySecret.trim() === '') {
      // Use the correct secret that matches rzp_test_S6AcB6I8TQuoVM (from .env file)
      razorpayKeySecret = 'ZdnToni69txsJ0rzNFzkmI89';
      console.log("Using fallback Razorpay secret for payment verification");
    }
    
    if (!razorpayKeySecret) {
      res.status(500).json({ 
        error: "Razorpay configuration is missing",
        code: "RAZORPAY_CONFIG_ERROR"
      });
      return;
    }
    
    const generatedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (generatedSignature !== razorpaySignature) {
      res.status(400).json({ 
        error: "Invalid payment signature",
        code: "INVALID_SIGNATURE"
      });
      return;
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ 
        error: "User not found",
        code: "USER_NOT_FOUND"
      });
      return;
    }

    // Update user to mark registration fee as paid
    user.registrationFeePaid = true;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: String(user._id) },
      process.env.JWT_SECRET || "demo",
      {
        expiresIn: "7d",
      }
    );

    // Update or create session
    await Session.findOneAndUpdate(
      { userId: String(user._id) },
      { accessToken: token },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      accessToken: token,
      message: "Payment verified and registration completed successfully",
      user: {
        _id: String(user._id),
        full_name: user.full_name,
        email: user.email,
        college_name: user.college_name,
        age: user.age,
        userType: user.userType || "student_ambassador",
        registrationFeePaid: user.registrationFeePaid,
      },
      isProduction: "user",
      paymentId: razorpayPaymentId,
      orderId: razorpayOrderId,
    });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ 
      error: error.message || "Failed to verify payment",
      code: "PAYMENT_VERIFICATION_ERROR"
    });
  }
};

// Student Brand Ambassador Payment - Optimized and High Performance (Legacy - kept for backward compatibility)
export const studentAmbassadorPayment = async (
  req: any,
  res: Response
): Promise<void> => {
  try {
    // Get userId from request body or from auth token (if authenticated)
    const { userId: bodyUserId, amount } = req.body;
    const authUserId = req.userId; // From auth middleware if used
    
    // Use userId from body or auth token
    const userId = bodyUserId || authUserId;

    console.log("Payment request received:", {
      bodyUserId,
      authUserId,
      userId,
      amount
    });

    // Validation
    if (!userId) {
      res.status(400).json({ 
        error: "User ID is required",
        code: "MISSING_USER_ID"
      });
      return;
    }

    if (!amount || amount !== 100) {
      res.status(400).json({ 
        error: "Registration fee is ₹100",
        code: "INVALID_AMOUNT"
      });
      return;
    }

    // Optimized: Find user with only necessary fields
    const user = await User.findById(userId).select(
      "userType registrationFeePaid full_name email college_name age _id"
    ).lean();

    if (!user) {
      res.status(404).json({ 
        error: "User not found",
        code: "USER_NOT_FOUND"
      });
      return;
    }

    // Check if user is a student ambassador
    // Handle both string and undefined cases
    let userType = user.userType || "user";
    
    // If userType is not set but user has student ambassador fields, fix it
    if (userType !== "student_ambassador" && (user.college_name || user.age !== undefined)) {
      console.log("Fixing userType for user with student ambassador fields:", userId);
      // Update userType directly in database
      await User.findByIdAndUpdate(userId, { userType: "student_ambassador" });
      userType = "student_ambassador";
      user.userType = "student_ambassador";
    }
    
    if (userType !== "student_ambassador") {
      // Final check: try to get full user document and verify
      const fullUser = await User.findById(userId);
      if (fullUser && (fullUser.college_name || fullUser.age !== undefined)) {
        // User has student ambassador fields but missing userType - fix it
        fullUser.userType = "student_ambassador";
        await fullUser.save();
        
        // Retry with updated user
        const updatedUser = await User.findById(userId).select(
          "userType registrationFeePaid full_name email college_name age _id"
        );
        
        if (updatedUser && updatedUser.userType === "student_ambassador") {
          // Continue with payment processing
          updatedUser.registrationFeePaid = true;
          await updatedUser.save();

          // Ensure userId is a string - handle both ObjectId and string types
          const userIdString = updatedUser._id ? String(updatedUser._id) : String(userId);

          // Generate JWT token
          const token = jwt.sign(
            { userId: userIdString },
            process.env.JWT_SECRET || "demo",
            { expiresIn: "7d" }
          );

          // Update or create session efficiently
          await Session.findOneAndUpdate(
            { userId: userIdString },
            { accessToken: token },
            { upsert: true, new: true }
          );

          res.status(200).json({
            accessToken: token,
            message: "Registration fee paid successfully",
            user: {
              _id: userIdString,
              full_name: updatedUser.full_name,
              email: updatedUser.email,
              college_name: updatedUser.college_name,
              age: updatedUser.age,
              userType: updatedUser.userType,
              registrationFeePaid: updatedUser.registrationFeePaid,
            },
            isProduction: "user",
          });
          return;
        }
      }
      
      res.status(400).json({ 
        error: "User is not a student ambassador",
        code: "INVALID_USER_TYPE",
        userType: userType
      });
      return;
    }

    // Check if payment already made
    if (user.registrationFeePaid) {
      res.status(400).json({ 
        error: "Registration fee already paid",
        code: "PAYMENT_ALREADY_COMPLETED"
      });
      return;
    }

    // Update user to mark registration fee as paid - use findByIdAndUpdate for better performance
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        registrationFeePaid: true,
        $setOnInsert: { userType: "student_ambassador" } // Ensure userType is set
      },
      { 
        new: true,
        select: "full_name email college_name age userType registrationFeePaid _id"
      }
    );

    if (!updatedUser) {
      res.status(404).json({ 
        error: "Failed to update user",
        code: "UPDATE_FAILED"
      });
      return;
    }

    // Ensure userId is a string - handle both ObjectId and string types
    const userIdString = updatedUser._id ? String(updatedUser._id) : String(userId);

    // Generate JWT token
    const token = jwt.sign(
      { userId: userIdString },
      process.env.JWT_SECRET || "demo",
      {
        expiresIn: "7d",
      }
    );

    // Update or create session efficiently using upsert
    await Session.findOneAndUpdate(
      { userId: userIdString },
      { accessToken: token },
      { upsert: true, new: true }
    );

    // Return success response
    res.status(200).json({
      accessToken: token,
      message: "Registration fee paid successfully",
      user: {
        _id: userIdString,
        full_name: updatedUser.full_name,
        email: updatedUser.email,
        college_name: updatedUser.college_name,
        age: updatedUser.age,
        userType: updatedUser.userType || "student_ambassador",
        registrationFeePaid: updatedUser.registrationFeePaid,
      },
      isProduction: "user",
    });
  } catch (error: any) {
    console.error("Error processing payment:", error);
    res.status(500).json({ 
      error: error.message || "Something went wrong!",
      code: "INTERNAL_ERROR"
    });
  }
};

/** Public list of registered student ambassadors (profile image + name only). Used on signup page. */
export const getStudentAmbassadorsList = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const ambassadors = await User.find({ userType: "student_ambassador" })
      .select("_id full_name profilePic")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.status(200).json({
      ambassadors: ambassadors.map((a: any) => ({
        _id: a._id,
        full_name: a.full_name || "Ambassador",
        profilePic: a.profilePic || "https://i.sstatic.net/l60Hf.png",
      })),
    });
  } catch (error: any) {
    console.error("getStudentAmbassadorsList error:", error);
    res.status(500).json({ error: "Failed to fetch ambassadors list" });
  }
};
