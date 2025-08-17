import { Module } from '@nestjs/common';
import { LinhaOnibusModule } from './linha-onibus/linha-onibus.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

@Module({
  imports: [

     // Agenda (para pré-aquecimento opcional)
    ScheduleModule.forRoot(),

    // Cache global com Redis
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          // Use REDIS_URL OU host/port (não precisa dos dois)
          url: process.env.REDIS_URL, // ex: redis://default:pass@localhost:6379/0
          socket: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
          },
          database: process.env.REDIS_DB ? parseInt(process.env.REDIS_DB, 10) : 0,
          username: process.env.REDIS_USERNAME, // se houver
          password: process.env.REDIS_PASSWORD, // se houver
          ttl: 43200, // 12 horas (segundos)
        }),
      }),
    }),
LinhaOnibusModule,



  ],

})
export class AppModule {}
