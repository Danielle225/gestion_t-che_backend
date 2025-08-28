import { Body, Controller, Logger, Post, UseGuards, Request, Get, Patch, Param, Delete, HttpCode } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guard/jwt-auth.guard";
import { TacheService } from "../service/tache.service";
import { CreateTaskDto } from "../dtos/create-tache.dto";
import { UpdateTaskDto } from "../dtos/update-tache.dto";

@Controller('taches')
@UseGuards(JwtAuthGuard)
export class TacheController {
    private readonly logger = new Logger(TacheController.name);
    constructor(private readonly tacheService: TacheService) {}

    @Post()
   async create(@Request() req: any, @Body() createTaskDto: CreateTaskDto) {
    const userId = req.user.id;
    
    this.logger.log(`Création d'une nouvelle tâche pour l'utilisateur ${userId}`);
    return this.tacheService.createTask({ ...createTaskDto, utilisateur_id: userId });
  }

  @Get()
  async getTasksByUser(@Request() req: any) {
    const userId = req.user.id;
    this.logger.log(`Récupération des tâches pour l'utilisateur ${userId}`);
    return this.tacheService.getTasksByUser(userId);
  }

 @Patch(':id')
 async update(@Param('id') id: number, @Request() req: any, @Body() updateTaskDto: UpdateTaskDto) {

   const userId = req.user.id;
   this.logger.log(`Mise à jour de la tâche ${id} pour l'utilisateur ${userId}`);
   return this.tacheService.updateTask(id, userId, updateTaskDto);
 }

 @Delete(':id')
 @HttpCode(204)
 async delete(@Param('id') id: number, @Request() req: any) {
   const userId = req.user.id;
   this.logger.log(`Suppression de la tâche ${id} pour l'utilisateur ${userId}`);
   return this.tacheService.deleteTask(id, userId);
 }
}