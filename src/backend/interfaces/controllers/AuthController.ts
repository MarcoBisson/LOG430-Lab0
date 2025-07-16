import type { Request, Response } from 'express';
import { AuthService } from '../../application/services/AuthService';
import { PrismaUserRepository } from '../../infrastructure/prisma/PrismaUserRepository';
import { errorResponse } from '../../utils/errorResponse';
import { createControllerLogger } from '../../utils/logger';

const userRepository = new PrismaUserRepository();
const log = createControllerLogger('AuthController');

export class AuthController {
  static async login(req: Request, res: Response) {
    const { username, password } = req.body;

    const user = await userRepository.getUser(username);

    if (!user || !(await AuthService.comparePassword(password, user.password))) {
        log.warn(`User ${username} not found`);
        errorResponse(res, 401, 'Unauthorized', 'Invalid credentials', req.originalUrl);
    } else {
        log.info(`User ${username} found. Generate token for ${username}`,{id: user.id, username: user.username, role: user.role});
        const token = AuthService.generateToken({ id: user.id, role: user.role });
        res.json({ 
            user : {id: user.id, role: user.role},
            token, 
          });
    }
  }
}
