import { AuthEntity } from "../entity/auth.entity";
import { IUserUsecaes } from "../adapters/interfaces/IauthUsecase";
import { Rabiitmq } from "../frameworks/messageBroker/rabbitmq";
import { JwtService } from "../frameworks/jwt/token";
import { AuthRepository } from "../frameworks/repositories/auth.repo";


export class authUsecases implements IUserUsecaes {
    constructor(private authRepository: AuthRepository ,private rabbitmqService: Rabiitmq,
      private jwtService: JwtService){}
    
    async registerUser(userData: AuthEntity):Promise<void> {
      await this.authRepository.registerUser(userData);
    }

    validateOtp(email:string ,otp: number): Promise<boolean> {
        return this.authRepository.validateOtp(email , otp);
    }
    
     async loginUser(loginData: AuthEntity):Promise<any> {
       console.log("loginUser");
        const userLogin:AuthEntity = loginData;
        console.log(userLogin);
      
       const reponse :any =  await this.rabbitmqService.publishLoginData(userLogin);
     
       if(reponse == null){
        console.log(reponse," response is received");
       }else{
        console.log(reponse,"the data");
        
        const data =   JSON.parse(reponse);
        const messageServices = this.rabbitmqService.messagePublisher(data);
        console.log(messageServices, "the message service data is passed");
        const user : any = {
          id : data._id,
          username : data.username,
          email : data.email,
          status : data.status
        }

        console.log(user);
       const token = this.jwtService.generateToken(user);
       return { token, user , data };
       }
        console.log(userLogin);
    }

    async changePassword(userData : AuthEntity): Promise<void> {
      return this.authRepository.changePassword(userData);
    }

    async googleAuth(googleAuthData: AuthEntity): Promise<any> {
      console.log("google auth is established");
      const userLogin:AuthEntity = googleAuthData;
      console.log(userLogin);
     const reponse :any =  await this.rabbitmqService.publishGoogleAuthData(userLogin);
     if(reponse == null){
      console.log(reponse," response is received");
     }else{
      console.log(reponse,"the data");
      const data =   JSON.parse(reponse);
      const user : any = {
        id : data._id,
        username : data.username,
        email : data.email
      }

      console.log(user);
     const token = this.jwtService.generateToken(user);
     return { token, user , data };
    }
  }
}