import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { MatchingService } from "./matching.service";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";

@Controller("matching")
@UseGuards(AuthGuard("jwt"), RolesGuard)
@Roles("ADMIN", "SUPER_ADMIN")
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post("generate")
  generate() {
    return this.matchingService.generate();
  }

  @Get()
  list() {
    return this.matchingService.list();
  }

  @Patch(":id/validate")
  validate(@Param("id") id: string, @Body() body: { approved: boolean; notes?: string }) {
    return this.matchingService.validateMatch(id, body.approved, body.notes);
  }

  @Patch(":id/override")
  override(@Param("id") id: string, @Body() body: { mentorId: string; notes?: string }) {
    return this.matchingService.overrideMatch(id, body.mentorId, body.notes);
  }
}

