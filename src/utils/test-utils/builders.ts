import { Request } from "express";
import { Session, SessionData } from "express-session";
import { Logger } from "pino";

export class RequestBuilder {
  private body: Record<string, unknown> | null = null;
  private session: Partial<Session> & Partial<SessionData> = {
    newClientConfig: {},
    save: vi.fn((cb) => {
      if (cb) {
        cb();
      }
      return {} as Session;
    }),
  };
  private params: Record<string, unknown> = {};

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

  withParams(params: Record<string, unknown>): this {
    this.params = params;
    return this;
  }

  build(): Request {
    return {
      body: this.body,
      session: this.session as Session,
      log: this.log as Logger,
      params: this.params,
    } as Request;
  }
}
