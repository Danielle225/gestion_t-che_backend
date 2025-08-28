import { BadRequestException, Injectable, Logger, NotFoundException ,ConflictException, InternalServerErrorException, UnauthorizedException} from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { RegisterDto } from "../dtos/register.dto";
import * as bcrypt from 'bcrypt';
import { LoginDto } from "../dtos/login.dto";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

@Injectable()
export class AuthService{
    private readonly logger = new Logger(AuthService.name)
constructor(
    private prisma:PrismaService,
    private jwtService:JwtService
) {}

async Register(registerDto:RegisterDto){
    const { email, mot_de_passe } = registerDto;
    try {
      const existingUser = await this.prisma.utilisateurs.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException('Un compte avec cet email existe déjà');
      }

      if (registerDto.mot_de_passe !== registerDto.mot_de_passe_confirmer) {
        throw new BadRequestException('Les mots de passe ne correspondent pas');
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(mot_de_passe, saltRounds);

      const user = await this.prisma.utilisateurs.create({
        data: {
          email,
          mot_de_passe: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          dateCreation: true,
          dateModification: true,
        },
      });

      this.logger.log(`Nouvel utilisateur inscrit avec succès: ${email}`);

      return {
        user: {
          id: user.id,
          email: user.email,
          dateCreation: user.dateCreation,
          dateModification: user.dateModification
        }
      };

    } catch (error) {
      this.logger.error(`Erreur lors de l'inscription de ${email}:`, error);

      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Un compte avec cet email existe déjà');
      }

      throw new InternalServerErrorException('Erreur lors de la création du compte');
    }
  }

async validateUser(email: string,mot_de_passe?:string) {
  if (!email || typeof email !== 'string' || email.trim() === '') {
    throw new BadRequestException('Email requis et valide');
  }
  if (mot_de_passe !== undefined && (typeof mot_de_passe !== 'string' || mot_de_passe.trim() === '')) {
    throw new BadRequestException('Mot de passe requis et valide');
  }

  const user = await this.prisma.utilisateurs.findUnique({ where: { email } });
  if (user && mot_de_passe) {
    const isPasswordValid = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!isPasswordValid) {
      throw new BadRequestException('Mot de passe incorrect');
    }
    
  }
  return user;
}

async login(loginDto: LoginDto)
 {
    const { email, mot_de_passe } = loginDto;
    try{
        const user = await this.validateUser(email, mot_de_passe);
        if (!user)
    {
            throw new NotFoundException('Utilisateur non trouvé');
        }
        const payload = { email: user.email, sub: user.id };
        const accessToken = this.jwtService.sign(payload);
        return {
            access_token: accessToken,
            user:
            {
                id: user.id,
                email: user.email,
                dateCreation: user.dateCreation,
                dateModification: user.dateModification
    
            }
        };
    }
    catch(error) {
      this.logger.error(` Erreur lors de la connexion de ${email}:`, error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new InternalServerErrorException('Erreur lors de la connexion');
    }

 }
}