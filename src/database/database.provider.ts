import { Provider } from '@nestjs/common';
import { DataSource } from 'typeorm';

export const DATA_SOURCE = 'DATA_SOURCE';

export const databaseProviders: Provider[] = [
  {
    provide: DATA_SOURCE,
    useFactory: () => {
      const dataSource = new DataSource({
        type: 'sqlite',
        database: './database.sqlite',
        entities: [__dirname + '/../**/*.model{.ts,.js}'],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
