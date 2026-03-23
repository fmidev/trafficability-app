import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsArray,
} from 'class-validator';

export class AppDto {
  @IsUUID()
  id: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsString()
  @IsOptional()
  contestantName: string;

  @IsString()
  @IsNotEmpty()
  certainty: string;

  @IsString()
  @IsNotEmpty()
  file: string;

  @IsOptional()
  @IsString()
  fileDateTime: string;

  @IsArray()
  geoLocation: [number, number];

  @IsNumber()
  geoLocationAccuracy: number | null;

  @IsOptional()
  @IsArray()
  userGeoLocation?: [number | null, number | null];

  @IsOptional()
  @IsArray()
  fileGeoLocation?: [number | null, number | null];
}
