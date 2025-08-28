import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { TacheRepository } from "../repositories/tache.repository";
import { CreateTaskDto } from "../dtos/create-tache.dto";
import { Tâches } from "@prisma/client";

@Injectable()
export class TacheService {
    private readonly logger = new Logger(TacheService.name);
    constructor(private readonly tacheRepository: TacheRepository) {}

    async createTask(data: CreateTaskDto & { utilisateur_id: number }): Promise<Tâches> {
        this.logger.log('Création d\'une nouvelle tâche:', data);
        try {
            const tache = await this.tacheRepository.create(data);
            return tache;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Erreur lors de la création de la tâche');
        }
    }
    async getTasksByUser(utilisateurId: number): Promise<Tâches[]> {
        try {
            const tasks = await this.tacheRepository.getTacheByUser(utilisateurId);
            return tasks;
        } catch (error) {
            throw new InternalServerErrorException('Erreur lors de la récupération des tâches');
        }
    }

    async getTask(id: number, utilisateurId: number): Promise<Tâches | null> {
        try {
            const task = await this.tacheRepository.getTacheById(id, utilisateurId);
            if (!task) {
                throw new NotFoundException('Tâche non trouvée');
            }
            return task;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Erreur lors de la récupération de la tâche');
        }
    }

    async updateTask(id: number, utilisateur_id: number, data: Partial<CreateTaskDto>): Promise<Tâches> {
        console.log('Mise à jour de la tâche:', { id, utilisateur_id, data });
        try {
            const existingTask = await this.tacheRepository.getTacheById(id, utilisateur_id);
            if (!existingTask) {
                throw new NotFoundException('Tâche non trouvée');
            }
            const updateTask = await this.tacheRepository.update(id, utilisateur_id, data);
            console.log('Tâche mise à jour avec succès:', updateTask);
            return updateTask;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error('Erreur lors de la mise à jour de la tâche', error);
            throw new InternalServerErrorException('Erreur lors de la mise à jour de la tâche');
        }
    }

    async deleteTask(id: number, utilisateur_id: number): Promise<void> {
        try {
            const existingTask = await this.tacheRepository.getTacheById(id, utilisateur_id);
            if (!existingTask) {
                throw new NotFoundException('Tâche non trouvée');
            }
            const deleteTask = await this.tacheRepository.delete(id, utilisateur_id);
            return deleteTask;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            this.logger.error('Erreur lors de la suppression de la tâche', error);
            throw new InternalServerErrorException('Erreur lors de la suppression de la tâche');
        }
    }
}
