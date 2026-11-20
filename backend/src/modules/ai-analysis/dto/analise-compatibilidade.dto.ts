// Dados que a tela "Análise IA" envia para a rota POST /ai/analise-compatibilidade.
// Tudo é validado aqui (tamanho, tipo, valores permitidos): a API recusa o que
// não estiver no formato e limita o tamanho do texto que chega até o modelo de IA.
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  ArrayMinSize,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const ESTAGIOS = ['ideacao', 'mvp', 'operacao', 'scale_up'] as const;
const SITUACOES = [
  'ativa',
  'baixada',
  'suspensa',
  'inapta',
  'nao_consultada',
] as const;

export class FichaStartupDto {
  @IsString()
  @MaxLength(120)
  nome: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  cidade?: string | null;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  uf?: string | null;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  segmentos: string[];

  @IsOptional()
  @IsIn(ESTAGIOS)
  estagio?: (typeof ESTAGIOS)[number] | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorPretendido?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  cnpj?: string | null;
}

export class FichaInvestidorDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  nome?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  cidade?: string | null;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  uf?: string | null;

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  segmentos: string[];

  @IsArray()
  @ArrayMaxSize(4)
  @IsIn(ESTAGIOS, { each: true })
  estagiosAceitos: (typeof ESTAGIOS)[number][];

  @IsOptional()
  @IsNumber()
  @Min(0)
  faixaMin?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  faixaMax?: number | null;

  @IsBoolean()
  exigeCnpjAtivo: boolean;
}

export class ConsultaCnpjDto {
  @IsIn(SITUACOES)
  situacao: (typeof SITUACOES)[number];

  @IsString()
  @MaxLength(80)
  fonte: string;

  @IsString()
  @MaxLength(20)
  data: string;
}

export class DocumentoStartupDto {
  @IsOptional()
  @IsIn(ESTAGIOS)
  estagioDeclarado?: (typeof ESTAGIOS)[number] | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  trecho?: string | null;
}

export class AnaliseCompatibilidadeDto {
  @IsObject()
  @ValidateNested()
  @Type(() => FichaStartupDto)
  startup: FichaStartupDto;

  @IsObject()
  @ValidateNested()
  @Type(() => FichaInvestidorDto)
  investidor: FichaInvestidorDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConsultaCnpjDto)
  consultaCnpj?: ConsultaCnpjDto | null;

  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentoStartupDto)
  documento?: DocumentoStartupDto | null;
}

// ---- Recomendação de várias startups de uma vez (botão "Analisar com IA") ----

export class StartupRecomendacaoDto extends FichaStartupDto {
  @IsInt()
  id: number;

  // Resultado SIMULADO da consulta ao CNPJ (a consulta real não é feita).
  @IsOptional()
  @IsIn(SITUACOES)
  situacaoCnpj?: (typeof SITUACOES)[number] | null;

  // Documento da startup (ex.: pitch) para checar contradição com a ficha.
  @IsOptional()
  @ValidateNested()
  @Type(() => DocumentoStartupDto)
  documento?: DocumentoStartupDto | null;
}

export class RecomendarStartupsDto {
  @IsObject()
  @ValidateNested()
  @Type(() => FichaInvestidorDto)
  investidor: FichaInvestidorDto;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => StartupRecomendacaoDto)
  startups: StartupRecomendacaoDto[];

  // Opcional: devolve só as startups com esta decisão (usado no modo de teste).
  @IsOptional()
  @IsIn(['sugerir_conversa', 'nao_recomendar', 'pendencia'])
  mostrar?: 'sugerir_conversa' | 'nao_recomendar' | 'pendencia';
}
