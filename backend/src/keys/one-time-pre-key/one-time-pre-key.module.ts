import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeyService } from './one-time-pre-key.service';
import { OneTimePreKeyController } from './one-time-pre-key.controller';
import { User } from '../../user/user.entity';
import { OneTimePreKey } from './one-time-pre-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OneTimePreKey, User])],
  providers: [KeyService],
  controllers: [OneTimePreKeyController],
  exports: [KeyService],
})
export class OneTimePreKeyModule {}
