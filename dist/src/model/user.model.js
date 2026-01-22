"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const UserProfileSchema = new mongoose_1.Schema({
    profilePic: { type: String, default: "https://i.sstatic.net/l60Hf.png" },
    contact: { type: String },
    email: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    password: { type: String, required: true },
    backgroundPic: { type: String, default: "https://i.sstatic.net/l60Hf.png" },
    followingId: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "user_profile",
        },
    ],
    description: {
        type: String,
        default: " voluptatum voluptate distinctio, nostrum hic voluptatibus nisi. Eligendi voluptatibus numquam maxime voluptatem labore similique qui illo est magnam adipisci autem quisquam, quia incidunt excepturi, possimus odit praesentium? Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus neque praesentium voluptates atque quisquam ratione voluptatem vitae ducimus cupiditate necessitatibus? Expedita odit eius, adipisci vero cupiditate quas ea asperiores.",
    },
    following: Number,
    membership: { type: String, default: "free" },
    isMembership: { type: Boolean, default: false },
    membershipId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Membership" },
    is_active: { type: Boolean, default: true },
    userType: {
        type: String,
        default: "user",
        enum: ["user", "student_ambassador"],
        required: false,
        index: true // Add index for better query performance
    },
    college_name: {
        type: String,
        required: function () {
            return this.userType === "student_ambassador";
        }
    },
    age: {
        type: Number,
        min: 1,
        max: 150,
        required: function () {
            return this.userType === "student_ambassador";
        }
    },
    registrationFeePaid: {
        type: Boolean,
        default: false,
        index: true // Add index for better query performance
    },
}, { timestamps: true });
// Pre-save hook to ensure userType is set correctly for student ambassadors
UserProfileSchema.pre("save", function (next) {
    // If user has student ambassador fields, ensure userType is set
    if ((this.college_name || this.age !== undefined) && !this.userType) {
        this.userType = "student_ambassador";
    }
    // If userType is student_ambassador, ensure required fields exist
    if (this.userType === "student_ambassador") {
        if (!this.college_name || !this.age) {
            return next(new Error("College name and age are required for student ambassadors"));
        }
    }
    next();
});
// Instance method to check if user is a student ambassador
UserProfileSchema.methods.isStudentAmbassador = function () {
    return this.userType === "student_ambassador";
};
// Static method to find student ambassadors
UserProfileSchema.statics.findStudentAmbassadors = function () {
    return this.find({ userType: "student_ambassador" });
};
// Create indexes for better query performance
UserProfileSchema.index({ userType: 1 });
UserProfileSchema.index({ email: 1, userType: 1 });
UserProfileSchema.index({ registrationFeePaid: 1, userType: 1 });
UserProfileSchema.index({ college_name: 1 }); // Index for student ambassador queries
UserProfileSchema.index({ age: 1 }); // Index for age queries
const User = mongoose_1.default.model("user_profile", UserProfileSchema);
exports.User = User;
//# sourceMappingURL=user.model.js.map