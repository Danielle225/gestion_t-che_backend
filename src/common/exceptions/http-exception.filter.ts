import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Une erreur inattendue s\'est produite';
    let error = 'Internal Server Error';

    // Gestion des erreurs HTTP de NestJS
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name;
        
        // Si le message est un tableau (validation errors)
        if (Array.isArray(message)) {
          message = message.join(', ');
        }
      } else {
        message = exceptionResponse;
        error = exception.name;
      }
    } 
    // Gestion des erreurs Prisma
    else if (exception instanceof PrismaClientKnownRequestError) {
      this.logger.error(`Erreur Prisma - Code: ${exception.code}`, exception);
      
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'Cette ressource existe déjà (violation de contrainte d\'unicité)';
          error = 'Conflict';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'La ressource demandée n\'existe pas';
          error = 'Not Found';
          break;
        case 'P2003':
          status = HttpStatus.BAD_REQUEST;
          message = 'Violation de contrainte de clé étrangère';
          error = 'Foreign Key Constraint';
          break;
        case 'P2014':
          status = HttpStatus.BAD_REQUEST;
          message = 'Relation invalide dans la requête';
          error = 'Invalid Relation';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Erreur de base de données';
          error = 'Database Error';
      }
    } 
    // Gestion des autres erreurs
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      this.logger.error(`Erreur non gérée: ${exception.name}`, exception.stack);
    }

    // Log de l'erreur pour debugging
    const logMessage = `${request.method} ${request.url} - ${status} - ${message}`;
    
    if (status >= 500) {
      this.logger.error(logMessage, exception instanceof Error ? exception.stack : undefined);
    } else {
      this.logger.warn(logMessage);
    }

    // Réponse d'erreur standardisée
    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
    };

    response.status(status).json(errorResponse);
  }
}