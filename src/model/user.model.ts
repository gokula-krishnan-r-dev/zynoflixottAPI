import mongoose, { Schema, Document, Types } from "mongoose";

interface IUserProfile extends Document {
  profilePic?: string;
  contact?: string;
  email: string;
  full_name: string;
  password: string;
  following?: number;
  followingId?: Types.ObjectId[];
  backgroundPic?: string;
  description?: string;
  membershipId?: Types.ObjectId;
  is_active: boolean;
  isMembership?: boolean;
  membership?: string;
  userType?: string; // 'user', 'student_ambassador', etc.
  college_name?: string; // For student ambassadors
  age?: number; // For student ambassadors
  registrationFeePaid?: boolean; // For student ambassadors
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    profilePic: { type: String, default: "https://i.sstatic.net/l60Hf.png" },
    contact: { type: String },
    email: { type: String, required: true, unique: true },
    full_name: { type: String, required: true },
    password: { type: String, required: true },
    backgroundPic: { type: String, default: "https://i.sstatic.net/l60Hf.png" },
    followingId: [
      {
        type: Schema.Types.ObjectId,
        ref: "user_profile",
      },
    ],
    description: {
      type: String,
      default:
        " voluptatum voluptate distinctio, nostrum hic voluptatibus nisi. Eligendi voluptatibus numquam maxime voluptatem labore similique qui illo est magnam adipisci autem quisquam, quia incidunt excepturi, possimus odit praesentium? Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus neque praesentium voluptates atque quisquam ratione voluptatem vitae ducimus cupiditate necessitatibus? Expedita odit eius, adipisci vero cupiditate quas ea asperiores.",
    },
    following: Number,
    membership: { type: String, default: "free" },
    isMembership: { type: Boolean, default: false },
    membershipId: { type: Schema.Types.ObjectId, ref: "Membership" },
    is_active: { type: Boolean, default: true },
    userType: { 
      type: String, 
      enum: ["user", "student_ambassador"],
      required: false,
      index: true,
      // No default - will be set explicitly or defaulted in pre-save hook
    },
    college_name: { 
      type: String,
      required: false,
      trim: true,
      default: undefined // Explicitly allow undefined
    },
    age: { 
      type: Number,
      min: 1,
      max: 150,
      required: false,
      default: undefined // Explicitly allow undefined
    },
    registrationFeePaid: { 
      type: Boolean, 
      default: false,
      index: true
    },
  },
  { timestamps: true }
);

// Pre-save hook to ensure userType is set correctly for student ambassadors
UserProfileSchema.pre("save", function(next) {
  // Set default userType only if not explicitly provided
  if (!this.userType) {
    // If user has student ambassador fields, set userType to student_ambassador
    if (this.college_name && this.age !== undefined) {
      this.userType = "student_ambassador";
    } else {
      // Otherwise default to "user"
      this.userType = "user";
    }
  }
  
  // If userType is explicitly "student_ambassador", ensure it's preserved
  // Don't validate on creation - allow fields to be set via direct update
  if (this.userType === "student_ambassador" && !this.isNew) {
    // Only validate on updates
    if (!this.college_name || this.age === undefined) {
      return next(new Error("College name and age are required for student ambassadors"));
    }
    if (isNaN(this.age) || this.age < 1 || this.age > 150) {
      return next(new Error("Age must be a valid number between 1 and 150"));
    }
  }
  
  next();
});

// Instance method to check if user is a student ambassador
UserProfileSchema.methods.isStudentAmbassador = function() {
  return this.userType === "student_ambassador";
};

// Static method to find student ambassadors
UserProfileSchema.statics.findStudentAmbassadors = function() {
  return this.find({ userType: "student_ambassador" });
};

// Create indexes for better query performance
UserProfileSchema.index({ userType: 1 });
UserProfileSchema.index({ email: 1, userType: 1 });
UserProfileSchema.index({ registrationFeePaid: 1, userType: 1 });
UserProfileSchema.index({ college_name: 1 }); // Index for student ambassador queries
UserProfileSchema.index({ age: 1 }); // Index for age queries

const User = mongoose.model<IUserProfile>("user_profile", UserProfileSchema);

export { IUserProfile, User };
