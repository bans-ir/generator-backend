import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';

import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class CreatePhoneDto {
  @ApiProperty({ example: '1234567890', description: 'Phone number to save' })
  @IsString()
  phoneNumber: string;
}

@ApiTags('phone')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('phone')
  @ApiBody({ type: CreatePhoneDto })
  @ApiResponse({ status: 201, description: 'Phone number saved' })
  async createPhone(@Body() createPhoneDto: CreatePhoneDto) {
    return await this.appService.savePhoneNumber(createPhoneDto.phoneNumber);
  }
}
