export class InternalServerError extends Error {
  constructor({ motivo_do_erro }) {
    super("Erro interno, contate o suporte.", {
      cause: motivo_do_erro,
    });
    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte.";
    this.statusCode = 500;
  }
  toJSON() {
    // cria esse método para formatar melhor para o console
    return {
      name: this.name,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowedError extends Error {
  constructor() {
    super("Método não permitido");
    this.name = "MethodNotAllowedError";
    this.action = "Entre em contato com o suporte.";
    this.statusCode = 405;
  }
  toJSON() {
    // cria esse método para formatar melhor para o console
    return {
      name: this.name,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
