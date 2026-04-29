import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService, type JwtSignOptions } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { generateSecret, verify } from "otplib";
import { UsersService } from "../users/users.service";
import { PrismaService } from "../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  private async createTokens(user: { id: string; email: string; role: string }) {
    const jti = crypto.randomUUID();
    const payload = { sub: user.id, email: user.email, role: user.role, jti };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as JwtSignOptions["expiresIn"]
    });
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as JwtSignOptions["expiresIn"]
    });
    const refreshHash = await bcrypt.hash(refreshToken, 12);
    await this.prisma.adminSession.create({
      data: {
        userId: user.id,
        jwtId: jti,
        refreshHash,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw new UnauthorizedException("Account temporarily locked");
    }
    const match = await bcrypt.compare(dto.password, user.passwordHash);
    if (!match) {
      const failedLoginCount = user.failedLoginCount + 1;
      const lockoutUntil = failedLoginCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await this.usersService.updateFailedLogin(user.id, failedLoginCount, lockoutUntil);
      throw new UnauthorizedException("Invalid credentials");
    }
    if (user.role !== "ADMIN") throw new UnauthorizedException("Admin only");
    if (!user.isActive) throw new UnauthorizedException("Account disabled");

    if (user.twoFactorEnabled) {
      return { requires2FA: true, userId: user.id };
    }

    await this.usersService.markSuccessfulLogin(user.id);
    const tokens = await this.createTokens({ id: user.id, email: user.email, role: user.role });
    await this.prisma.adminActionLog.create({
      data: { userId: user.id, action: "LOGIN_SUCCESS", resource: "AUTH", ipAddress, userAgent }
    });
    return tokens;
  }

  async verifyTwoFactor(userId: string, code: string, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) throw new UnauthorizedException("2FA is not enabled");
    const result = await verify({ token: code, secret: user.twoFactorSecret });
    if (!result.valid) throw new UnauthorizedException("Invalid 2FA code");
    await this.usersService.markSuccessfulLogin(user.id);
    const tokens = await this.createTokens({ id: user.id, email: user.email, role: user.role });
    await this.prisma.adminActionLog.create({
      data: { userId: user.id, action: "LOGIN_2FA_SUCCESS", resource: "AUTH", ipAddress, userAgent }
    });
    return tokens;
  }

  async enableTwoFactor(userId: string) {
    const secret = generateSecret();
    await this.usersService.setTwoFactor(userId, secret, true);
    return { secret };
  }

  async logAction(userId: string, action: string, resource: string, ipAddress?: string, userAgent?: string) {
    await this.prisma.adminActionLog.create({
      data: { userId, action, resource, ipAddress, userAgent }
    });
  }
}
