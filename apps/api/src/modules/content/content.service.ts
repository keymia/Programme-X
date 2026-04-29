import { Injectable, Logger } from "@nestjs/common";
import { ContentType, PublishStatus } from "../../generated/prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertContentDto } from "./dto/upsert-content.dto";

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async list(type?: ContentType) {
    try {
      return await this.prisma.contentItem.findMany({
        where: type ? { type } : undefined,
        orderBy: { updatedAt: "desc" }
      });
    } catch (error) {
      this.logger.warn("Content list fallback: database unavailable.");
      this.logger.debug(error);
      return [];
    }
  }

  create(dto: UpsertContentDto) {
    return this.prisma.contentItem.create({
      data: {
        ...dto,
        publishStatus: dto.publishStatus || PublishStatus.DRAFT,
        publishedAt: dto.publishStatus === PublishStatus.PUBLISHED ? new Date() : null
      }
    });
  }

  update(id: string, dto: UpsertContentDto) {
    return this.prisma.contentItem.update({
      where: { id },
      data: {
        ...dto,
        publishedAt: dto.publishStatus === PublishStatus.PUBLISHED ? new Date() : undefined
      }
    });
  }

  remove(id: string) {
    return this.prisma.contentItem.delete({ where: { id } });
  }
}
