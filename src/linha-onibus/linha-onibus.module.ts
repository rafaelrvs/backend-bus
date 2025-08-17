import { Module } from '@nestjs/common';
import { LinhaOnibusService } from './linha-onibus.service';
import { LinhaOnibusController } from './linha-onibus.controller';

@Module({
  controllers: [LinhaOnibusController],
  providers: [LinhaOnibusService],
})
export class LinhaOnibusModule {}
