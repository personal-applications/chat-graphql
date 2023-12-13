import { Inject, Injectable, Logger } from '@nestjs/common';
import * as pug from 'pug';
import { Resend } from 'resend';
import { CONFIG, Config } from 'src/config/config.provider';

@Injectable({})
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);

  private compiledForgotPasswordTemplate: pug.compileTemplate;
  private compiledResetPasswordTemplate: pug.compileTemplate;

  constructor(
    @Inject(CONFIG)
    private readonly config: Config,
  ) {
    this.resend = new Resend(this.config.resendApiKey);

    this.compiledForgotPasswordTemplate = pug.compileFile(__dirname + '/templates/forgot-password.pug', {
      cache: true,
      debug: true,
    });
    this.compiledResetPasswordTemplate = pug.compileFile(__dirname + '/templates/reset-password.pug', {
      cache: true,
      debug: true,
    });
  }

  async sendResetPasswordConfirmationEmail(email: string, userName: string) {
    try {
      const data = await this.resend.emails.send({
        from: 'No reply <no-reply@trungpham.tech>',
        to: [email],
        subject: 'Password Reset Confirmation',
        html: this.compiledResetPasswordTemplate({
          userName,
          email,
        }),
      });
      this.logger.log(`Send reset password confirmation email success result: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      this.logger.error(`Send reset password confirmation error: ${JSON.stringify(error, null, 2)}`);
    }
  }

  async sendForgotPasswordEmail(email: string, userName: string, resetLink: string) {
    try {
      const data = await this.resend.emails.send({
        from: 'No reply <no-reply@trungpham.tech>',
        to: [email],
        subject: 'Password reset',
        html: this.compiledForgotPasswordTemplate({
          userName,
          resetLink,
          email,
        }),
      });
      this.logger.log(`Send forgot password email success result: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      this.logger.error(`Send forgot password email error: ${JSON.stringify(error, null, 2)}`);
    }
  }
}
