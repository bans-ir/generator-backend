import { Controller, Post, Body, Req } from '@nestjs/common';
import { AppService } from './app.service';

import { IsArray, IsInt, IsString, ValidateNested } from 'class-validator';

class ItemsDto {
  @IsInt()
  count: number;

  @IsString()
  title: string;

  @IsInt()
  value: number;
}

class CreatePhoneDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  value: string;

  @IsArray()
  @ValidateNested({ each: true })
  items: ItemsDto[];
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('phone')
  async createPhone(@Body() createPhoneDto: CreatePhoneDto, @Req() req) {
    return await this.appService.savePhoneNumber(
      createPhoneDto.phoneNumber,
      +createPhoneDto.value,
      createPhoneDto.items,
      req,
    );
  }
}
