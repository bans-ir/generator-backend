import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PdfService } from './pdf/pdf.service';
import { Request } from 'express';
import axios from 'axios';
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

  private async sendVerificationSms(apiKey, receptor, token, template) {
    const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`;

    const params = {
      receptor,
      token,
      template,
    };

    try {
      const response = await axios.get(url, { params });
      const result = response.data;

      if (result.return.status === 200) {
        console.log('✅ پیامک با موفقیت ارسال شد.');
      } else {
        console.error(`⚠️ خطا از سمت Kavenegar: ${result.return.message}`);
      }
    } catch (err) {
      console.error('❌ خطا در ارتباط با سرور:', err.message);
    }
  }

  async savePhoneNumber(phoneNumber: string) {
    // GeneraP
    const otp = this.generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    this.otpStore.set(phoneNumber, { otp, expiresAt });

    // Send OTP via SMS
    this.sendVerificationSms(
      '6C7636756355653734503542386D75727863676F2F7533597147454F48386B5754464E69746534307467343D',
      phoneNumber,
      otp,
      'power',
    );

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
    try {
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

    } catch (error) {
      console.log(error)
    }
    
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
