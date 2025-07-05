import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { RsaKeyService } from './rsa-key.service';
import { RsaKeyController } from './rsa-key.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User ])],
  providers: [RsaKeyService],
  controllers: [RsaKeyController],
  exports: [RsaKeyService],
})

export class RsaKeyModule {}
