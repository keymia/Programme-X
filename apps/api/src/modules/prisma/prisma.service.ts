import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly hasDatabaseUrl: boolean;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    const hasDatabaseUrl = typeof connectionString === "string" && connectionString.length > 0;
    const options: any = hasDatabaseUrl
      ? {
          adapter: new PrismaPg({
            connectionString
          })
        }
      : {};
    super(options);
    this.hasDatabaseUrl = hasDatabaseUrl;
  }

  async onModuleInit(): Promise<void> {
    if (!this.hasDatabaseUrl) {
      this.logger.warn("DATABASE_URL is missing. Prisma connection is disabled.");
      return;
    }
    try {
      await this.$connect();
    } catch (error) {
      this.logger.error("Prisma connection failed during bootstrap", error as Error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
