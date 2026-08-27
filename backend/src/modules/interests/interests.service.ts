// interests.service.ts
// =======================
// Registra o interesse de um lado (startup ou investidor) e, se já existir o
// interesse recíproco do outro lado para o mesmo par, aciona
// MatchesService.createIfNotExists() — é aqui que "duas manifestações de
// interesse" viram um Match. O par (startupId, investidorId, origem) é único
// no banco, por isso o ConflictException tratado a partir do QueryFailedError.
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Interesse } from './entities/interesse.entity';
import { OrigemInteresse, TipoUsuario } from '../../common/enums';
import { StartupsService } from '../startups/startups.service';
import { InvestorsService } from '../investors/investors.service';
import { MatchesService } from '../matches/matches.service';
import { CreateInterestDto } from './dto/create-interest.dto';

@Injectable()
export class InterestsService {
  constructor(
    @InjectRepository(Interesse)
    private readonly interesseRepository: Repository<Interesse>,
    private readonly startupsService: StartupsService,
    private readonly investorsService: InvestorsService,
    private readonly matchesService: MatchesService,
  ) {}

  async create(
    callerId: number,
    callerTipo: TipoUsuario,
    dto: CreateInterestDto,
  ): Promise<Interesse> {
    let startupId: number;
    let investidorId: number;
    let origem: OrigemInteresse;

    if (callerTipo === TipoUsuario.STARTUP) {
      const startup = await this.startupsService.findByUserId(callerId);
      await this.investorsService.findById(dto.contraparteId);
      startupId = startup.id;
      investidorId = dto.contraparteId;
      origem = OrigemInteresse.STARTUP;
    } else {
      const investidor = await this.investorsService.findByUserId(callerId);
      await this.startupsService.findById(dto.contraparteId);
      startupId = dto.contraparteId;
      investidorId = investidor.id;
      origem = OrigemInteresse.INVESTIDOR;
    }

    let interesse: Interesse;
    try {
      interesse = await this.interesseRepository.save(
        this.interesseRepository.create({ startupId, investidorId, origem }),
      );
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new ConflictException('Interesse já registrado.');
      }
      throw error;
    }

    const origemOposta =
      origem === OrigemInteresse.STARTUP
        ? OrigemInteresse.INVESTIDOR
        : OrigemInteresse.STARTUP;
    const mutuo = await this.interesseRepository.findOne({
      where: { startupId, investidorId, origem: origemOposta },
    });

    if (mutuo) {
      await this.matchesService.createIfNotExists(startupId, investidorId);
    }

    return interesse;
  }

  async findSent(
    callerId: number,
    callerTipo: TipoUsuario,
  ): Promise<Interesse[]> {
    if (callerTipo === TipoUsuario.STARTUP) {
      const startup = await this.startupsService.findByUserId(callerId);
      return this.interesseRepository.find({
        where: { startupId: startup.id, origem: OrigemInteresse.STARTUP },
        order: { criadoEm: 'DESC' },
      });
    }
    const investidor = await this.investorsService.findByUserId(callerId);
    return this.interesseRepository.find({
      where: {
        investidorId: investidor.id,
        origem: OrigemInteresse.INVESTIDOR,
      },
      order: { criadoEm: 'DESC' },
    });
  }

  async findReceived(
    callerId: number,
    callerTipo: TipoUsuario,
  ): Promise<Interesse[]> {
    if (callerTipo === TipoUsuario.STARTUP) {
      const startup = await this.startupsService.findByUserId(callerId);
      return this.interesseRepository.find({
        where: { startupId: startup.id, origem: OrigemInteresse.INVESTIDOR },
        order: { criadoEm: 'DESC' },
      });
    }
    const investidor = await this.investorsService.findByUserId(callerId);
    return this.interesseRepository.find({
      where: { investidorId: investidor.id, origem: OrigemInteresse.STARTUP },
      order: { criadoEm: 'DESC' },
    });
  }
}
