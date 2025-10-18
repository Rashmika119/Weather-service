import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';

import type { weatherSearchDto } from './weatherSearch.dto';
import { Weather } from './weather.entity';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) { }

  @Get()
  getAllWeather(@Query() param: weatherSearchDto) {
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
    const dateParse = new Date(date)
    if (isNaN(dateParse.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.weatherService.createWeather(dateParse, location, tempMax, tempMin, condition)
  }

  @Get('/:location')
  getWeatherByLocation(@Param() location: string) {
    return this.weatherService.getWeatherByLocation(location);
  }
  @Get('/seven-days/:date/:location')
  getSeventDayForcast(@Param('date') date: string, @Param('location') location: string) {
    
    return this.weatherService.getWeatherForSevenDays(date, location);

  }

  @Delete('/:location')
  deleteWeather(
    @Param() location: string
  ) {
    this.weatherService.deleteWeather(location)
  }

  @Put('/updateDelay')
  async updateWeather(@Body('delay') delayValue: number
  ) {
    await this.weatherService.delayUpdate(delayValue)
    return `delay updated to ${delayValue}`
  }
}
