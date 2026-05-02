import database from "infra/database";
import email from "infra/email.js";
import { ForbiddenError, NotFoundError } from "infra/errors";
import webserver from "infra/webserver.js";
import user from "models/user.js";
import authorization from "./authorization";

const EXPIRATION_IN_MILLISECONDS = 60 * 15 * 1000;

async function create(userId) {
  const expiresAt = new Date(Date.now() + EXPIRATION_IN_MILLISECONDS);

  const newToken = await runInsertQuery(userId, expiresAt);
  return newToken;

  async function runInsertQuery(userId, expiresAt) {
    const results = await database.query({
      text: `
      INSERT INTO
        user_activation_tokens (user_id,expires_at)
      VALUES  
        ($1,$2)
      RETURNING
        *
      ;`,
      values: [userId, expiresAt],
    });

    return results.rows[0];
  }
}

async function sendEmailToUser(user, activationToken) {
  await email.send({
    to: user.email,
    subject: "Ative seu cadastro no FinTab!",
    text: `${user.username}, clique no link abaixo para ativar seu cadastro no FinTab:

${webserver.origin}/cadastro/ativar/${activationToken.id}

Atenciosamente,    
Equipe FinTab`,
  });
}

async function findOneByValidToken(token) {
  const newToken = await runSelectQuery(token);
  return newToken;

  async function runSelectQuery(token) {
    const results = await database.query({
      text: `
      SELECT
        *
      FROM  
        user_activation_tokens
      WHERE
        id = $1 AND
        used_at IS NULL
        AND expires_at > NOW()
      LIMIT
        1
      ;`,
      values: [token],
    });
    if (!results.rows[0]) {
      throw new NotFoundError({
        message: "O token informado não existe ou foi expirado.",
        action: "Faça um novo cadastro.",
      });
    }
    return results.rows[0];
  }
}

async function findOneByUserId(userId) {
  const newToken = await runSelectQuery(userId);
  return newToken;

  async function runSelectQuery(userId) {
    const results = await database.query({
      text: `
      SELECT
        *
      FROM  
        user_activation_tokens
      WHERE
        user_id = $1
      LIMIT
        1
      ;`,
      values: [userId],
    });

    return results.rows[0];
  }
}

async function markTokenAsUsed(activationTokenId) {
  const usedActivationToken = await runUpdateQuery(activationTokenId);
  return usedActivationToken;

  async function runUpdateQuery(activationTokenId) {
    const results = await database.query({
      text: `
        UPDATE
          user_activation_tokens
        SET
          used_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
        WHERE
          id = $1
        RETURNING
          *
      ;`,
      values: [activationTokenId],
    });

    return results.rows[0];
  }
}

async function activateUserByUserId(userId) {
  const userToActivate = await user.findOneById(userId);

  if (!authorization.can(userToActivate, "read:activation_token")) {
    throw new ForbiddenError({
      message: "Você não pode mais utilizar tokens de ativação.",
      action: "Entre em contato com o suporte.",
    });
  }

  const activatedUser = await user.setFeatures(userId, [
    "create:session",
    "read:session",
    "update:user",
  ]);
  return activatedUser;
}

const activation = {
  sendEmailToUser,
  create,
  findOneByUserId,
  findOneByValidToken,
  markTokenAsUsed,
  activateUserByUserId,
  EXPIRATION_IN_MILLISECONDS,
};

export default activation;
