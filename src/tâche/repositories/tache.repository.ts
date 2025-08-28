import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateTaskDto } from "../dtos/create-tache.dto";
import { Tâches } from "@prisma/client";

@Injectable()
export class TacheRepository {
    private readonly logger = new Logger(TacheRepository.name);
    constructor(private prisma: PrismaService) {}

    async create(data: CreateTaskDto & { utilisateur_id: number }): Promise<Tâches> {
        this.logger.log("Création de la tâche...");
        return this.prisma.tâches.create({
            data: {
                titre: data.titre,
                description: data.description,
                status: data.status,
                utilisateur: {
                    connect: { id: data.utilisateur_id }
                }
            }
        });
    }
    async getTache(data: { id: number; utilisateur_id: number }): Promise<Tâches | null> {
        this.logger.log("Récupération de la tâche...");
        return this.prisma.tâches.findFirst({
            where: {
                id: Number(data.id),
                utilisateur_id: data.utilisateur_id
            }
        });
    }
    async getTacheByUser(utilisateur_id: number): Promise<Tâches[]> {
        this.logger.log("Récupération des tâches par utilisateur...");
        return this.prisma.tâches.findMany({
            where: {
                utilisateur_id: utilisateur_id
            }
        });
    }

    async getTacheById(id: number, utilisateur_id: number): Promise<Tâches | null> {
        this.logger.log("Récupération de la tâche par ID...");
        return this.prisma.tâches.findFirst({
            where: {
                id: Number(id), 
                utilisateur_id: utilisateur_id
            }
        });
    }

    async update(id: number, utilisateur_id: number, data: Partial<CreateTaskDto>): Promise<Tâches> {
        this.logger.log("Mise à jour de la tâche...");
        return this.prisma.tâches.updateMany({
            where: {
                id: Number(id), 
                utilisateur_id: utilisateur_id
            },
            data
        }).then(result => {
            if (result.count === 0) {
                throw new NotFoundException('Tâche non trouvée ou non appartenant à l\'utilisateur');
            }
            return this.getTache({ id, utilisateur_id }) as Promise<Tâches>;
        });
    }
    async delete(id: number, utilisateur_id: number): Promise<void> {
        this.logger.log("Suppression de la tâche...");
        const result = await this.prisma.tâches.deleteMany({
            where: {
                id:Number(id),
                utilisateur_id: utilisateur_id
            }
        });
        if (result.count === 0) {
            throw new NotFoundException('Tâche non trouvée ou non appartenant à l\'utilisateur');
        }
    }

}