import { Controller, Get } from '@nestjs/common';
import { LinhaOnibusService } from './linha-onibus.service';

@Controller('linha-onibus')
export class LinhaOnibusController {

  constructor(private readonly linhaOnibusService: LinhaOnibusService) {}

  @Get()
  findAll() { 
    return this.linhaOnibusService.findAll();
  }

}
