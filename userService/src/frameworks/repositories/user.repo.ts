import { UserEntity } from "../../entity/user.entity";
import { IUserSchema } from "../../adapters/interfaces/IUserSchema";
import { IUserCase } from "../../adapters/interfaces/IUserUsecase";
import { Model } from "mongoose";
import { Rabbitmq } from "../messageBroker/rabbitmq";
import bcrypt from "bcrypt";
import cloudinary from "../services/cloudinary";
import userModel from "../models/user.model";
import adminModel from "../models/admin.model";

interface LikedUserInfo {
  _id: string;
  username: string;
  profilePicture: string;
  age: number;
  dob: Date;
  matched: boolean;
}

export class userRepository implements IUserCase {
  private readonly UserModel: Model<IUserSchema>;
  private readonly Admin: Model<IUserSchema>;

  constructor(UserModel: Model<IUserSchema>, adminModel: Model<IUserSchema>) {
    this.UserModel = UserModel;
    this.Admin = adminModel;
  }

  async register(user: UserEntity): Promise<void> {
    try {
      console.log("user repo", user);
      const password = user.password;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new this.UserModel({
        ...user,
        password: hashedPassword,
      });
      await newUser.save();
      console.log(newUser);
    } catch (error) {
      console.error("Registration failed:", error);
      throw new Error("Registration failed");
    }
  }

  async login(data: UserEntity): Promise<any> {
    try {
      console.log("check user");
      const email = data.email;
      const password = data.password;
      const user = await this.UserModel.findOne({ email: email }).exec();

      if (user) {
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
          console.log("Login successful");
          return user;
        } else {
          console.log("Password mismatch");
          return false;
        }
      } else {
        console.log("User not found");
        return false;
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw new Error("Login failed");
    }
  }

  async googleAuth(authData: UserEntity): Promise<any> {
    try {
      const { email } = authData;
      let user = await this.UserModel.findOne({ email }).exec();
      console.log(user, "the user ");
      if (!user) {
        const newUser = new this.UserModel(authData);
        user = await newUser.save();
        console.log("New user created:", user);
      }
      return user;
    } catch (error) {
      console.error("Google authentication failed:", error);
      throw new Error("Google authentication failed");
    }
  }

  async getAllUsers(): Promise<any> {
    try {
      const allUsers = await this.UserModel.find({}, { password: 0 });
      console.log("get all user details ", allUsers);
      return allUsers;
    } catch (error) {
      console.error("Fetching all users failed:", error);
      throw new Error("Error while fetching all users");
    }
  }

  async editUser(userId: string, data: UserEntity, req: any): Promise<any> {
    try {
      console.log(req.file, "the request");
      if (req.file) {
        const folderName = "Bea";
        const result = await cloudinary.uploader.upload(req.file.path, {
          public_id: `${folderName}/${req.file.originalname}`,
        });

        const updatedUserWithImage = await this.UserModel.findOneAndUpdate(
          { _id: userId },
          {
            $set: {
              ...data,
              profilePicture: result?.secure_url,
            },
          },
          { new: true }
        );

        console.log("Cloudinary result:", result);
        console.log("Updated user with image:", updatedUserWithImage);

        return updatedUserWithImage;
      } else {
        const updatedUserWithoutImage = await this.UserModel.findOneAndUpdate(
          { _id: userId },
          {
            $set: {
              ...data,
            },
          },
          { new: true }
        );

        console.log("Updated user without image:", updatedUserWithoutImage);

        return updatedUserWithoutImage;
      }
    } catch (error) {
      console.error("Editing user failed:", error);
      throw new Error("Error while editing user");
    }
  }

  async changePassword(data: UserEntity): Promise<any> {
    try {
      const { email, password } = data;
      console.log(data, "the data");
      const user = await this.UserModel.findOne({ email });
      if (!user) {
        console.error("User not found");
        throw new Error("User not found");
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();

      console.log("Password changed successfully for user:", user);
      return true;
    } catch (error) {
      console.error("Failed to change password:", error);
      throw new Error("Failed to change password");
    }
  }

  async getRandomUser(userId: string): Promise<any> {
    try {
      const likedUsers = await this.UserModel.findOne({ _id: userId })
        .populate("liked.user")
        .select("liked.user");
      if (!likedUsers || likedUsers.liked.length === 0) {
        const allUsers = await this.UserModel.find({}, { password: 0 });
        return allUsers;
      }
      const likedUserIds =
        likedUsers.liked.map((likedUser: any) => likedUser.user._id) || [];
      const randomUser = await this.UserModel.find({
        _id: { $nin: likedUserIds },
      });
      console.log("Liked User IDs:", likedUserIds.length);
      console.log("Random User:", randomUser);
      return randomUser;
    } catch (error) {
      console.error("Error retrieving random user:", error);
      return error;
    }
  }

  async matchUser(userId: string, likedUserId: string): Promise<any> {
    try {
      const isLiked = await this.UserModel.exists({
        _id: userId,
        "liked.user": likedUserId,
      });
      if (!isLiked) {
        const likedUserObject = { user: likedUserId, likedAt: Date.now() };
        const data = await this.UserModel.findByIdAndUpdate(userId, {
          $push: { liked: likedUserObject },
        });

        console.log("User liked successfully:", data);
        const isMatched = await this.UserModel.exists({
          _id: likedUserId,
          "liked.user": userId,
        });

        if (isMatched) {
          const datas = await Promise.all([
            this.UserModel.updateOne(
              { _id: userId, "liked.user": likedUserId },
              { $set: { "liked.$.matched": true } }
            ),
            this.UserModel.updateOne(
              { _id: likedUserId, "liked.user": userId },
              { $set: { "liked.$.matched": true } }
            ),
          ]);
          console.log(datas, "the liked data is status is here");

          return { data, isMatched: true };
        }

        return { data, isMatched: false };
      } else {
        console.log("User already liked");
        return { isMatched: true };
      }
    } catch (error) {
      console.error("Error while matching user:", error);
      return { error, isMatched: false };
    }
  }

  async blockUser(userId: string): Promise<any> {
    try {
      const user = await this.UserModel.findById(userId);
      if (!user) {
        return { message: "User not found" };
      }
      user.status = !user.status;

      await user.save();

      if (user.status) {
        return { message: "User is now unblocked" };
      } else {
        return { message: "User is now blocked" };
      }
    } catch (error) {
      console.error("Error blocking/unblocking user:", error);
      throw error;
    }
  }

  async userProfile(userId: string): Promise<any> {
    try {
      const user = await this.UserModel.findById(userId);
      if (user) {
        console.log(user.status, "User is now blocked");
        return user;
      } else {
        console.error(`User with ID ${userId} not found.`);
        return undefined;
      }
    } catch (error) {
      console.error("Error retrieving user status:", error);
      throw error;
    }
  }

  async likedUsers(userId: string): Promise<any> {
    try {
      const likedUsers: LikedUserInfo[] = await this.UserModel.find({
        "liked.user": userId,
      })
        .select("_id username profilePicture dob")
        .lean();
      likedUsers.forEach((likedUser) => {
        likedUser.age = this.calculateAge(likedUser.dob);
      });

      console.log(likedUsers, "the data");
      return likedUsers;
    } catch (error) {
      console.error("Error finding liked users:", error);
      throw error;
    }
  }

  async adminSignin(data: UserEntity): Promise<any> {
    try {
      console.log("Checking admin with email:", data.email);
      const { email, password } = data;
      const admin = await this.Admin.findOne({ email }).exec();

      if (!admin) {
        console.log("Admin not found");
        return null;
      }
      if (password === admin.password) {
        console.log("Login successful");
        return admin;
      } else {
        console.log("Password mismatch");
        return null;
      }
    } catch (error) {
      console.error("Admin signin failed:", error);
      throw new Error("Admin signin failed");
    }
  }

  private calculateAge(dateOfBirth: any): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }
}
