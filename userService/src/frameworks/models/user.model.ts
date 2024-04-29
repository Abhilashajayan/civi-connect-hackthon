import mongoose, { Schema, Document } from "mongoose";
import { IUserSchema } from "../../adapters/interfaces/IUserSchema";

const UserSchema = new Schema<IUserSchema>({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String },
    phone: { type: Number },
    profilePicture: { type: String },
    status: { type: Boolean, default: false },
    createdAt: { type: Date},
});

export default mongoose.model<IUserSchema & Document>("User", UserSchema);
