import {
  MethodNotAllowedError,
  InternalServerError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} from "infra/errors";

import * as cookie from "cookie";
import session from "models/session.js";

export default {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
  setSessionCookie,
};

async function setSessionCookie(sessionToken, response) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    maxAge: session.EXPIRATION_IN_MILISSECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });

  response.setHeader("Set-Cookie", setCookie);
}

function onNoMatchHandler(request, response) {
  const erroPublico = new MethodNotAllowedError();
  response.status(erroPublico.statusCode).json(erroPublico);
}
function onErrorHandler(error, request, response) {
  if (
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof UnauthorizedError
  ) {
    return response.status(error.statusCode).json(error);
  }

  const erroPublico = new InternalServerError({
    motivo_do_erro: error,
  });
  console.error(erroPublico);
  response.status(erroPublico.statusCode).json(erroPublico);
}
