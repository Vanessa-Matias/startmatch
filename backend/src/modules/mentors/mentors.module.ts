// mentors.module.ts
// ====================
// Exporta MentorsService pelo mesmo motivo de startups/investors: admin
// (métricas — total de mentores, vínculo Porto Digital) depende dele.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mentor } from './entities/mentor.entity';
import { MentorsService } from './mentors.service';
import { MentorsController } from './mentors.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mentor])],
  controllers: [MentorsController],
  providers: [MentorsService],
  exports: [MentorsService],
})
export class MentorsModule {}
