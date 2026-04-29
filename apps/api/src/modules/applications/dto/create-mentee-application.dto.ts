import { IsEmail, IsIn, IsString, MaxLength, MinLength } from "class-validator";

const ACADEMIC_LEVELS = [
  "12e annee",
  "1re annee premed",
  "2e annee premed",
  "3e annee premed",
  "4e annee premed",
  "Medecine - annee 1",
  "Medecine - annee 2",
  "Medecine - annee 3",
  "Medecine - annee 4",
  "Medecine - internat",
  "Medecine - residence R1",
  "Medecine - residence R2",
  "Medecine - residence R3",
  "Medecine - residence R4+",
  "Medecine - fellow"
] as const;
const LANGUAGES = ["francais", "anglais"] as const;

export class CreateMenteeApplicationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @IsIn(ACADEMIC_LEVELS)
  academicLevel!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(500)
  goals!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @IsIn(LANGUAGES)
  language!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  region!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  availability!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  targetSpecialty!: string;
}
