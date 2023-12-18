import { Provider } from '@nestjs/common';
import { DATA_SOURCE } from 'src/database/database.provider';
import { DataSource } from 'typeorm';
import { Message } from './models/message.model';

export const MESSAGE_REPOSITORY = 'MESSAGE_REPOSITORY';

export const messageProvider: Provider = {
  provide: MESSAGE_REPOSITORY,
  inject: [DATA_SOURCE],
  useFactory: (dataSource: DataSource) => dataSource.getRepository(Message),
};
