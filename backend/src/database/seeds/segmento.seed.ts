import { DataSource } from 'typeorm';
import { Segmento } from '../../modules/segments/entities/segmento.entity';

export const SEGMENTOS: { nome: string; slug: string }[] = [
  { nome: 'Fintech', slug: 'fintech' },
  { nome: 'Healthtech', slug: 'healthtech' },
  { nome: 'Edtech', slug: 'edtech' },
  { nome: 'Agtech', slug: 'agtech' },
  { nome: 'SaaS B2B', slug: 'saas-b2b' },
  { nome: 'Martech', slug: 'martech' },
  { nome: 'Logtech', slug: 'logtech' },
  { nome: 'Retailtech', slug: 'retailtech' },
  { nome: 'Greentech / Cleantech', slug: 'greentech' },
  { nome: 'Cybersecurity', slug: 'cybersecurity' },
  { nome: 'Mobtech', slug: 'mobtech' },
  { nome: 'Economia Criativa', slug: 'economia-criativa' },
];

export async function seedSegmentos(dataSource: DataSource): Promise<void> {
  const repository = dataSource.getRepository(Segmento);

  for (const segmento of SEGMENTOS) {
    await repository
      .createQueryBuilder()
      .insert()
      .into(Segmento)
      .values(segmento)
      .orIgnore()
      .execute();
  }
}
