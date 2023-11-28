import { Provider } from '@nestjs/common';

export const CONFIG = 'CONFIG';

export type Config = {
  jwtSecret: string;
  expiresIn: number;
};

export const configProvider: Provider = {
  provide: CONFIG,
  useValue: {
    jwtSecret: process.env.JWT_SECRET,
    expiresIn: parseInt(process.env.JWT_EXPIRES_IN, 10),
  },
};
