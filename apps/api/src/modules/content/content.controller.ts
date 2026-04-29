import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ContentType } from "@prisma/client";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { ContentService } from "./content.service";
import { UpsertContentDto } from "./dto/upsert-content.dto";

@Controller("content")
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get()
  list(@Query("type") type?: ContentType) {
    return this.contentService.list(type);
  }

  @Post()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  create(@Body() dto: UpsertContentDto) {
    return this.contentService.create(dto);
  }

  @Patch(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  update(@Param("id") id: string, @Body() dto: UpsertContentDto) {
    return this.contentService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  remove(@Param("id") id: string) {
    return this.contentService.remove(id);
  }
}
