import { IsEmail, IsIn, IsInt, IsString, Max, MaxLength, Min, MinLength } from "class-validator";

const LANGUAGES = ["francais", "anglais"] as const;

export class CreateMentorApplicationDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @IsEmail()
  @MaxLength(160)
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  level!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(240)
  expertise!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @IsIn(LANGUAGES)
  language!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  city!: string;

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

  @IsInt()
  @Min(1)
  @Max(20)
  mentorCapacity!: number;
}
