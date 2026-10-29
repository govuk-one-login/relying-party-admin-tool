import { Request } from "express";
import { Session, SessionData } from "express-session";
import { Logger } from "pino";

export class RequestBuilder {
  private body: Record<string, unknown> | null = null;
  private session: Partial<Session> & Partial<SessionData> = {
    newClientConfig: {},
  };

  private log: Partial<Logger> = {
    debug: vi.fn(() => {}),
    info: vi.fn(() => {}),
    warn: vi.fn(() => {}),
    error: vi.fn(() => {}),
  };

  withBody(body: Record<string, unknown>): this {
    this.body = body;
    return this;
  }

  withSession(session: Session & Partial<SessionData>): this {
    this.session = session;
    return this;
  }

  withSessionNewClientConfig(newClientConfig: Record<string, unknown>): this {
    this.session.newClientConfig = newClientConfig;
    return this;
  }

  withLog(log: Record<string, unknown>): this {
    this.log = log;
    return this;
  }

  build(): Request {
    return {
      body: this.body,
      session: this.session as Session,
      log: this.log as Logger,
    } as Request;
  }
}
