import { generateClientRegistryInput } from "../utils/test-utils/test-client-generator.js";
import { InMemoryClientStorage } from "./in-memory-client-storage.js";

const testClientId = "KVQPnJ13Yf-hWc0_OFUflfLBOI4FG1zN24PXYPDpQuI"; //pragma: allowlist secret
vi.mock(import("node:crypto"), () => {
  return { randomBytes: vi.fn(() => Buffer.from(testClientId, "base64url")) };
});

describe("InMemoryClientStorage tests", () => {
  const FIXED_TIMESTAMP = "2026-10-27T12:00:00.000Z";

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(FIXED_TIMESTAMP));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("generates a client ID and stores it in memory", async () => {
    const testClientInput = generateClientRegistryInput();
    const clientRepository = new InMemoryClientStorage();

    const res = await clientRepository.addClient(testClientInput);

    expect(res).toBeSuccess({
      ...testClientInput,
      clientId: testClientId,
      created: FIXED_TIMESTAMP,
      lastModified: FIXED_TIMESTAMP,
    });
  });

  it("gets a client from it's in memory store and returns it", async () => {
    const testClientInput = generateClientRegistryInput();
    const clientRepository = new InMemoryClientStorage();
    await clientRepository.addClient(testClientInput);

    const client = await clientRepository.getClient(testClientId);

    expect(client).toBeSuccess({
      ...testClientInput,
      clientId: testClientId,
      created: FIXED_TIMESTAMP,
      lastModified: FIXED_TIMESTAMP,
    });
  });

  it("returns undefined if a client does not exist", async () => {
    const testClientInput = generateClientRegistryInput();
    const clientRepository = new InMemoryClientStorage();
    await clientRepository.addClient(testClientInput);

    const client = await clientRepository.getClient("non-existent-client-id");

    expect(client).toBeSuccess(undefined);
  });
});
