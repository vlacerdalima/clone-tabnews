import {
  MethodNotAllowedError,
  InternalServerError,
  ValidationError,
  NotFoundError,
} from "infra/errors";

export default {
  errorHandlers: {
    onNoMatch: onNoMatchHandler,
    onError: onErrorHandler,
  },
};

function onNoMatchHandler(request, response) {
  const erroPublico = new MethodNotAllowedError();
  response.status(erroPublico.statusCode).json(erroPublico);
}
function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError || error instanceof NotFoundError) {
    return response.status(error.statusCode).json(error);
  }

  const erroPublico = new InternalServerError({
    motivo_do_erro: error,
    statusCode: error.statusCode,
  });
  console.error(erroPublico);
  response.status(erroPublico.statusCode).json(erroPublico);
}
