import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { MAIL_TRANSPORTER, MailService } from './mail.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MAIL_TRANSPORTER,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const port = Number(configService.getOrThrow<string>('MAIL_PORT'));

        if (![465, 587].includes(port)) {
          throw new Error('MAIL_PORT debe ser 465 o 587 para Gmail SMTP.');
        }

        return nodemailer.createTransport({
          host: configService.getOrThrow<string>('MAIL_HOST'),
          port,
          secure: false, // true for 465, false for other ports
          auth: {
            user: configService.getOrThrow<string>('MAIL_USER'),
            pass: configService.getOrThrow<string>('MAIL_PASSWORD'),
          },
        });
      },
    },
    MailService,
  ],
  exports: [MailService],
})
export class MailModule {}
