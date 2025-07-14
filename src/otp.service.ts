import { Injectable } from '@nestjs/common';

// In-memory store for OTPs (for demo; use persistent store in production)
const otpStore: Record<string, { code: string; expiresAt: number }> = {};

@Injectable()
export class OtpService {
  // Generate a 6-digit OTP
  generateOtp(phoneNumber: string): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore[phoneNumber] = { code, expiresAt };
    return code;
  }

  // Send OTP via Kavenegar
  async sendOtp(phoneNumber: string): Promise<void> {
    const code = this.generateOtp(phoneNumber);
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Kavenegar = require('kavenegar');
    const api = Kavenegar.KavenegarApi({
      apikey:
        '6C7636756355653734503542386D75727863676F2F7533597147454F48386B5754464E69746534307467343D',
    });
    await new Promise((resolve, reject) => {
      api.Send(
        {
          message: `کد تایید شما: ${code}`,
          receptor: phoneNumber,
        },
        (response, status) => {
          if (status === 200) resolve(response);
          else reject(response);
        },
      );
    });
  }

  // Verify OTP
  verifyOtp(phoneNumber: string, code: string): boolean {
    const record = otpStore[phoneNumber];
    if (!record) return false;
    if (record.expiresAt < Date.now()) return false;
    if (record.code !== code) return false;
    delete otpStore[phoneNumber]; // One-time use
    return true;
  }
}
