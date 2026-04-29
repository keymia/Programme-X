import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { TwoFactorDto } from "./dto/two-factor.dto";
import { Roles } from "./roles.decorator";
import { RolesGuard } from "./roles.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @Throttle({ default: { limit: 5, ttl: 900_000 } })
  login(@Body() dto: LoginDto, @Req() req: { ip?: string; headers: { "user-agent"?: string } }) {
    return this.authService.login(dto, req.ip, req.headers["user-agent"]);
  }

  @Post("2fa/verify")
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  verify2FA(
    @Body() body: TwoFactorDto & { userId: string },
    @Req() req: { ip?: string; headers: { "user-agent"?: string } }
  ) {
    return this.authService.verifyTwoFactor(body.userId, body.code, req.ip, req.headers["user-agent"]);
  }

  @Post("2fa/enable")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  enable2FA(@Req() req: { user: { sub: string } }) {
    return this.authService.enableTwoFactor(req.user.sub);
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  me() {
    return { ok: true, role: "ADMIN" };
  }
}
