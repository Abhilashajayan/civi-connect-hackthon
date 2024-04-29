import { Document } from "mongoose";
export interface IAuthSchema extends Document {
    id: string;
    username: string;
    email: string;
    password: string;
    otp:number;
    createdAt: Date;
  }