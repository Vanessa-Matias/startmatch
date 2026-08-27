// conversations.service.ts
// ===========================
// assertParticipant() é o guard de negócio central deste módulo: toda leitura
// ou envio de mensagem passa por ele antes de tocar em qualquer dado, pra
// garantir que só as duas partes do Match (startup e investidor) acessem a
// conversa — não tem RolesGuard que resolva isso, é checado na mão pela
// relação com o Match.
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversa } from './entities/conversa.entity';
import { Mensagem } from './entities/mensagem.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversa)
    private readonly conversaRepository: Repository<Conversa>,
    @InjectRepository(Mensagem)
    private readonly mensagemRepository: Repository<Mensagem>,
  ) {}

  async findAllForUser(callerId: number): Promise<Conversa[]> {
    return this.conversaRepository
      .createQueryBuilder('conversa')
      .leftJoinAndSelect('conversa.match', 'match')
      .leftJoin('match.startup', 'startup')
      .leftJoin('match.investidor', 'investidor')
      .where(
        'startup.usuarioId = :callerId OR investidor.usuarioId = :callerId',
        { callerId },
      )
      .orderBy('conversa.criadaEm', 'DESC')
      .getMany();
  }

  private async assertParticipant(
    conversaId: number,
    callerId: number,
  ): Promise<Conversa> {
    const conversa = await this.conversaRepository.findOne({
      where: { id: conversaId },
      relations: { match: { startup: true, investidor: true } },
    });

    if (!conversa) {
      throw new NotFoundException('Conversa não encontrada.');
    }

    const pertence =
      conversa.match.startup.usuarioId === callerId ||
      conversa.match.investidor.usuarioId === callerId;

    if (!pertence) {
      throw new ForbiddenException('Você não participa desta conversa.');
    }

    return conversa;
  }

  async findMessages(
    conversaId: number,
    callerId: number,
  ): Promise<Mensagem[]> {
    await this.assertParticipant(conversaId, callerId);
    return this.mensagemRepository.find({
      where: { conversaId },
      order: { enviadaEm: 'ASC' },
    });
  }

  async postMessage(
    conversaId: number,
    callerId: number,
    dto: CreateMessageDto,
  ): Promise<Mensagem> {
    await this.assertParticipant(conversaId, callerId);
    const mensagem = this.mensagemRepository.create({
      conversaId,
      remetenteId: callerId,
      conteudo: dto.conteudo,
    });
    return this.mensagemRepository.save(mensagem);
  }
}
