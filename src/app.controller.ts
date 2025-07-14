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

  @IsArray()
  @ValidateNested({ each: true })
  items: ItemsDto[];
}

class VerifyOtpDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  otp: string;

  @IsInt()
  value: number;

  @IsArray()
  @ValidateNested({ each: true })
  items: ItemsDto[];
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('phone')
  async requestOtp(@Body() createPhoneDto: CreatePhoneDto) {
    return await this.appService.savePhoneNumber(createPhoneDto.phoneNumber);
  }

  @Post('phone/verify')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto, @Req() req) {
    return await this.appService.verifyOtp(
      verifyOtpDto.phoneNumber,
      verifyOtpDto.otp,
      verifyOtpDto.value,
      verifyOtpDto.items,
      req,
    );
  }
}
