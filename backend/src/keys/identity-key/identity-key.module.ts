import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityKeysController } from './identity-key.controller';
import { IdentityKey } from './identity-key.entity';
import { IdentityKeysService } from './identity-key.service';

@Module({
  imports: [TypeOrmModule.forFeature([IdentityKey])],
  providers: [IdentityKeysService],
  controllers: [IdentityKeysController],
  exports: [IdentityKeysService]
})
export class IdentityKeysModule {}
