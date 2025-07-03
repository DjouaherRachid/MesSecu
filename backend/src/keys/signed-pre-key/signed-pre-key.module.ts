import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignedPreKeysController } from './signed-pre-key.controller';
import { SignedPreKey } from './signed-pre-key.entity';
import { SignedPreKeysService } from './signed-pre-key.service';

@Module({
  imports: [TypeOrmModule.forFeature([SignedPreKey])],
  providers: [SignedPreKeysService],
  controllers: [SignedPreKeysController],
  exports: [SignedPreKeysService]
})
export class SignedPreKeysModule {}
