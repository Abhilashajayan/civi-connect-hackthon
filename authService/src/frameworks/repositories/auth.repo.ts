import { Model } from "mongoose";
import { IAuthSchema } from "../../adapters/interfaces/IauthScheme";
import { IUserUsecaes } from "../../adapters/interfaces/IauthUsecase";
import { AuthEntity } from "../../entity/auth.entity";
import { AuthModel } from "../models/otp.modal";
import { Rabiitmq } from "../messageBroker/rabbitmq";

export class AuthRepository implements IUserUsecaes {
  private readonly AuthModel: Model<IAuthSchema>;
  private readonly RabbitMq: Rabiitmq;

  constructor(authModel: Model<IAuthSchema>, rabbitMq: Rabiitmq) {
    this.AuthModel = authModel;
    this.RabbitMq = rabbitMq;
  }

  async registerUser(authCredentials: AuthEntity): Promise<void> {
    try {
      const newUser = new this.AuthModel(authCredentials);
      console.log(newUser);
      await newUser.save();
    } catch (error) {
      console.error("Registration failed:", error);
      throw new Error("Registration failed");
    }
  }

  async validateOtp(email: string, otp: number): Promise<boolean> {
    try {
      const existingData = await AuthModel.findOne({ email: email });
      console.log(existingData, "dadfad");
      if (!existingData) {
        throw new Error("User not found");
      }
      if (
        existingData.otp !== otp ||
        Date.now() - existingData.createdAt.getTime() > 600000
      ) {
        console.log("OTP validation failed due to timeout");
        return false;
      }
      console.log("OTP validation sucessfully completed");
      if(existingData.username) {
      await this.RabbitMq.userRegPublisher(existingData);
      return true;
      }else {
        console.log("OTP change password",existingData);
        await this.RabbitMq.changePasswordPublisher(existingData);
        return true;
      }
    } catch (error) {
      console.error("OTP validation failed:", error);
      throw new Error("OTP validation failed");
    }
  }
  
  login(email: string, password: string): Promise<string | null> {
    throw new Error("Method not implemented.");
  }

  googleAuth(googleAuthData: AuthEntity): Promise<void | null> {
    throw new Error("Method not implemented.");
  }

  async changePassword(userData : AuthEntity): Promise<void> {
    try {
      const newUser = new this.AuthModel(userData);
      console.log(newUser);
      await newUser.save();
    } catch (error) {
      console.error("OTP validation failed");
    }
  }
}
