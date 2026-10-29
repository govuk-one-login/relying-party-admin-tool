import {
  ClientRegistryApiClientInput,
  ClientRegistryApiClientResponse,
} from "../models/api.js";
import { Result } from "../models/result.js";

export interface ClientRegistryStorage {
  addClient(
    clientInput: ClientRegistryApiClientInput
  ): Promise<Result<ClientRegistryApiClientResponse>>;
  getClient(
    clientId: string
  ): Promise<Result<ClientRegistryApiClientResponse | undefined>>;
}
