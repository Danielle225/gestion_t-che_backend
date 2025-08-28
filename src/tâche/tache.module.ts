import { Module } from "@nestjs/common";
import { TacheRepository } from "./repositories/tache.repository";
import { TacheService } from "./service/tache.service";
import { TacheController } from "./controller/tache.controller";

@Module({
    imports: [],
    controllers: [TacheController],
    providers: [TacheService, TacheRepository],
})
export class TacheModule {}