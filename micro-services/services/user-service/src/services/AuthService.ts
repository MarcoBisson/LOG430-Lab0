import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcryptjs';

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

export class AuthService {
  static generateToken(payload: object): string {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
  }

  static verifyToken(token: string): jwt.Jwt | jwt.JwtPayload | string {
    return jwt.verify(token, SECRET_KEY);
  }

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  static async comparePassword(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }
}
