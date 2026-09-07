// mentors.service.ts
// =====================
// CRUD do perfil de Mentor (1:1 com Usuario). Sem busca com filtros nem
// paginação — a lista de mentores é pequena o bastante pra findAll() trazer
// tudo de uma vez; revisar isso se o volume crescer. Criação e atualização de
// perfil geram um evento de auditoria (categoria "mentor" — ver modules/audit).
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mentor } from './entities/mentor.entity';
import { CreateMentorProfileDto } from './dto/create-mentor-profile.dto';
import { UpdateMentorProfileDto } from './dto/update-mentor-profile.dto';
import { AuditService } from '../audit/audit.service';
import { TipoEventoAuditoria, ResultadoAuditoria } from '../../common/enums';

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(Mentor)
    private readonly mentorRepository: Repository<Mentor>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    usuarioId: number,
    dto: CreateMentorProfileDto,
  ): Promise<Mentor> {
    const existente = await this.mentorRepository.findOne({
      where: { usuarioId },
    });
    if (existente) {
      throw new ConflictException(
        'Este usuário já possui um perfil de mentor.',
      );
    }

    const mentor = this.mentorRepository.create({
      usuarioId,
      areaAtuacao: dto.areaAtuacao,
      bio: dto.bio,
      especialidades: dto.especialidades,
      vinculoPortoDigital: dto.vinculoPortoDigital ?? false,
      disponibilidade: dto.disponibilidade,
    });

    const salvo = await this.mentorRepository.save(mentor);

    await this.auditService.registrar({
      usuarioId,
      tipoEvento: TipoEventoAuditoria.MENTOR,
      evento: 'Perfil de mentor',
      acao: `Perfil de mentor criado (${dto.areaAtuacao})`,
      resultado: ResultadoAuditoria.SUCESSO,
    });

    return salvo;
  }

  async findAll(): Promise<Mentor[]> {
    return this.mentorRepository.find();
  }

  async findById(id: number): Promise<Mentor> {
    const mentor = await this.mentorRepository.findOne({ where: { id } });
    if (!mentor) {
      throw new NotFoundException('Mentor não encontrado.');
    }
    return mentor;
  }

  async findByUserId(usuarioId: number): Promise<Mentor> {
    const mentor = await this.mentorRepository.findOne({
      where: { usuarioId },
    });
    if (!mentor) {
      throw new NotFoundException('Perfil de mentor ainda não cadastrado.');
    }
    return mentor;
  }

  async update(
    usuarioId: number,
    dto: UpdateMentorProfileDto,
  ): Promise<Mentor> {
    const mentor = await this.findByUserId(usuarioId);
    Object.assign(mentor, dto);
    const salvo = await this.mentorRepository.save(mentor);

    await this.auditService.registrar({
      usuarioId,
      tipoEvento: TipoEventoAuditoria.MENTOR,
      evento: 'Perfil de mentor',
      acao: 'Perfil de mentor atualizado',
      resultado: ResultadoAuditoria.SUCESSO,
    });

    return salvo;
  }
}
