import { Exclude, Expose, Type } from 'class-transformer';
import { StartupResponseDto } from '../../startups/dto/startup-response.dto';
import { InvestorResponseDto } from '../../investors/dto/investor-response.dto';

@Exclude()
export class SuggestionResponseDto {
  @Expose()
  score: number;

  @Expose()
  @Type(() => StartupResponseDto)
  startup?: StartupResponseDto;

  @Expose()
  @Type(() => InvestorResponseDto)
  investidor?: InvestorResponseDto;
}
