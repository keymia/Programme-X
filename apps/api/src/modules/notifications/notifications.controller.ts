import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
@UseGuards(AuthGuard("jwt"), RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post("meeting-reminder")
  reminder(@Body() body: { email: string; name: string; details?: string }) {
    return this.notificationsService.send(body.email, body.name, "meeting_reminder", { details: body.details || "" });
  }

  @Post("program-end")
  end(@Body() body: { email: string; name: string }) {
    return this.notificationsService.send(body.email, body.name, "program_end");
  }

  @Post("satisfaction")
  satisfaction(@Body() body: { email: string; name: string }) {
    return this.notificationsService.send(body.email, body.name, "satisfaction");
  }
}

