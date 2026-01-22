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
exports.studentAmbassadorPayment = exports.createStudentAmbassador = exports.deleteUser = exports.getByIdTvOsAuth = exports.verifyTvOsAuth = exports.createTvOsAuth = exports.updateProductionCompany = exports.deleteProductionCompany = exports.getProductionCompanyById = exports.getDirectorsCompany = exports.getProductCompany = exports.CreateProductionCompany = exports.updateUser = exports.getUserById = exports.getFollowerByUserId = exports.getFollowers = exports.followUser = exports.logoutUser = exports.loginUser = exports.createUser = exports.allUsers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = require("../model/user.model");
const token_model_1 = require("../model/token.model");
const follower_model_1 = __importDefault(require("../model/follower.model"));
const production_model_1 = require("../model/production.model");
const video_model_1 = __importDefault(require("../model/video.model"));
const tvOs_model_1 = __importDefault(require("../model/tvOs.model"));
const blobHelpers_1 = require("./blobHelpers");
const uuid_1 = require("uuid");
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
        const profilePic = req.files && req.files["profilePic"] ? (0, blobHelpers_1.getFileUrl)(req.files["profilePic"][0]) : undefined;
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
            profilePic,
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
            res.status(201).json({
                accessToken: token,
                message: "User created",
                user: {
                    _id: newUser._id,
                },
                isProduction: "user",
            });
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
            res.status(200).json({
                user,
                accessToken: token,
                isProduction: user.userType === "student_ambassador" ? "user" : false,
                userType: user.userType || "user"
            });
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
        console.log(req.files, "req.file");
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
            const profilePic = (0, blobHelpers_1.getFileUrl)(req.files["profilePic"][0]);
            user.profilePic = profilePic;
        }
        if (req.files["backgroundPic"]) {
            const backgroundImage = (0, blobHelpers_1.getFileUrl)(req.files["backgroundPic"][0]);
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
        console.log("Step 1: Starting CreateProductionCompany function");
        console.log("Request body:", req.body);
        console.log("Request files:", req.files);
        if (!req.files || !req.files["logo"] || !req.files["logo"][0]) {
            console.log("Error: Logo file is missing");
            return res.status(400).json({ error: "Logo file is required" });
        }
        console.log("Step 2: Getting logo file URL");
        const logo = (0, blobHelpers_1.getFileUrl)(req.files["logo"][0]);
        console.log("Logo URL:", logo);
        console.log("Step 3: Checking if user already exists in User collection");
        const exitingUser = yield user_model_1.User.findOne({
            email: req.body.email,
        });
        console.log("Existing user:", exitingUser);
        if (exitingUser) {
            console.log("Error: User already exists in User collection");
            res.status(400).json({ error: "User already exists" });
            return;
        }
        console.log("Step 4: Checking if production company already exists");
        const existingProductionCompany = yield production_model_1.ProductionCompany.findOne({
            email: req.body.email,
        });
        console.log("Existing production company:", existingProductionCompany);
        if (existingProductionCompany) {
            console.log("Error: User already exists in ProductionCompany collection");
            res.status(400).json({ error: "User already exists" });
            return;
        }
        console.log("Step 5: Hashing password");
        const password = yield bcryptjs_1.default.hash(req.body.password, 10);
        console.log("Step 6: Creating new production company");
        const newProductionCompany = yield production_model_1.ProductionCompany.create({
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
        const token = jsonwebtoken_1.default.sign({ userId: newProductionCompany.id }, process.env.JWT_SECRET || "demo", {
            expiresIn: "7d",
        });
        console.log("JWT token generated");
        console.log("Step 8: Creating session");
        const newSession = yield token_model_1.Session.create({
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
        }
        else {
            console.log("Error: Failed to create session");
            throw new Error("Failed to create session");
        }
    }
    catch (error) {
        console.log("Error in CreateProductionCompany:", error);
        console.log("Error message:", error.message);
        console.log("Error stack:", error.stack);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.CreateProductionCompany = CreateProductionCompany;
const getProductCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productionCompany = yield production_model_1.ProductionCompany.find({});
        const filterByProfileType = productionCompany.filter((company) => company.profile_type === "production");
        res.status(200).json({ productionCompany: filterByProfileType });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.getProductCompany = getProductCompany;
const getDirectorsCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productionCompany = yield production_model_1.ProductionCompany.find({});
        const filterByProfileType = productionCompany.filter((company) => company.profile_type === "directors");
        res.status(200).json({ productionCompany: filterByProfileType });
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.getDirectorsCompany = getDirectorsCompany;
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
//delete production company
const deleteProductionCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const user = yield production_model_1.ProductionCompany.findById(user_id);
        if (!user) {
            const user = yield user_model_1.User.findById(user_id);
            if (!user) {
                res.status(404).json({ error: "User not found" });
                return;
            }
            yield user_model_1.User.deleteOne({ _id: user_id });
            res.status(200).json({ message: "User deleted" });
        }
        yield production_model_1.ProductionCompany.deleteOne({ _id: user_id });
        res.status(200).json({ message: "Production company deleted" });
    }
    catch (error) {
        console.error("Error deleting production company:", error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.deleteProductionCompany = deleteProductionCompany;
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
const createTvOsAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        const uuid = (0, uuid_1.v4)();
        // Create a new TvOs entry with the generated OTP
        const newTvOs = yield tvOs_model_1.default.create({
            uuid,
            accessToken: "sdsd",
            username: "tvOsuser",
            userId: "sdsd",
            role: "user",
            otp,
        });
        // Respond with the created TvOs entry
        res.status(201).json({ tvOs: newTvOs });
    }
    catch (error) {
        console.error("Error creating TvOs auth:", error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.createTvOsAuth = createTvOsAuth;
const verifyTvOsAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { otp, userId } = req.body;
        const user = yield user_model_1.User.findById(userId);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Find TvOs entry by UUID
        const tvOs = yield tvOs_model_1.default.findOne({ otp });
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
        const token = jsonwebtoken_1.default.sign({ userId: userId }, process.env.JWT_SECRET || "demo", {
            expiresIn: "7d",
        });
        // Update the TvOs entry with the generated JWT token
        tvOs.accessToken = token;
        tvOs.success = true;
        tvOs.username = user.full_name;
        tvOs.role = "user";
        tvOs.userId = userId;
        yield tvOs.save();
        // Respond with the TvOs entry
        res.status(200).json({ tvOs });
    }
    catch (error) {
        console.error("Error verifying TvOs auth:", error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.verifyTvOsAuth = verifyTvOsAuth;
const getByIdTvOsAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uuid } = req.params;
    try {
        const tvOs = yield tvOs_model_1.default.find({ uuid });
        res.status(200).json({ tvOs });
    }
    catch (error) {
        console.error("Error getting TvOs auth:", error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.getByIdTvOsAuth = getByIdTvOsAuth;
//delete user 
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id } = req.params;
        const user = yield user_model_1.User.findById(user_id);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        yield user_model_1.User.deleteOne({ _id: user_id });
        res.status(200).json({ message: "User deleted" });
    }
    catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Something went wrong!" });
    }
});
exports.deleteUser = deleteUser;
// Student Brand Ambassador Registration - Optimized and High Performance
const createStudentAmbassador = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            ? (0, blobHelpers_1.getFileUrl)(req.files["profilePic"][0])
            : undefined;
        // Check if user with provided email already exists - optimized query
        const existingUser = yield user_model_1.User.findOne({ email }).select("email userType").lean();
        if (existingUser) {
            res.status(400).json({
                error: "User already exists with this email",
                code: "USER_EXISTS"
            });
            return;
        }
        // Hash the password with bcrypt
        const saltRounds = 10;
        const hashedPassword = yield bcryptjs_1.default.hash(password, saltRounds);
        // Create new student ambassador user - explicitly set userType
        const userData = {
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
        // Create user with explicit userType
        const newUser = yield user_model_1.User.create(userData);
        // Reload user to ensure all fields are properly set (including userType)
        const savedUser = yield user_model_1.User.findById(newUser._id).select("full_name email college_name age userType registrationFeePaid _id profilePic");
        if (!savedUser) {
            throw new Error("Failed to retrieve created user");
        }
        // Double-check userType - if still not set, force update
        if (savedUser.userType !== "student_ambassador") {
            console.warn("UserType mismatch detected, correcting for user:", savedUser._id);
            yield user_model_1.User.findByIdAndUpdate(savedUser._id, { userType: "student_ambassador" });
            savedUser.userType = "student_ambassador";
        }
        // Ensure userId is a string
        const userIdString = String(savedUser._id);
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: userIdString }, process.env.JWT_SECRET || "demo", {
            expiresIn: "7d",
        });
        // Create session
        const newSession = yield token_model_1.Session.create({
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
        // Return success response
        res.status(201).json({
            accessToken: token,
            message: "Student ambassador registration successful",
            userId: userIdString,
            user: {
                _id: userIdString,
                full_name: savedUser.full_name,
                email: savedUser.email,
                college_name: savedUser.college_name,
                age: savedUser.age,
                userType: savedUser.userType, // Should always be "student_ambassador"
                registrationFeePaid: savedUser.registrationFeePaid || false,
                profilePic: savedUser.profilePic,
            },
            isProduction: "user",
        });
    }
    catch (error) {
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
});
exports.createStudentAmbassador = createStudentAmbassador;
// Student Brand Ambassador Payment - Optimized and High Performance
const studentAmbassadorPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield user_model_1.User.findById(userId).select("userType registrationFeePaid full_name email college_name age _id").lean();
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
            yield user_model_1.User.findByIdAndUpdate(userId, { userType: "student_ambassador" });
            userType = "student_ambassador";
            user.userType = "student_ambassador";
        }
        if (userType !== "student_ambassador") {
            // Final check: try to get full user document and verify
            const fullUser = yield user_model_1.User.findById(userId);
            if (fullUser && (fullUser.college_name || fullUser.age !== undefined)) {
                // User has student ambassador fields but missing userType - fix it
                fullUser.userType = "student_ambassador";
                yield fullUser.save();
                // Retry with updated user
                const updatedUser = yield user_model_1.User.findById(userId).select("userType registrationFeePaid full_name email college_name age _id");
                if (updatedUser && updatedUser.userType === "student_ambassador") {
                    // Continue with payment processing
                    updatedUser.registrationFeePaid = true;
                    yield updatedUser.save();
                    // Ensure userId is a string - handle both ObjectId and string types
                    const userIdString = updatedUser._id ? String(updatedUser._id) : String(userId);
                    // Generate JWT token
                    const token = jsonwebtoken_1.default.sign({ userId: userIdString }, process.env.JWT_SECRET || "demo", { expiresIn: "7d" });
                    // Update or create session efficiently
                    yield token_model_1.Session.findOneAndUpdate({ userId: userIdString }, { accessToken: token }, { upsert: true, new: true });
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
        const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, {
            registrationFeePaid: true,
            $setOnInsert: { userType: "student_ambassador" } // Ensure userType is set
        }, {
            new: true,
            select: "full_name email college_name age userType registrationFeePaid _id"
        });
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
        const token = jsonwebtoken_1.default.sign({ userId: userIdString }, process.env.JWT_SECRET || "demo", {
            expiresIn: "7d",
        });
        // Update or create session efficiently using upsert
        yield token_model_1.Session.findOneAndUpdate({ userId: userIdString }, { accessToken: token }, { upsert: true, new: true });
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
    }
    catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({
            error: error.message || "Something went wrong!",
            code: "INTERNAL_ERROR"
        });
    }
});
exports.studentAmbassadorPayment = studentAmbassadorPayment;
//# sourceMappingURL=userController.js.map