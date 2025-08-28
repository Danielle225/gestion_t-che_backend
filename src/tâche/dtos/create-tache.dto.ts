import {IsNotEmpty, IsString, Max, Min, IsEnum } from "class-validator";
import { StatusTâche } from "src/common/enum/status.enum";



export class CreateTaskDto{

    @IsString()
    @IsNotEmpty()
    @Min(3,{message:"Le titre doit contenir au moins 3 caractères"})
    @Max(100,{message:"Le titre ne peut pas dépasser 100 caractères"})
    titre: string;

    @IsString()
    @IsNotEmpty()
    @Min(3,{message:"La description doit contenir au moins 3 caractères"})
    @Max(500,{message:"La description ne peut pas dépasser 500 caractères"})
    description: string;

    @IsEnum(StatusTâche)
    @IsNotEmpty()
    status: StatusTâche;
}