import { Router, Request, Response } from "express";
import { UserController } from "../controllers/user.controllers";
import { userRepository } from "../../frameworks/repositories/user.repo";
import userModel from "../../frameworks/models/user.model";
import { UserUsecase } from "../../usecases/user.usercase";
import { Rabbitmq } from "../../frameworks/messageBroker/rabbitmq";
import multerConfig from "../../frameworks/services/multer";
import authenticateToken from "../middleware/authToken";
import adminModel from "../../frameworks/models/admin.model";

export class UserRouter {
  router = Router();
  userRepository = new userRepository(userModel, adminModel);
  userUsecase = new UserUsecase(this.userRepository);
  consumerMessage = new Rabbitmq(this.userUsecase);
  userController = new UserController(this.userUsecase, this.consumerMessage);

  constructor() {
    this.router.post(
      "/user/editUser/:userId",
      multerConfig.single("uploadPic"),
      (req: Request, res: Response) => {
        this.userController.editUser(req, res);
      }
    );

    this.router.post("/user/admin/signin", (req: Request, res: Response) => {
      this.userController.adminSignin(req, res);
    });
  }

  async rabbitMq() {
    await this.consumerMessage.userLoginConsumer();
    await this.consumerMessage.userRegConsumer();
    await this.consumerMessage.changePassConsumer();
    await this.consumerMessage.googleAuthConsumer();
  }
}

export const userRouter = new UserRouter().router;
