import { PartialType } from '@nestjs/mapped-types';
import { CreateLinhaOnibusDto } from './create-linha-onibus.dto';

export class UpdateLinhaOnibusDto extends PartialType(CreateLinhaOnibusDto) {}
