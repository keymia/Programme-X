import { IsEnum, IsObject, IsOptional, IsString, MaxLength } from "class-validator";
import { ContentType, Prisma, PublishStatus } from "@prisma/client";

export class UpsertContentDto {
  @IsEnum(ContentType)
  type!: ContentType;

  @IsString()
  @MaxLength(180)
  title!: string;

  @IsString()
  @MaxLength(180)
  slug!: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  body?: string;

  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @IsOptional()
  @IsString()
  externalUrl?: string;

  @IsOptional()
  @IsObject()
  metadata?: Prisma.InputJsonObject;

  @IsOptional()
  @IsEnum(PublishStatus)
  publishStatus?: PublishStatus;
}
