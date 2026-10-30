import { Request, Response } from "express";
import { createActor } from "xstate";
import { createClientStateMachine } from "../../../models/state.js";
import { populateUrlRoute } from "../../../utils/populate-url-route.js";

export const clientNextController = (req: Request, res: Response): void => {
  const serviceId = req.params.serviceId as string;
  const snapshot = createActor(createClientStateMachine, {
    input: req.session.newClientConfig,
  }).getSnapshot();
  const nextPath = snapshot.value;
  return res.redirect(
    populateUrlRoute(nextPath, {
      ":serviceId": serviceId,
    })
  );
};
