import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Weather } from './weather.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
              type:'sqlite',
              database:'weather.sqlite',
              entities:[Weather],
              synchronize:true,
            }),
            TypeOrmModule.forFeature([Weather])
        
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
