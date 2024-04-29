import { Router, Request, Response } from "express";
import { authController } from "../controllers/auth.contr";
import { authUsecases } from "../../usecases/auth.usecases";
import { AuthRepository } from "../../frameworks/repositories/auth.repo";
import { AuthModel } from "../../frameworks/models/otp.modal";
import { Rabiitmq } from "../../frameworks/messageBroker/rabbitmq";
import { JwtService } from "../../frameworks/jwt/token";


export class AuthRouter {

  secret_key = "secret_key";
  jwt = new JwtService(this.secret_key)
  router = Router();
  rabbitMq = new Rabiitmq();
  authRepository = new AuthRepository(AuthModel,this.rabbitMq);
  authUsecase = new authUsecases(this.authRepository ,this.rabbitMq , this.jwt);
  authController = new authController(this.authUsecase);

  constructor() {
    this.router.post("/auth/register", (req: Request, res: Response) => {
      this.authController.register_user(req, res);
    });
    this.router.post("/auth/register/send-otp", (req: Request, res: Response) => {
      this.authController.validateOtp(req, res);
    });
    this.router.post("/auth/login", (req: Request, res: Response) => {
      this.authController.login_user(req, res);
    });
    this.router.post("/auth/googleAuth", (req: Request, res: Response) => {
      this.authController.googleAuth(req, res);
    });
    this.router.post("/auth/changePassword", (req: Request, res: Response) => {
      this.authController.changePassword(req, res);
    });
  }
}

export const authRouter = new AuthRouter().router;