// dtos.ts — DTOs para NestJS (runtime validation)

import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

// ----- Linhas (tabela de horários) -----

export class LinhaDto {
  @IsString()
  linha!: string;

  @IsString()
  nome!: string;

  @IsArray()
  @Matches(/^\d{2}:\d{2}:\d{2}$/, { each: true })
  partida_a!: string[];

  @IsArray()
  @Matches(/^\d{2}:\d{2}:\d{2}$/, { each: true })
  partida_b!: string[];
}

// ----- Blocos do Terminal (lista de linhas exibidas no terminal) -----

export class TerminalLinhaDto {
  @IsString()
  linha!: string;

  @IsString()
  nome!: string;
}

// ----- Detalhe de uma linha dentro de um item de itinerário -----

export class LinhaDetalheDto {
  @IsNumber()
  id!: number;

  @IsString()
  created_at!: string; // manter como string ISO

  @IsString()
  updated_at!: string;

  @IsString()
  linha!: string;

  @IsString()
  integracao!: string;

  @IsString()
  sentido!: string; // 'Circular' | 'ABBA' | 'Circular-BA'

  @IsString()
  dias!: string; // 'USD', 'U', etc.

  @IsString()
  nome!: string;

  @IsString()
  empresa!: string;

  @IsString()
  regiao!: string;

  @IsOptional()
  @IsString()
  obs?: string | null;

  @IsString()
  ponto_a!: string;

  @IsString()
  ponto_b!: string;

  @IsString()
  apelido!: string;

  @IsOptional()
  @IsString()
  saida?: string | null;

  @IsString()
  status!: string;

  @IsString()
  bilhetagem!: string;

  @IsOptional()
  @IsString()
  atualizacao?: string | null;

  @IsString()
  zp!: string;
}

// ----- Item de itinerário (cada etapa) -----

export class ItinerarioDto {
  @IsNumber()
  id!: number;

  @ValidateNested()
  @Type(() => LinhaDetalheDto)
  linha!: LinhaDetalheDto;

  @IsNumber()
  ordem!: number;

  @IsString()
  logradouro!: string;

  @IsOptional()
  @IsString()
  bairro?: string | null;

  @IsOptional()
  @IsString()
  obs?: string | null;

  @IsString()
  sentido!: string; // 'Ida' | 'Volta'

  @IsNumber()
  leg!: number;

  @IsOptional()
  @IsString()
  mapa?: string | null;

  @IsOptional()
  @IsString()
  ponto?: string | null;

  @IsOptional()
  @IsString()
  data?: string | null;

  @IsOptional()
  @IsString()
  os?: string | null;

  @IsString()
  created_at!: string;

  @IsString()
  updated_at!: string;

  // pode vir null
  @IsOptional()
  cod_viario?: number | null;

  // no payload vem como string JSON; se preferir, mude para string[]
  @IsString()
  trajeto!: string;
}

// ----- Terminal (agrupa linhas e itinerários) -----

export class TerminalDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TerminalLinhaDto)
  linhas!: TerminalLinhaDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItinerarioDto)
  itinerarios!: ItinerarioDto[];
}

// ----- Root (payload completo) -----
// Como `itinerarios` é um mapa com chaves dinâmicas (nome do terminal),
// validamos com @IsObject no root, e validamos cada TerminalDto manualmente quando necessário.

export type ItinerariosMapDto = Record<string, TerminalDto>;

export class RootDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinhaDto)
  linhas!: LinhaDto[];

  @IsObject()
  itinerarios!: ItinerariosMapDto;
}
