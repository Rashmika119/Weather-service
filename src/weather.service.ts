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
    try {
      return await this.weatherRepo.find();
    } catch (error) {
      this.logger.error("error of getting weather details ", error.stack)
      throw new InternalServerErrorException("failed to get weather ");
    }
  }
  async createWeather(
    date: Date,
    location: string,
    tempMin: number,
    tempMax: number,
    condition: string
  ): Promise<Weather> {
    try {
      this.logger.debug(`Creating weather for ${location} on ${date.toISOString()}`);
      const weather = this.weatherRepo.create({ date, location, tempMax, tempMin, condition });
      await this.weatherRepo.save(weather);
      return weather;
    } catch (error) {
      this.logger.error("error of creating weather ", error.stack)
      throw new InternalServerErrorException("failed to create weather ");
    }
  }

  private delay = Number(process.env.WEATHER_DELAY_MS) || 0;
  private failRate = Number(process.env.WEATHER_FAIL_RATE) || 0;


  //get weather forcast for next 7 days from start date
  async getWeatherForSevenDays(startDate: string, location: string): Promise<Weather[]> {
    if (!startDate || !location) {
      this.logger.warn('startDate or location missing');
      throw new HttpException("startDate and location required", 400)
    }


    if (this.delay > 0) {
      this.logger.debug(`Artificial delay applied: ${this.delay}ms`);
      await new Promise(res => setTimeout(res, this.delay));
    }

    if (Math.random() < this.failRate) {
      this.logger.warn('Simulated weather failure triggered');
      throw new Error('Simulated weather failure');
    }

    const start = new Date(startDate + 'T00:00:00Z');
    start.setHours(0, 0, 0, 0);
    //get a copy of original start date so the original one dont want to change
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    try {

      return this.weatherRepo.find({
        where: {
          location,
          date: Between(start, end),
        },
      });
    } catch (error) {
      this.logger.error("error of getting weather for seven days  ", error.stack)
      throw new InternalServerErrorException("failed to get weather for seven days");
    }

  }


  async deleteWeather(location: string): Promise<void> {
    this.logger.warn(`Deleting weather records for ${location}`);
    try {
      const result = await this.weatherRepo.delete(location);

      if (result.affected === 0) {
        this.logger.error(`Weather for location ${location} not found`);
        throw new NotFoundException(`Weather for location, ${location} is not found`)
      }
    } catch (error) {
      this.logger.error("error of deleting weather ", error.stack)
      throw new InternalServerErrorException("failed to delete weather ");
    }

  }


  async weatherSearch(weatherSearchDto: weatherSearchDto): Promise<Weather[]> {
    this.logger.log(`Searching weather with filters: ${JSON.stringify(weatherSearchDto)}`);
    const { date, location, condition } = weatherSearchDto;
    try {
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
    } catch (error) {
      this.logger.error("error of searching weather ", error.stack)
      throw new InternalServerErrorException("failed to search weather ");
    }

  }
  async getWeatherByLocation(location: string): Promise<Weather> {
    this.logger.log(`Fetching weather for location: ${location}`);
    try {
      const weather = await this.weatherRepo.findOne({ where: { location } })
      if (!weather) {
        this.logger.error(`Weather for ${location} not found`);
        throw new NotFoundException(`Weather in ${weather} ,is not found`);
      }
      return weather;
    } catch (error) {
      this.logger.error("error of get weather by location ", error.stack)
      throw new InternalServerErrorException("failed to getweather by location ");
    }
  }

  async delayUpdate(delayValue: number) {
    this.logger.debug(`Updating artificial delay to ${delayValue}ms`);
    this.delay = delayValue;
  }

}
