import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Phone } from './phone.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Phone)
    private phoneRepository: Repository<Phone>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async savePhoneNumber(phoneNumber: string) {
    const phone = this.phoneRepository.create({ phoneNumber });
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Kavenegar = require('kavenegar');
    const api = Kavenegar.KavenegarApi({
      apikey:
        '626173704752655247476B745969417235354E7942427A764839513561504139644B786B364C495A65446F3D',
    });
    api.Send({
      message:
        'ما اطلاعات مربوط به مصرف برق شما را دریافت کردیم برای دریافت اطلاعات بیشتر و راهنمایی های ما با ما در ارتباط باشید',
      sender: '2000660110',
      receptor: phoneNumber,
    });

    return await this.phoneRepository.save(phone);
  }
}
