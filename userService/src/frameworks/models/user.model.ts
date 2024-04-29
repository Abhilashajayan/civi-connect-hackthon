import mongoose, { Schema, Document } from "mongoose";
import { IUserSchema } from "../../adapters/interfaces/IUserSchema";

const UserSchema = new Schema<IUserSchema>({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    dob: { type: Date },
    phone: { type: Number },
    profilePicture: { type: String },
    gender: { type: String },
    interest: { type: [String] },
    status: { type: Boolean, default: false },
    createdAt: { type: Date},
    location: { type: String }, 
    job: { type: String }, 
    liked: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        likedAt: { type: Date, default: Date.now }, 
        matched: { type: Boolean, default: false } 
    }],
});

export default mongoose.model<IUserSchema & Document>("User", UserSchema);
