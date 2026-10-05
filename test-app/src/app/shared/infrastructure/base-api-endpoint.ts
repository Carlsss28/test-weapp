import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { BaseAssembler } from './base-assembler';
import { BaseEntity } from './base-entity';
import { BaseResource, BaseResponse } from './base-response';

/**
 * Generic CRUD endpoint for a single API resource.
 * Translates resources to entities (and back) through an assembler.
 *
 * @template TEntity - Domain entity type.
 * @template TResource - Resource (DTO) type.
 * @template TResponse - Wrapped collection response type.
 * @template TAssembler - Assembler used for the conversions.
 */
export abstract class BaseApiEndpoint<
  TEntity extends BaseEntity,
  TResource extends BaseResource,
  TResponse extends BaseResponse,
  TAssembler extends BaseAssembler<TEntity, TResource, TResponse>,
> {
  /**
   * @param http - Angular HTTP client.
   * @param endpointUrl - Absolute URL of the resource collection.
   * @param assembler - Assembler converting between entities and resources.
   */
  protected constructor(
    protected http: HttpClient,
    protected endpointUrl: string,
    protected assembler: TAssembler,
  ) {}

  /**
   * Retrieves every entity of the collection.
   * Supports both plain array responses and wrapped responses.
   */
  getAll(): Observable<TEntity[]> {
    return this.http.get<TResponse | TResource[]>(this.endpointUrl).pipe(
      map((response) => {
        if (Array.isArray(response)) {
          return response.map((resource) => this.assembler.toEntityFromResource(resource));
        }
        return this.assembler.toEntitiesFromResponse(response as TResponse);
      }),
      catchError(this.handleError('Failed to fetch entities')),
    );
  }

  /**
   * Retrieves a single entity.
   * @param id - Identifier of the entity.
   */
  getById(id: number): Observable<TEntity> {
    return this.http.get<TResource>(`${this.endpointUrl}/${id}`).pipe(
      map((resource) => this.assembler.toEntityFromResource(resource)),
      catchError(this.handleError('Failed to fetch entity')),
    );
  }

  /**
   * Creates a new entity.
   * @param entity - Entity to create.
   */
  create(entity: TEntity): Observable<TEntity> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.post<TResource>(this.endpointUrl, resource).pipe(
      map((created) => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create entity')),
    );
  }

  /**
   * Replaces an existing entity.
   * @param entity - Entity carrying the new state.
   * @param id - Identifier of the entity to update.
   */
  update(entity: TEntity, id: number): Observable<TEntity> {
    const resource = this.assembler.toResourceFromEntity(entity);
    return this.http.put<TResource>(`${this.endpointUrl}/${id}`, resource).pipe(
      map((updated) => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError('Failed to update entity')),
    );
  }

  /**
   * Deletes an entity.
   * @param id - Identifier of the entity to delete.
   */
  delete(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.endpointUrl}/${id}`)
      .pipe(catchError(this.handleError('Failed to delete entity')));
  }

  /**
   * Builds an error handler that maps HTTP failures to readable errors.
   * @param operation - Description of the failed operation.
   */
  protected handleError(operation: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      let errorMessage = operation;
      if (error.status === 404) {
        errorMessage = `${operation}: Resource not found`;
      } else if (error.error instanceof ErrorEvent) {
        errorMessage = `${operation}: ${error.error.message}`;
      } else {
        errorMessage = `${operation}: ${error.statusText || 'Unexpected error'}`;
      }
      return throwError(() => new Error(errorMessage));
    };
  }
}
