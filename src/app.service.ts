import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const PHONE_NUMBERS_FILE = path.join(__dirname, '../phoneNumbers.json');

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async savePhoneNumber(phoneNumber: string) {
    // Read existing phone numbers
    let phoneNumbers: string[] = [];
    if (fs.existsSync(PHONE_NUMBERS_FILE)) {
      const data = fs.readFileSync(PHONE_NUMBERS_FILE, 'utf-8');
      phoneNumbers = JSON.parse(data);
    }
    // Add new phone number
    phoneNumbers.push(phoneNumber);
    // Save back to file
    fs.writeFileSync(
      PHONE_NUMBERS_FILE,
      JSON.stringify(phoneNumbers, null, 2),
      'utf-8',
    );

    // Kavenegar logic remains unchanged
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

    return { phoneNumber };
  }
}
