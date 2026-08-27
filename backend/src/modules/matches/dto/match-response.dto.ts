import { Exclude, Expose, Type } from 'class-transformer';
import { StartupResponseDto } from '../../startups/dto/startup-response.dto';
import { InvestorResponseDto } from '../../investors/dto/investor-response.dto';

@Exclude()
export class MatchResponseDto {
  @Expose()
  id: number;

  @Expose()
  startupId: number;

  @Expose()
  investidorId: number;

  @Expose()
  scoreCompatibilidade: number;

  @Expose()
  criadoEm: Date;

  @Expose()
  @Type(() => StartupResponseDto)
  startup?: StartupResponseDto;

  @Expose()
  @Type(() => InvestorResponseDto)
  investidor?: InvestorResponseDto;
}
