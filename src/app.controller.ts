import { Controller, Post, Body, Req } from '@nestjs/common';
import { AppService } from './app.service';

import { IsString } from 'class-validator';

class CreatePhoneDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  value: string;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('phone')
  async createPhone(@Body() createPhoneDto: CreatePhoneDto, @Req() req) {
    return await this.appService.savePhoneNumber(
      createPhoneDto.phoneNumber,
      +createPhoneDto.value,
      req,
    );
  }
}
