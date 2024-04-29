import { Date, Document } from "mongoose";


export interface IUserSchema extends Document {
    id: string;
    username: string;
    email: string;
    password: string;
    dob: Date;
    phone: number;
    profilePicture: string;
    gender: string;
    interest: string[];
    status: boolean;
    createdAt: Date;
    location: string; 
    job: string; 
    liked: string[];
}
