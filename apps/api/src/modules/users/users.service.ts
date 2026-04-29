import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  updateFailedLogin(userId: string, failedLoginCount: number, lockoutUntil: Date | null) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginCount, lockoutUntil }
    });
  }

  markSuccessfulLogin(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { failedLoginCount: 0, lockoutUntil: null, lastLoginAt: new Date() }
    });
  }

  setTwoFactor(userId: string, secret: string, enabled: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret, twoFactorEnabled: enabled }
    });
  }
}
