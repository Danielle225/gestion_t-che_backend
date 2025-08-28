import { Module } from "@nestjs/common";
import { AuthController } from "./controller/auth.controller";
import { AuthService } from "./service/auth.service";
import { JwtService, JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "prisma/prisma.module";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { ConfigService } from "@nestjs/config";

@Module({
    imports: [
        PrismaModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET,
            signOptions: { expiresIn: process.env.EXPIRES_IN || '1h' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, ConfigService]
})
export class AuthModule {}