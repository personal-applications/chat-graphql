import { Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DATA_SOURCE } from '../database/database.provider';
import { User } from './models/user.model';

export const USER_REPOSITORY = 'USER_REPOSITORY';

export const userProviders: Provider[] = [
  {
    provide: USER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    inject: [DATA_SOURCE],
  },
];
