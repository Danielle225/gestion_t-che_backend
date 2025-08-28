import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from'../service/auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    console.log('Payload JWT reçu dans la stratégie:', payload);
    try {
      if (!payload.email) {
        throw new UnauthorizedException('Token JWT invalide');
      }

      const user = await this.authService.validateUser(payload.email);
      console.log('Utilisateur validé par la stratégie JWT:', user);
      return user;

    } catch (error) {
      this.logger.error('Erreur lors de la validation du token JWT:', error);
      throw new UnauthorizedException('Token d\'authentification invalide');
    }
  }
}