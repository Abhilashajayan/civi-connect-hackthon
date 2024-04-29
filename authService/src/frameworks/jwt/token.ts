import jwt from 'jsonwebtoken';


export class JwtService {
  private readonly secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }
  
  generateToken(payload :any): string {
    console.log(payload,"the paylod data");
    const token = jwt.sign(payload, this.secretKey, { expiresIn: '15m' });
    console.log('Generated Token:', token);
    return token;
  }


  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.secretKey);
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }
}
