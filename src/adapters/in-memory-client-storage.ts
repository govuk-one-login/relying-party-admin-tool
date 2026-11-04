import { randomBytes } from "node:crypto";
import {
  ClientRegistryApiClientInput,
  ClientRegistryApiClientResponse,
} from "../models/api.js";
import { ClientRegistryStorage } from "../ports/client-registry-storage.js";
import { Result } from "../models/result.js";

export class InMemoryClientStorage implements ClientRegistryStorage {
  private clients: ClientRegistryApiClientResponse[];

  constructor() {
    this.clients = [];
  }

  async addClient(
    clientInput: ClientRegistryApiClientInput
  ): Promise<Result<ClientRegistryApiClientResponse>> {
    const timestampNow = new Date().toISOString();
    const newClient = {
      ...clientInput,
      clientId: randomBytes(32).toString("base64url"),
      created: timestampNow,
      lastModified: timestampNow,
    };
    this.clients.push(newClient);
    return Result.success(newClient);
  }

  async getClient(
    clientId: string
  ): Promise<Result<ClientRegistryApiClientResponse | undefined>> {
    return Result.success(this.clients.find((c) => c.clientId === clientId));
  }
}
