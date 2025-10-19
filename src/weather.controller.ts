import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Post, Put, Query } from '@nestjs/common';

import type { weatherSearchDto } from './DTO/weatherSearch.dto';
import { Weather } from './Entity/weather.entity';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  private readonly logger = new Logger(WeatherController.name);
  constructor(private readonly weatherService: WeatherService) { }

  @Get()
  getAllWeather(@Query() param: weatherSearchDto) {
    this.logger.log(`GET /weather called with query: ${JSON.stringify(param)}`);
    if (Object.keys(param).length) {
      return this.weatherService.weatherSearch(param);
    } else {
      return this.weatherService.getAllWeatherConditions();
    }
  }

  @Post()
  addWeatherCOndition(
    @Body('date') date: string,
    @Body('location') location: string,
    @Body('tempMax') tempMax: number,
    @Body('tempMin') tempMin: number,
    @Body('condition') condition: string
  ) {
    this.logger.debug(`POST /weather called for location: ${location}, date: ${date}`);
    const dateParse = new Date(date)
    if (isNaN(dateParse.getTime())) {
      this.logger.warn(`Invalid date format received: ${date}`);
      throw new BadRequestException('Invalid date format');
    }

    return this.weatherService.createWeather(dateParse, location, tempMax, tempMin, condition)
  }

  @Get('/:location')
  getWeatherByLocation(@Param() location: string) {
    this.logger.log(`GET /weather/${location} called`);
    return this.weatherService.getWeatherByLocation(location);
  }
  @Get('/seven-days/:date/:location')
  getSeventDayForcast(@Param('date') date: string, @Param('location') location: string) {
    this.logger.log(`GET /weather/seven-days/${date}/${location} called`);

    return this.weatherService.getWeatherForSevenDays(date, location);

  }

  @Delete('/:location')
  deleteWeather(
    @Param() location: string
  ) {
    this.logger.warn(`DELETE /weather/${location} called`);
    this.weatherService.deleteWeather(location)
  }

  @Put('/updateDelay')
  async updateWeather(@Body('delay') delayValue: number
  ) {
    this.logger.debug(`PUT /weather/updateDelay called with value: ${delayValue}`);
    await this.weatherService.delayUpdate(delayValue)
    return `delay updated to ${delayValue}`
  }
}
