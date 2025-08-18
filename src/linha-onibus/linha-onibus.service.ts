import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class LinhaOnibusService implements OnModuleInit {
  private readonly logger = new Logger(LinhaOnibusService.name);
  private readonly CACHE_KEY = 'mogi:linhas:v1';
  private readonly TTL_SECONDS = 60 * 60 * 12; // 12h

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  // Pré-aquece ao subir o módulo (evita 1º hit frio após restart)
  async onModuleInit() {
    try {
      await this.prewarmEvery12Hours();
      this.logger.log('Cache pré-aquecido no startup.');
    } catch (e) {
      this.logger.warn('Falha ao pré-aquecer no startup.');
    }
  }

  async findAll() {
    const t0 = performance.now?.() ?? Date.now();

    const cached = await this.cache.get(this.CACHE_KEY);
    if (cached) {
      const ms = Math.round((performance.now?.() ?? Date.now()) - t0);
      this.logger.debug(`CACHE HIT (${ms} ms) -> ${this.CACHE_KEY}`);
      return cached;
    }

    try {
      const fresh = await this.fetchFromApiWithRetry();
      await this.cache.set(this.CACHE_KEY, fresh, this.ttlWithJitter());
      const ms = Math.round((performance.now?.() ?? Date.now()) - t0);
      this.logger.debug(`CACHE MISS+FETCH (${ms} ms). Set -> ${this.CACHE_KEY}`);
      return fresh;
    } catch (error) {
      this.logger.error('Erro ao buscar linhas de ônibus', error as any);
      return 'error';
    }
  }

  async findOne(linha: string) {
    const url = `https://mobilidadeservicos.mogidascruzes.sp.gov.br/site/transportes/linha_detalhada/${linha}`
    const res = await fetch(url)
        const html = await res.text()
    return html;
  }


  // --- Fetch com timeout + retry leve ---
  private async fetchFromApiWithRetry() {
    const url = 'https://mobilidadeservicos.mogidascruzes.sp.gov.br/public/buscar-linha';
    const TIMEOUT_MS = 30_000;
    const RETRIES = 1; // total 2 tentativas (0 + 1)

    for (let attempt = 0; attempt <= RETRIES; attempt++) {
      const controller = new AbortController();
      const to = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }
        return await res.json();
      } catch (err) {
        const finalTry = attempt === RETRIES;
        this.logger.warn(`fetch tentativa ${attempt + 1}/${RETRIES + 1} falhou: ${(err as Error).message}`);
        if (finalTry) throw err;
        // backoff simples
        await new Promise(r => setTimeout(r, 500));
      } finally {
        clearTimeout(to);
      }
    }
    // typescript happy:
    throw new Error('Falha ao obter dados após retries');
  }

  // Cron: 00:00 e 12:00
  @Cron('0 0 0,12 * * *')
  async prewarmEvery12Hours() {
    const fresh = await this.fetchFromApiWithRetry();
    await this.cache.set(this.CACHE_KEY, fresh, this.ttlWithJitter());
    this.logger.log('Cache de linhas atualizado (pré-aquecimento).');
  }

  async invalidateCache() {
    await this.cache.del(this.CACHE_KEY);
    this.logger.log(`Cache invalidado -> ${this.CACHE_KEY}`);
  }

  // TTL com jitter +/-5% (evita expiração simultânea)
  private ttlWithJitter(base = this.TTL_SECONDS) {
    const jitter = Math.floor((Math.random() * 0.10 - 0.05) * base);
    return base + jitter;
  }
}
