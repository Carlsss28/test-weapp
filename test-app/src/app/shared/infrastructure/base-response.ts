/**
 * Base contract for a resource (DTO) exchanged with the API.
 */
export interface BaseResource {
  /** Unique identifier of the resource. */
  id: number;
}

/**
 * Base contract for an API response that wraps a collection of resources.
 * Endpoints returning a plain array do not need a wrapper.
 */
export interface BaseResponse {}
