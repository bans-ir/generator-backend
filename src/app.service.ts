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
    return await this.phoneRepository.save(phone);
  }
}
