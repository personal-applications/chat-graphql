import { Inject, Injectable, Logger } from '@nestjs/common';
import * as pug from 'pug';
import { Resend } from 'resend';
import { CONFIG, Config } from 'src/config/config.provider';

@Injectable({})
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);
  private compiledForgotPasswordTemplate: pug.compileTemplate;

  constructor(
    @Inject(CONFIG)
    private readonly config: Config,
  ) {
    this.resend = new Resend(this.config.resendApiKey);
    this.compiledForgotPasswordTemplate = pug.compileFile(
      __dirname + '/templates/forgot-password.pug',
      {
        cache: true,
        debug: true,
      },
    );
  }

  async sendForgotPasswordEmail(email: string) {
    try {
      const data = await this.resend.emails.send({
        from: 'No reply <no-re@trungpham.tech>',
        to: [email],
        subject: 'Password reset',
        text: this.compiledForgotPasswordTemplate({
          userName: '',
          resetLink: '',
        }),
      });
      this.logger.log(
        `Send forgot password email success result: ${JSON.stringify(
          data,
          null,
          2,
        )}`,
      );
    } catch (error) {
      this.logger.error(
        `Send forgot password email error: ${JSON.stringify(error, null, 2)}`,
      );
    }
  }
}
