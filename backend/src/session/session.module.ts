import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './session.entity';
import { User } from 'src/user/user.entity';
import { SessionController } from './session.controller';
import { SessionService } from './session.service';
import { IdentityKeysModule } from 'src/keys/identity-key/identity-key.module';
import { SignedPreKeysModule } from 'src/keys/signed-pre-key/signed-pre-key.module';
import { OneTimePreKeyModule } from 'src/keys/one-time-pre-key/one-time-pre-key.module';

@Module({
  imports: [TypeOrmModule.forFeature([Session, User]),
  IdentityKeysModule, SignedPreKeysModule, OneTimePreKeyModule],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
