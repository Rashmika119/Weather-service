import { IsNumber, IsString } from "class-validator";

export class weatherCreateDto {

  @IsString()
  date: string;

  @IsString()
  location:string

  @IsNumber()
  tempMin: number;

  @IsNumber()
  tempMax!: number;

  @IsString()
  condition!: string;
}