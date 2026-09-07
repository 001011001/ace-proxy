import { Module } from '@nestjs/common';
import { UserLevelService } from './UserLevelService';
import { MembershipController } from './MembershipController';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MembershipController],
  providers: [UserLevelService],
  exports: [UserLevelService],
})
export class MembershipModule {}
