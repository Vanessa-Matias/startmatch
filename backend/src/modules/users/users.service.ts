// users.service.ts
// ===================
// CRUD da entidade Usuario, incluindo o hash de senha (bcrypt) na criação —
// é por isso que AuthService.register() chama create() daqui em vez de
// mexer direto no repositório. Exportado para outros módulos (auth,
// principalmente) via UsersModule.
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Usuario } from './entities/usuario.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(dto: CreateUserDto): Promise<Usuario> {
    const existente = await this.usuarioRepository.findOne({
      where: { email: dto.email },
    });
    if (existente) {
      throw new ConflictException('Já existe uma conta com este e-mail.');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const usuario = this.usuarioRepository.create({
      nome: dto.nome,
      email: dto.email,
      senhaHash,
      tipo: dto.tipo,
    });

    return this.usuarioRepository.save(usuario);
  }

  async findAll(): Promise<Usuario[]> {
    return this.usuarioRepository.find({ order: { criadoEm: 'DESC' } });
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.usuarioRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException('Usuário não encontrado.');
    }
    return usuario;
  }

  async update(id: number, dto: UpdateUserDto): Promise<Usuario> {
    const usuario = await this.findById(id);
    Object.assign(usuario, dto);
    return this.usuarioRepository.save(usuario);
  }
}
