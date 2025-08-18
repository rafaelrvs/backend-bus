import { Controller, Get, Param } from '@nestjs/common';
import { LinhaOnibusService } from './linha-onibus.service';

@Controller('linha-onibus')
export class LinhaOnibusController {

  constructor(private readonly linhaOnibusService: LinhaOnibusService) {}

  @Get()
  findAll() { 
    return this.linhaOnibusService.findAll();
  }

  @Get('horarios/:linha')
  async getHorarios(@Param('linha') linha: string) {    
    return this.linhaOnibusService.findOne(linha);
  }

}
