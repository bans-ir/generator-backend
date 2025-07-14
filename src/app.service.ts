import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PdfService } from './pdf/pdf.service';
import { Request } from 'express';

const PHONE_NUMBERS_FILE = path.join(__dirname, '../phoneNumbers.json');

@Injectable()
export class AppService {
  private otpStore: Map<string, { otp: string; expiresAt: number }> = new Map();

  constructor(private readonly pdfService: PdfService) {}

  private generateOtp(length = 5): string {
    return Math.floor(
      Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1),
    ).toString();
  }

  async savePhoneNumber(phoneNumber: string) {
    // GeneraP
    const otp = this.generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    this.otpStore.set(phoneNumber, { otp, expiresAt });

    // Send OTP via SMS
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Kavenegar = require('kavenegar');

    const api = Kavenegar.KavenegarApi({
      apikey:
        '6C7636756355653734503542386D75727863676F2F7533597147454F48386B5754464E69746534307467343D',
    });
    await api.Send({
      message: `کد تایید شما: ${otp}`,
      receptor: phoneNumber,
    });

    // Do not save phone number or generate PDF yet
    return { phoneNumber, message: 'کد ارسال شد', otpCode: otp };
  }

  async verifyOtp(
    phoneNumber: string,
    otp: string,
    amount: number,
    items: {
      count: number;
      title: string;
      value: number;
    }[],
    req: Request,
  ) {
    const record = this.otpStore.get(phoneNumber);
    if (!record || record.otp !== otp || record.expiresAt < Date.now()) {
      return { success: false, message: 'Invalid or expired OTP' };
    }
    this.otpStore.delete(phoneNumber);

    // Save phone number
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

    // Generate PDF
    const fileName = `${Date.now()}-${phoneNumber}.pdf`;
    const relativePath = await this.pdfService.generatePdfToFile(
      amount,
      fileName,
      items,
    );

    // Build full PDF link
    const protocol = req.protocol;
    const host = req.get('host');
    const fullUrl = `${protocol}://${host}${relativePath}`;

    return { success: true, phoneNumber, pdfLink: fullUrl };
  }
}
