export class AuthEntity {
    public readonly username?: string; 
    public readonly email: string;
    public readonly password: string;
    public readonly otp: number;
    public readonly id?: string;

    
    constructor(id: string, name: string, email: string,password:string,otp:number) {
      this.id = id;
      this.username = name;
      this.email = email;
      this.password=password
      this.otp = otp;
    }
  }