import { DataSource } from 'typeorm';

import { User } from './user/user.entity';
import { Conversation } from './conversation/conversation.entity';
import { Message } from './message/message.entity'; 
import { ConversationParticipant} from './conversation/conversation-participant.entity';
import { MessageRead } from './message/message-read.entity';
import { OneTimePreKey } from './keys/one-time-pre-key/one-time-pre-key.entity';
import { SignedPreKey } from './keys/signed-pre-key/signed-pre-key.entity';
import { IdentityKey } from './keys/identity-key/identity-key.entity';
import { Session } from './session/session.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'db',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'messagerie',
  synchronize: false,
  migrationsRun: false,
  logging: true,
  entities: [
    User,
    Conversation,
    Message,
    ConversationParticipant,
    MessageRead,
    OneTimePreKey,
    SignedPreKey,
    IdentityKey,
    Session
  ],
  migrations: ['./migrations/*.ts'],
});
