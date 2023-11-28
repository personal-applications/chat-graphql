import { Injectable } from '@nestjs/common';
import { LogInInput, LogInResponse } from './dto/login.dto';

@Injectable()
export class AuthService {
  logIn(input: LogInInput): Promise<LogInResponse> {
    throw new Error('Method not implemented.');
  }
}
