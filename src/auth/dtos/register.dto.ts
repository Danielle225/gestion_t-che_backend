import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsEmail({}, { message: 'L\'email doit avoir un format valide' })
  @IsNotEmpty({ message: 'L\'email est obligatoire' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @MaxLength(100, { message: 'Le mot de passe ne peut pas dépasser 100 caractères' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
    message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
  })
  mot_de_passe: string;

  @IsString({ message: 'La confirmation du mot de passe doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'La confirmation du mot de passe est obligatoire' })
  @MinLength(6, { message: 'La confirmation du mot de passe doit contenir au moins 6 caractères' })
  @MaxLength(100, { message: 'La confirmation du mot de passe ne peut pas dépasser 100 caractères' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, {
    message: 'La confirmation du mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
  })
  mot_de_passe_confirmer: string;

}