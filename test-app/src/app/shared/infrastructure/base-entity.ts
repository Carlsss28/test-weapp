/**
 * Base contract for every domain entity of the platform.
 * An entity is identified by a numeric id assigned by the API.
 */
export interface BaseEntity {
  /** Unique identifier of the entity. */
  id: number;
}
