import { AuthEntity } from "../../entity/auth.entity";
import { Request, Response } from "express";
import { authUsecases } from "../../usecases/auth.usecases";
import otpGenerator from "otp-generator";
import { sendEmail } from "../../frameworks/nodemailer/mailer";

export class authController {
  private readonly authUsecase: authUsecases;
  constructor(authUsecase: authUsecases) {
    this.authUsecase = authUsecase;
  }

  async register_user(req: Request, res: Response) {
    try {
      const { username, email, password } = req.body;
      console.log(username, email, password);
      const generatedOtp = +otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
        digits: true,
      });
      const payload: AuthEntity = {
        username,
        email,
        password,
        otp: generatedOtp,
      };

      await sendEmail(email, generatedOtp);
      const userDetails = await this.authUsecase.registerUser(payload);
      res.status(200).json(userDetails);
    } catch (err) {
      res.status(500).json({ message: err });
    }
  }

  async validateOtp(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      const data = await this.authUsecase.validateOtp(email, otp);
      if (!data) {
        res.status(200).json(data);
      } else {
        res.status(200).json(true);
      }
    } catch (error) {
      res.status(401).send("otp validation failed");
    }
  }

  async login_user(req: Request, res: Response) {
    try {
      const loginData = req.body;
      const loginDetails = await this.authUsecase.loginUser(loginData);
      console.log(loginDetails);
      res.status(200).json(loginDetails);
    } catch (err) {
      res.status(500).json({ message: err });
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const generatedOtp = +otpGenerator.generate(4, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
        digits: true,
      });
      const payload: AuthEntity = {
        email,
        password,
        otp: generatedOtp,
      };
      await sendEmail(email, generatedOtp);
      const changePassword = await this.authUsecase.changePassword(payload);
      console.log(changePassword);
      res.status(200).json(changePassword);
    } catch (err) {
      res.status(500).json({ message: err });
    }
  }

  async googleAuth(req : Request, res : Response){
    try {
        const authData = req.body;
        const googleAuth = await this.authUsecase.googleAuth(authData);
        console.log(googleAuth);
       return res.status(200).json(googleAuth);
      } catch (err) {
       return res.status(500).json({ message: err });
      }
  }
 
}
