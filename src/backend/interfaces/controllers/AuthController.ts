import type { Request, Response } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { PrismaUserRepository } from '../../infrastructure/prisma/PrismaUserRepository';

const userRepository = new PrismaUserRepository();

export class AuthController {
  static async login(req: Request, res: Response) {
    const { username, password } = req.body;

    const user = await userRepository.getUser(username);

    if (!user || !(await AuthService.comparePassword(password, user.password))) {
        res.status(401).json({ error: 'Invalid credentials' });
    } else {
        const token = AuthService.generateToken({ id: user.id, role: user.role });
        res.json({ 
            user : {id: user.id, role: user.role},
            token, 
          });
    }
  }
}
