import { BaseEntity } from './base-entity';
import { BaseResource, BaseResponse } from './base-response';

/**
 * Contract for assemblers converting between domain entities and API resources.
 *
 * @template TEntity - Domain entity type.
 * @template TResource - Resource (DTO) type.
 * @template TResponse - Wrapped collection response type.
 */
export interface BaseAssembler<
  TEntity extends BaseEntity,
  TResource extends BaseResource,
  TResponse extends BaseResponse,
> {
  /**
   * Converts a resource into a domain entity.
   * @param resource - Resource received from the API.
   */
  toEntityFromResource(resource: TResource): TEntity;

  /**
   * Converts a domain entity into a resource.
   * @param entity - Domain entity to send to the API.
   */
  toResourceFromEntity(entity: TEntity): TResource;

  /**
   * Converts a wrapped collection response into domain entities.
   * @param response - Response received from the API.
   */
  toEntitiesFromResponse(response: TResponse): TEntity[];
}
