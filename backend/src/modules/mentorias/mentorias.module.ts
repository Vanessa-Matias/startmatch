// mentorias.module.ts
// ======================
// Usa os repositórios de Mentoria, Mentor e Startup direto (sem importar os
// outros módulos) para evitar dependência circular.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mentoria } from './entities/mentoria.entity';
import { Mentor } from '../mentors/entities/mentor.entity';
import { Startup } from '../startups/entities/startup.entity';
import { MentoriasService } from './mentorias.service';
import { MentoriasController } from './mentorias.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Mentoria, Mentor, Startup])],
  controllers: [MentoriasController],
  providers: [MentoriasService],
})
export class MentoriasModule {}
