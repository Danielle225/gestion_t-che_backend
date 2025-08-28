import { Module } from '@nestjs/common';
import { AuthController } from './auth/controller/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/service/auth.service';
import { PrismaService } from 'prisma/prisma.service';
import { JwtModule } from '@nestjs/jwt';
import { TacheService } from './tâche/service/tache.service';
import { TacheController } from './tâche/controller/tache.controller';
import { TacheRepository } from './tâche/repositories/tache.repository';

@Module({
  imports: [JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: { expiresIn: '1h' },
  }),
    AuthModule],
  controllers: [AuthController,TacheController],
  providers: [ AuthService, PrismaService, TacheService,TacheRepository ],
})
export class AppModule {}
