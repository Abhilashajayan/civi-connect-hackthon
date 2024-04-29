import { UserEntity } from "../../entity/user.entity";

export interface IUserCase {
  register(user: UserEntity): Promise<void>;
  login(data:UserEntity ): Promise<void> ;
  getAllUsers(): Promise<any>;
  editUser(userId : string, data : UserEntity , req :  any): Promise<void>;
  changePassword(data : UserEntity): Promise<void>;
  googleAuth(authData : UserEntity) : Promise<void>;

}