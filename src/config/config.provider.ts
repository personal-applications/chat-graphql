import { Provider } from '@nestjs/common';

export const CONFIG = 'CONFIG';

export type Config = {
  jwtSecret: string;
  expiresIn: number;
  resendApiKey: string;
  frontendUrl: string;
};

export const configProvider: Provider = {
  provide: CONFIG,
  useValue: {
    jwtSecret: process.env.JWT_SECRET,
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN, 10),
    resendApiKey: process.env.RESEND_API_KEY,
    frontendUrl: process.env.FRONTEND_URL,
  },
};
