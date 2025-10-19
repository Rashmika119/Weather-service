import { NestFactory } from '@nestjs/core';
import { WeatherModule } from './weather.module';
import { createValidationPipe } from './pipe/validation.pipe';

async function bootstrap() {
  const app = await NestFactory.create(WeatherModule);
  app.useGlobalPipes(createValidationPipe());
  await app.listen(process.env.PORT ?? 5010);
}
bootstrap();
