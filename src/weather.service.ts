import { HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Weather } from './Entity/weather.entity';
import { Between, Repository } from 'typeorm';
import { weatherSearchDto } from './DTO/weatherSearch.dto';
import { InjectRepository } from '@nestjs/typeorm';

require('dotenv').config();

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    @InjectRepository(Weather)
    private readonly weatherRepo: Repository<Weather>,
  ) { }
  async getAllWeatherConditions(): Promise<Weather[]> {
    this.logger.log('Fetching all weather records');

      return await this.weatherRepo.find();
  }
  async createWeather(
    date: Date,
    location: string,
    tempMin: number,
    tempMax: number,
    condition: string
  ): Promise<Weather> {

      this.logger.debug(`Creating weather for ${location} on ${date.toISOString()}`);
      const weather = this.weatherRepo.create({ date, location, tempMax, tempMin, condition });
      await this.weatherRepo.save(weather);
      return weather;
  }

  private delay = Number(process.env.WEATHER_DELAY_MS) || 0;
  private failRate = Number(process.env.WEATHER_FAIL_RATE) || 0;


  //get weather forcast for next 7 days from start date

  async deleteWeather(location: string): Promise<void> {
    this.logger.warn(`Deleting weather records for ${location}`);
      const result = await this.weatherRepo.delete(location);

      if (result.affected === 0) {
        this.logger.error(`Weather for location ${location} not found`);
        throw new NotFoundException(`Weather for location, ${location} is not found`)
      }

  }


  async weatherSearch(weatherSearchDto: weatherSearchDto): Promise<Weather[]> {
    this.logger.log(`Searching weather with filters: ${JSON.stringify(weatherSearchDto)}`);
    const { date, location, condition } = weatherSearchDto;
      const query = this.weatherRepo.createQueryBuilder('weather')

      if (date) {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        query.andWhere('weather.date BETWEEN :start AND :end', {
          start: start.toISOString(),
          end: end.toISOString(),
        });
      }
      if (location) {
        query.andWhere('weather.location LIKE :location', {
          location: `%${location}%`,
        })
      }

      if (condition) {
        query.andWhere('weather.condition LIKE :condition', {
          condition: `%${condition}%`,
        })
      }
      return await query.getMany();
  }

  async getWeatherByLocation(location: string): Promise<Weather> {
    this.logger.log(`Fetching weather for location: ${location}`);
      const weather = await this.weatherRepo.findOne({ where: { location } })
      if (!weather) {
        this.logger.error(`Weather for ${location} not found`);
        throw new NotFoundException(`Weather in ${weather} ,is not found`);
      }
      return weather;
  }

  async delayUpdate(delayValue: number) {
    this.logger.debug(`Updating artificial delay to ${delayValue}ms`);
    this.delay = delayValue;
  }

}
