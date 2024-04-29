import mongoose, { Schema, Document } from "mongoose";
import { IUserSchema } from "../../adapters/interfaces/IUserSchema";


const AdminSchema = new Schema<IUserSchema>({
    email: { type: String, required: true },
    password: { type: String, required: true }
});

const adminModel = mongoose.model<IUserSchema & Document>("Admin", AdminSchema);
export default adminModel;
