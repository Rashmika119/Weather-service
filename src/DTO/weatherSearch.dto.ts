import { IsOptional, IsString } from "class-validator"

export class weatherSearchDto{
    @IsString()
    @IsOptional()
    date?: string

    @IsString()
    @IsOptional()
    location?: string

    @IsString()
    @IsOptional()
    condition?: string
} 