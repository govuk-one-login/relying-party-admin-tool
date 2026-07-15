/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { Session, SessionData } from "express-session";

export class RequestBuilder {
  private body: object | null = null;
  private session: Session & Partial<SessionData> = {
    newClientData: {},
  } as any;
  private log: object = {};

  withBody(body: object): this {
    this.body = body;
    return this;
  }

  withSession(session: Session & Partial<SessionData>): this {
    this.session = session;
    return this;
  }

  withSessionNewClientData(newClientData: object): this {
    this.session.newClientData = newClientData;
    return this;
  }

  withLog(log: object): this {
    this.log = log;
    return this;
  }

  build(): Partial<Request> {
    return {
      body: this.body,
      session: this.session,
    };
  }
}
