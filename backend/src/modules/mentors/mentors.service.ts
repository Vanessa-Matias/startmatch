// mentors.service.ts
// =====================
// CRUD do perfil de Mentor (1:1 com Usuario). Sem busca com filtros nem
// paginação — a lista de mentores é pequena o bastante pra findAll() trazer
// tudo de uma vez; revisar isso se o volume crescer.
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

@Injectable()
export class MentorsService {
  constructor(
    @InjectRepository(Mentor)
    private readonly mentorRepository: Repository<Mentor>,
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

    return this.mentorRepository.save(mentor);
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
    return this.mentorRepository.save(mentor);
  }
}
