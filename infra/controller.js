import { MethodNotAllowedError, InternalServerError } from "infra/errors";

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
  const erroPublico = new InternalServerError({ motivo_do_erro: error });
  console.error(erroPublico);
  response.status(erroPublico.statusCode).json(erroPublico);
}
