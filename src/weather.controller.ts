import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Logger, Param, Post, Put, Query } from '@nestjs/common';

import type { weatherSearchDto } from './DTO/weatherSearch.dto';
import { Weather } from './Entity/weather.entity';
import { WeatherService } from './weather.service';
import { weatherCreateDto } from './DTO/weatherCreate.dto';

@Controller('weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);
  constructor(private readonly weatherService: WeatherService) { }

  @Get()
  getAllWeather(@Query() param: weatherSearchDto) {
    this.logger.log(`GET /weather called with query: ${JSON.stringify(param)}`);
    try {
      if (Object.keys(param).length) {
        return this.weatherService.weatherSearch(param);
      } else {
        return this.weatherService.getAllWeatherConditions();
      }
    } catch (error) {
      this.logger.error('Error fetching weather data', error.stack);
      throw new InternalServerErrorException('Failed to fetch weather data');
    }
  }

  @Post()
  addWeatherCOndition(
    @Body() dto: weatherCreateDto) {
    const { date, location, tempMax, tempMin, condition } = dto
    this.logger.debug(`POST /weather called for location: ${location}, date: ${date}`);
    const dateParse = new Date(date)
    try {
      if (isNaN(dateParse.getTime())) {
        this.logger.warn(`Invalid date format received: ${date}`);
        throw new BadRequestException('Invalid date format');
      }
      return this.weatherService.createWeather(dateParse, location, tempMax, tempMin, condition)
    } catch (error) {
      this.logger.error('Error creating weather condition', error.stack);
      throw new InternalServerErrorException('Failed to create weather condition');
    }
  }

  @Get('/:location')
  getWeatherByLocation(@Param() location: string) {
    try {
      this.logger.log(`GET /weather/${location} called`);
      return this.weatherService.getWeatherByLocation(location);
    } catch (error) {
      this.logger.error(`Error fetching weather for location ${location}`, error.stack);
      throw new InternalServerErrorException('Failed to fetch weather for location');
    }
  }

  @Delete('/:location')
  async deleteWeather(@Param('location') location: string) {
    this.logger.warn(`DELETE /weather/${location} called`);
    try {
      await this.weatherService.deleteWeather(location);
      return { message: `Weather for ${location} deleted successfully` };
    } catch (error) {
      this.logger.error(`Error deleting weather for location ${location}`, error.stack);
      throw new InternalServerErrorException('Failed to delete weather data');
    }
  }

  @Put('/updateDelay')
  async updateWeather(@Body('delay') delayValue: number
  ) {
    this.logger.debug(`PUT /weather/updateDelay called with value: ${delayValue}`);
    try {
      await this.weatherService.delayUpdate(delayValue)
      return `delay updated to ${delayValue}`
    } catch (error) {
      this.logger.error('Error updating delay', error.stack);
      throw new InternalServerErrorException('Failed to update delay');
    }
  }
}
