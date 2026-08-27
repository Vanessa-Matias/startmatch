// segments.controller.ts
// =========================
// Único endpoint: lista de segmentos/verticais de mercado usada para popular
// os selects de cadastro/busca de startup e investidor no frontend. Rota
// pública e somente leitura — os segmentos são cadastrados via seed
// (database/seeds/segmento.seed.ts), não por essa API.
import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { SegmentsService } from './segments.service';
import { SegmentoResponseDto } from './dto/segmento-response.dto';

@ApiTags('segments')
@Controller('segments')
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) {}

  @Get()
  async findAll(): Promise<SegmentoResponseDto[]> {
    const segmentos = await this.segmentsService.findAll();
    return plainToInstance(SegmentoResponseDto, segmentos);
  }
}
