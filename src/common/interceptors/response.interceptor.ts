import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        message: this.getSuccessMessage(context, data),
      })),
    );
  }

  private getSuccessMessage(context: ExecutionContext, data: any): string {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.url;

    if (path.includes('/auth/register')) {
      return 'Inscription réussie';
    }
    if (path.includes('/auth/login')) {
      return 'Connexion réussie';
    }
    if (path.includes('/taches')) {
      switch (method) {
        case 'POST':
          return 'Tâche créée avec succès';
        case 'GET':
          if (Array.isArray(data)) {
            return `${data.length} tâche(s) récupérée(s)`;
          }
          return 'Tâche récupérée avec succès';
        case 'PUT':
        case 'PATCH':
          return 'Tâche mise à jour avec succès';
        case 'DELETE':
          return 'Tâche supprimée avec succès';
      }
    }

    switch (method) {
      case 'POST':
        return 'Ressource créée avec succès';
      case 'PUT':
      case 'PATCH':
        return 'Ressource mise à jour avec succès';
      case 'DELETE':
        return 'Ressource supprimée avec succès';
      default:
        return 'Opération réussie';
    }
  }
}