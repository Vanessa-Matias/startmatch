// conversations.module.ts
// ==========================
// Só as próprias entidades (Conversa/Mensagem) — não depende de
// StartupsModule/InvestorsModule porque a checagem de participante
// (conversations.service.ts) usa a relação já carregada via Match, sem
// precisar dos services desses módulos.
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversa } from './entities/conversa.entity';
import { Mensagem } from './entities/mensagem.entity';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Conversa, Mensagem])],
  controllers: [ConversationsController],
  providers: [ConversationsService],
  exports: [ConversationsService],
})
export class ConversationsModule {}
