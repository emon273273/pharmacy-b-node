import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UserService {
  constructor(private readonly authService: AuthService) {}

  async login(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    const token = this.authService.generateToken(user);

    return {
      message: 'Login successful',
      user,
      token,
    };
  }
}
