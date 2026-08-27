import AppDataSource from '../data-source';
import { seedSegmentos } from './segmento.seed';
import { seedUsuariosTeste } from './usuarios-teste.seed';

async function run() {
  const dataSource = await AppDataSource.initialize();

  console.log('Populando segmentos...');
  await seedSegmentos(dataSource);

  console.log('Populando contas de teste (startup/investidor/mentor/admin)...');
  await seedUsuariosTeste(dataSource);

  console.log('Seed concluído.');
  console.log('');
  console.log('Contas de teste (senha 123456 para todas):');
  console.log('  startup@teste.com');
  console.log('  investidor@teste.com');
  console.log('  mentor@teste.com');
  console.log('  admin@teste.com');

  await dataSource.destroy();
}

run().catch((error) => {
  console.error('Erro ao rodar seed:', error);
  process.exit(1);
});
