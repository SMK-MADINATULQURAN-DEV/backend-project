import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  // buat method untuk mengimkan verifikasi email-kembali

  async resendEmailVerifikasi(payload: {
    email: string;
    link: string;
    name: string;
   
  }) {
    await this.mailerService.sendMail({
      to: payload.email, // email tujuan
      subject: 'Verifikasi Email',
      template: 'verifikasi', // templae yang digunakan di folder templates
      context: {
        // untuk varibel di template hbs
        email: payload.email,
        link: payload.link,
        name: payload.name,
      },
    });
  }

  async lupaPassword(payload: { email: string; otp: string,  expiredTime: string }) {
    await this.mailerService.sendMail({
      to: payload.email, // email tujuan
      subject: 'Lupa Password',
      template: 'lupa-password', // templae yang digunakan di folder templates
      context: {
        // untuk varibel di template hbs
        otp: payload.otp,
        expiredTime: payload.expiredTime
      },
    });
  }
}
