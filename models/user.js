import database from "infra/database";
import { ValidationError } from "infra/errors.js";
async function create(userInputValues) {
  await validateUniqueEmail(userInputValues.email);
  await validateUniqueUsername(userInputValues.username);
  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function validateUniqueEmail(email) {
    const resultado = await database.query({
      text: `
    SELECT 
      email 
    FROM
      users 
    WHERE
      LOWER(email) = LOWER($1)
    ;`,
      values: [email],
    });
    if (resultado.rowCount > 0) {
      throw new ValidationError({
        message: "O email informado já existe",
        action: "Utilize outro email",
      });
    }
  }

  async function validateUniqueUsername(username) {
    const resultado = await database.query({
      text: `
    SELECT 
      username 
    FROM
      users 
    WHERE
      LOWER(username) = LOWER($1)
    ;`,
      values: [username],
    });
    if (resultado.rowCount > 0) {
      throw new ValidationError({
        message: "O username informado já existe",
        action: "Utilize outro username",
      });
    }
  }

  async function runInsertQuery(userInputValues) {
    const resultado = await database.query({
      text: `
    INSERT INTO 
      users (username,email,password) 
    VALUES 
      ($1,$2,$3) 
    RETURNING 
      *
    ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
      ],
    });
    return resultado.rows[0];
  }
}

const user = {
  create,
};

export default user;
