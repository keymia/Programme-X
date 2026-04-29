import { Body, Controller, Post, Req } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ApplicationsService } from "./applications.service";
import { CreateMentorApplicationDto } from "./dto/create-mentor-application.dto";
import { CreateMenteeApplicationDto } from "./dto/create-mentee-application.dto";

type ReqMeta = { ip?: string; headers: { "user-agent"?: string } };

@Controller("applications")
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post("mentor")
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  submitMentor(
    @Body() body: CreateMentorApplicationDto & { honeypot?: string; submittedAt?: number },
    @Req() req: ReqMeta
  ) {
    const { honeypot, submittedAt, ...dto } = body;
    return this.applicationsService.createMentorApplication(dto, {
      honeypot,
      submittedAt,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
  }

  @Post("mentee")
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  submitMentee(
    @Body() body: CreateMenteeApplicationDto & { honeypot?: string; submittedAt?: number },
    @Req() req: ReqMeta
  ) {
    const { honeypot, submittedAt, ...dto } = body;
    return this.applicationsService.createMenteeApplication(dto, {
      honeypot,
      submittedAt,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });
  }
}

