import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PdfService } from './pdf/pdf.service';
import { Request } from 'express';

const PHONE_NUMBERS_FILE = path.join(__dirname, '../phoneNumbers.json');

@Injectable()
export class AppService {
  constructor(private readonly pdfService: PdfService) {}

  async savePhoneNumber(
    phoneNumber: string,
    amount: number,
    items: {
      count: number;
      title: string;
      value: number;
    }[],
    req: Request,
  ) {
    // ذخیره شماره در فایل
    let phoneNumbers: string[] = [];
    if (fs.existsSync(PHONE_NUMBERS_FILE)) {
      const data = fs.readFileSync(PHONE_NUMBERS_FILE, 'utf-8');
      phoneNumbers = JSON.parse(data);
    }
    phoneNumbers.push(phoneNumber);
    fs.writeFileSync(
      PHONE_NUMBERS_FILE,
      JSON.stringify(phoneNumbers, null, 2),
      'utf-8',
    );

    // ساخت فایل PDF
    const fileName = `${Date.now()}-${phoneNumber}.pdf`;
    const relativePath = await this.pdfService.generatePdfToFile(
      amount,
      fileName,
      items,
    );

    // تشخیص دامین و ساخت لینک کامل
    const protocol = req.protocol;
    const host = req.get('host'); // ← مثل: localhost:3000 یا yourdomain.com
    const fullUrl = `${protocol}://${host}${relativePath}`; // ← لینک کامل به PDF

    // ارسال پیامک
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Kavenegar = require('kavenegar');
    const api = Kavenegar.KavenegarApi({
      apikey:
        '6C7636756355653734503542386D75727863676F2F7533597147454F48386B5754464E69746534307467343D',
    });

    api.Send({
      message: `✅ اطلاعات شما ثبت شد.\n📄 مشاهده PDF:\n${fullUrl}`,
      receptor: phoneNumber,
    });

    return { phoneNumber, pdfLink: fullUrl };
  }
}
