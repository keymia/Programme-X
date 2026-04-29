import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { encryptText } from "../security/security.util";
import { CreateMentorApplicationDto } from "./dto/create-mentor-application.dto";
import { CreateMenteeApplicationDto } from "./dto/create-mentee-application.dto";

@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService
  ) {}

  private validateAntiSpam(honeypot?: string, submittedAt?: number) {
    if (honeypot && honeypot.trim().length > 0) throw new BadRequestException("Spam detected");
    if (!submittedAt || Number.isNaN(submittedAt)) throw new BadRequestException("Invalid submission");
    const elapsed = Date.now() - submittedAt;
    if (elapsed < 3000) throw new BadRequestException("Submission too fast");
  }

  async createMentorApplication(
    dto: CreateMentorApplicationDto,
    meta: { ipAddress?: string; userAgent?: string; honeypot?: string; submittedAt?: number }
  ) {
    this.validateAntiSpam(meta.honeypot, meta.submittedAt);
    const created = await this.prisma.mentorApplication.create({
      data: {
        ...dto,
        ipAddress: meta.ipAddress ? encryptText(meta.ipAddress) : null,
        userAgent: meta.userAgent
      }
    });
    await this.notificationsService.send(created.email, created.fullName, "registration_received");
    await this.notificationsService.send(created.email, created.fullName, "welcome");
    return created;
  }

  async createMenteeApplication(
    dto: CreateMenteeApplicationDto,
    meta: { ipAddress?: string; userAgent?: string; honeypot?: string; submittedAt?: number }
  ) {
    this.validateAntiSpam(meta.honeypot, meta.submittedAt);
    const created = await this.prisma.menteeApplication.create({
      data: {
        ...dto,
        ipAddress: meta.ipAddress ? encryptText(meta.ipAddress) : null,
        userAgent: meta.userAgent
      }
    });
    await this.notificationsService.send(created.email, created.fullName, "registration_received");
    await this.notificationsService.send(created.email, created.fullName, "welcome");
    return created;
  }
}
