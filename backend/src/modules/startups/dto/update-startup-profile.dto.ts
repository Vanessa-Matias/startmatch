import { PartialType } from '@nestjs/swagger';
import { CreateStartupProfileDto } from './create-startup-profile.dto';

export class UpdateStartupProfileDto extends PartialType(
  CreateStartupProfileDto,
) {}
