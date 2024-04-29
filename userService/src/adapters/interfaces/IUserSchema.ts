import { Date, Document } from "mongoose";


export interface IUserSchema extends Document {
    id: string;
    username: string;
    email: string;
    password: string;
    dob: Date;
    phone: number;
    profilePicture: string;
    status: boolean;
    createdAt: Date;
}
