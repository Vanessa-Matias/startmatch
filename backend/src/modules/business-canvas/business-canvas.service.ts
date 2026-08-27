// business-canvas.service.ts
// =============================
// Upsert manual (find + create/save) em vez de um save() direto, porque
// PlanoNegocio é 1:1 com Startup e queremos preservar o registro existente ao
// atualizar campo a campo. findByUser() devolve um objeto vazio (não salvo)
// quando a startup ainda não preencheu o canvas, pra o frontend sempre ter
// algo pra exibir no formulário.
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlanoNegocio } from './entities/plano-negocio.entity';
import { Startup } from '../startups/entities/startup.entity';
import { UpsertBusinessCanvasDto } from './dto/upsert-business-canvas.dto';

@Injectable()
export class BusinessCanvasService {
  constructor(
    @InjectRepository(PlanoNegocio)
    private readonly planoNegocioRepository: Repository<PlanoNegocio>,
    @InjectRepository(Startup)
    private readonly startupRepository: Repository<Startup>,
  ) {}

  private async findStartupIdByUser(usuarioId: number): Promise<number> {
    const startup = await this.startupRepository.findOne({
      where: { usuarioId },
    });
    if (!startup) {
      throw new NotFoundException('Perfil de startup ainda não cadastrado.');
    }
    return startup.id;
  }

  async findByUser(usuarioId: number): Promise<PlanoNegocio> {
    const startupId = await this.findStartupIdByUser(usuarioId);
    const existente = await this.planoNegocioRepository.findOne({
      where: { startupId },
    });

    return (
      existente ??
      ({
        startupId,
        propostaValor: '',
        modeloReceita: '',
        publicoAlvo: '',
        estrategiaMonetizacao: '',
      } as PlanoNegocio)
    );
  }

  async upsert(
    usuarioId: number,
    dto: UpsertBusinessCanvasDto,
  ): Promise<PlanoNegocio> {
    const startupId = await this.findStartupIdByUser(usuarioId);
    const existente = await this.planoNegocioRepository.findOne({
      where: { startupId },
    });

    const planoNegocio = this.planoNegocioRepository.create({
      ...existente,
      startupId,
      ...dto,
    });

    return this.planoNegocioRepository.save(planoNegocio);
  }
}
