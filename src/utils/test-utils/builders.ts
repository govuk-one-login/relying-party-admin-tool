import { Request } from "express";
import { Session, SessionData } from "express-session";
import { Logger } from "pino";

export class RequestBuilder {
  private body: object | null = null;
  private session: Partial<Session> & Partial<SessionData> = {
    newClientConfig: {},
  };

  private log: object = {
    debug: vi.fn(() => {}),
    info: vi.fn(() => {}),
    warn: vi.fn(() => {}),
    error: vi.fn(() => {}),
  };

  withBody(body: object): this {
    this.body = body;
    return this;
  }

  withSession(session: Session & Partial<SessionData>): this {
    this.session = session;
    return this;
  }

  withSessionnewClientConfig(newClientConfig: object): this {
    this.session.newClientConfig = newClientConfig;
    return this;
  }

  withLog(log: object): this {
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
