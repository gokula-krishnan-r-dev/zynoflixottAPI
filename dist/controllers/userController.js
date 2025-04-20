"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductionCompany = exports.getProductionCompanyById = exports.getProductCompany = exports.CreateProductionCompany = exports.updateUser = exports.getUserById = exports.getFollowerByUserId = exports.getFollowers = exports.followUser = exports.logoutUser = exports.loginUser = exports.createUser = exports.allUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../model/user.model");
const token_model_1 = require("../model/token.model");
const follower_model_1 = __importDefault(require("../model/follower.model"));
const production_model_1 = require("../model/production.model");
const video_model_1 = __importDefault(require("../model/video.model"));
const allUsers = (req, res) => {
    try {
        const users = user_model_1.User.find({});
        res.status(200).json({ users });
    }
    catch (error) {
        res.status(500).json({ error: "Something Wend wrong !" });
    }
};
exports.allUsers = allUsers;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, full_name } = req.body;
        // Check if user with provided email already exists
        const existingUser = yield user_model_1.User.findOne({ email });
        if (existingUser) {
            res.status(400).json({ error: "User already exists" });
            return;
        }
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = yield bcryptjs_1.default.hash(password, saltRounds);
        // Create new user with hashed password
        const newUser = yield user_model_1.User.create({
            email,
            password: hashedPassword,
            full_name,
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: newUser.id }, process.env.JWT_SECRET || "demo", {
            expiresIn: "7d",
        });
        // Create session
        const newSession = yield token_model_1.Session.create({
            userId: newUser.id,
            accessToken: token,
        });
        if (newSession) {
            res.status(201).json({ accessToken: token, message: "User created" });
        }
        else {
            throw new Error("Failed to create session");
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.createUser = createUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user by email
        const user = yield user_model_1.User.findOne({ email });
        if (!user) {
            const productionCompany = yield production_model_1.ProductionCompany.findOne({
                email,
            });
            if (!productionCompany) {
                res.status(404).json({ error: "User not found", code: 404 });
                return;
            }
            // Compare passwords
            const passwordMatch = yield bcryptjs_1.default.compare(password, productionCompany.password);
            if (!passwordMatch) {
                res.status(200).json({ error: "Invalid password", code: 401 });
                return;
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ userId: productionCompany.id }, process.env.JWT || "demo");
            // Create session
            const newSession = yield token_model_1.Session.create({
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
            }
            else {
                throw new Error("Failed to create session");
            }
            return;
        }
        // Compare passwords
        const passwordMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            res.status(200).json({ error: "Invalid password", code: 401 });
            return;
        }
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || "demo", {
            expiresIn: "7d",
        });
        // Create session
        const newSession = yield token_model_1.Session.create({
            userId: user.id,
            accessToken: token,
        });
        if (newSession) {
            res.status(200).json({ user, accessToken: token, isProduction: false });
        }
        else {
            throw new Error("Failed to create session");
        }
    }
    catch (error) {
        res.status(500).json({ error: "somthings went wrong " });
    }
});
exports.loginUser = loginUser;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        // Find session by userId
        const session = yield token_model_1.Session.findOne({ userId });
        if (!session) {
            res.status(404).json({ error: "Session not found" });
            return;
        }
        // Delete session
        yield token_model_1.Session.deleteOne({ userId });
        res.status(200).json({ message: "User logged out" });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.logoutUser = logoutUser;
const followUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const exitingVideo = yield video_model_1.default.findById(videoId);
        if (!exitingVideo) {
            res.status(400).json({ error: "Video not found" });
            return;
        }
        const FollowerVideo = yield follower_model_1.default.find({
            videoId: videoId,
        });
        if (FollowerVideo.length === 0) {
            const newFollower = yield follower_model_1.default.create({
                videoId: videoId,
                user_id: [userId],
                user: [userId],
            });
            yield newFollower.save();
            exitingVideo.followerCount = (_a = FollowerVideo[0]) === null || _a === void 0 ? void 0 : _a.user_id.length;
            yield exitingVideo.save();
            res.status(200).json({ message: "Followed", newFollower });
            return;
        }
        if (FollowerVideo[0].user_id.includes(userId)) {
            // Already then remove id frin userid
            FollowerVideo[0].user_id = FollowerVideo[0].user_id.filter((id) => id !== userId);
            yield FollowerVideo[0].save();
            exitingVideo.followerCount = FollowerVideo[0].user_id.length;
            yield exitingVideo.save();
            res.status(200).json({ message: "Unfollowed", FollowerVideo });
            return;
        }
        FollowerVideo[0].user_id.push(userId);
        yield FollowerVideo[0].save();
        exitingVideo.followerCount = FollowerVideo[0].user_id.length;
        yield exitingVideo.save();
        res.status(200).json({ message: "Followed", FollowerVideo });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.followUser = followUser;
const getFollowers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { video_id } = req.params;
        const followers = yield follower_model_1.default.find({
            videoId: video_id,
        });
        const distinctFollowers = [
            ...new Set(followers.map((follower) => follower.user_id)),
        ];
        const count = distinctFollowers.length;
        res.status(200).json({ followers, count });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.getFollowers = getFollowers;
const getFollowerByUserId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const followers = yield follower_model_1.default.find({
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
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.getFollowerByUserId = getFollowerByUserId;
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const user = yield user_model_1.User.findById(user_id).populate("membershipId");
        if (!user) {
            const existingProductionCompany = yield production_model_1.ProductionCompany.findById(user_id);
            if (!existingProductionCompany) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            res.status(200).json({ user: existingProductionCompany });
            return;
        }
        res.status(200).json({ user });
    }
    catch (error) {
        console.log(error, "error");
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.getUserById = getUserById;
// PUT update a value for normal user profilePic and back pic
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const { full_name, description } = req.body;
        console.log(user_id);
        const accessToken = req.headers.authorization.split(" ")[1];
        const secret = process.env.JWT_SECRET || "demo";
        const decoded = jsonwebtoken_1.default.verify(accessToken, secret);
        if (decoded.userId !== user_id) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const user = yield user_model_1.User.findById(user_id);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        if (req.files["profilePic"]) {
            const profilePic = req.files["profilePic"][0].location;
            user.profilePic = profilePic;
        }
        if (req.files["backgroundPic"]) {
            const backgroundImage = req.files["backgroundPic"][0].location;
            user.backgroundPic = backgroundImage;
        }
        if (full_name) {
            user.full_name = full_name;
        }
        if (description) {
            user.description = description;
        }
        yield user.save();
        res.status(200).json({ user });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.updateUser = updateUser;
//  PRODUCTION LOGIN
const CreateProductionCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const logo = req.files["logo"][0].location;
        const exitingUser = yield user_model_1.User.findOne({
            email: req.body.email,
        });
        if (exitingUser) {
            res.status(400).json({ error: "User already exists" });
            return;
        }
        const existingProductionCompany = yield production_model_1.ProductionCompany.findOne({
            email: req.body.email,
        });
        if (existingProductionCompany) {
            res.status(400).json({ error: "User already exists" });
            return;
        }
        const password = yield bcryptjs_1.default.hash(req.body.password, 10);
        const newProductionCompany = yield production_model_1.ProductionCompany.create({
            name: req.body.name,
            founderName: req.body.founderName,
            about: req.body.about,
            email: req.body.email,
            contactNumber: req.body.contactNumber,
            password: password,
            logo: logo,
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: newProductionCompany.id }, process.env.JWT_SECRET || "demo", {
            expiresIn: "7d",
        });
        // Create session
        const newSession = yield token_model_1.Session.create({
            userId: newProductionCompany.id,
            accessToken: token,
        });
        if (newSession) {
            res.status(201).json({
                accessToken: token,
                message: "User created",
                userId: newProductionCompany.id,
            });
        }
        else {
            throw new Error("Failed to create session");
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.CreateProductionCompany = CreateProductionCompany;
const getProductCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productionCompany = yield production_model_1.ProductionCompany.find({});
        res.status(200).json({ productionCompany });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.getProductCompany = getProductCompany;
// get by id
const getProductionCompanyById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productionCompany = yield production_model_1.ProductionCompany.findById(req.params.user_id);
        res.status(200).json({ productionCompany });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.getProductionCompanyById = getProductionCompanyById;
// PUT for upload and change production company logo or any other details
const updateProductionCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productionCompany = yield production_model_1.ProductionCompany.findById(req.userId);
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
        yield productionCompany.save();
        res.status(200).json({ productionCompany });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.updateProductionCompany = updateProductionCompany;
