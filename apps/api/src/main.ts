import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { AppModule } from "./modules/app.module";

let cachedServer: any;

async function createApp() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  const allowedOriginsRaw =
    process.env.CORS_ORIGIN ||
    process.env.CORS_ORIGINS ||
    "http://localhost:3000";
  const allowedOrigins = allowedOriginsRaw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(helmet());
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 120,
      standardHeaders: true,
      legacyHeaders: false
    })
  );
  app.enableCors({
    origin: allowedOrigins,
    credentials: true
  });
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false }
    })
  );
  await app.init();
  return app;
}

async function bootstrap() {
  const app = await createApp();
  await app.listen(process.env.API_PORT || 4000);
}

if (process.env.VERCEL !== "1") {
  bootstrap();
}

export default async function handler(req: any, res: any) {
  if (!cachedServer) {
    const app = await createApp();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer(req, res);
}
