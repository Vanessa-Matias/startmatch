// users.module.ts
// ==================
// Exporta UsersService porque é a base de que outros módulos dependem para
// ler/criar Usuario — AuthModule é o principal consumidor (registro e
// validação de login).
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
