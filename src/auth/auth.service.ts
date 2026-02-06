import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

export interface LoginResult {
  id: number;
  email: string;
  roleId: number | null;
}

export interface JwtPayload {
  id: number;
  email: string;
  roleId: number | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<LoginResult> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    return {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
    };
  }

  generateToken(user: LoginResult): string {
    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
    };
    return this.jwtService.sign(payload);
  }
}
