import database from "infra/database";
import { ValidationError, NotFoundError } from "infra/errors.js";
import password from "models/password.js";

async function findOneById(id) {
  const userFound = await runSelectQuery(id);

  return userFound;

  async function runSelectQuery(id) {
    const resultado = await database.query({
      text: `
    SELECT 
      * 
    FROM
      users 
    WHERE
      id = $1
    LIMIT
      1
    ;`,
      values: [id],
    });
    if (resultado.rowCount === 0) {
      throw new NotFoundError({
        message: "O id informado não foi encontrado no sistema",
        action: "Verifique se o id está digitado corretamente",
      });
    }

    return resultado.rows[0];
  }
}

async function findOneByUsername(username) {
  const userFound = await runSelectQuery(username);

  return userFound;

  async function runSelectQuery(username) {
    const resultado = await database.query({
      text: `
    SELECT 
      * 
    FROM
      users 
    WHERE
      LOWER(username) = LOWER($1)
    LIMIT
      1
    ;`,
      values: [username],
    });
    if (resultado.rowCount === 0) {
      throw new NotFoundError({
        message: "O username informado não foi encontrado no sistema",
        action: "Verifique se o username está digitado corretamente",
      });
    }

    return resultado.rows[0];
  }
}

async function findOneByEmail(email) {
  const userFound = await runSelectQuery(email);

  return userFound;

  async function runSelectQuery(email) {
    const resultado = await database.query({
      text: `
    SELECT 
      * 
    FROM
      users 
    WHERE
      LOWER(email) = LOWER($1)
    LIMIT
      1
    ;`,
      values: [email],
    });
    if (resultado.rowCount === 0) {
      throw new NotFoundError({
        message: "O email informado não foi encontrado no sistema",
        action: "Verifique se o email está digitado corretamente",
      });
    }

    return resultado.rows[0];
  }
}

async function create(userInputValues) {
  await validateUniqueUsername(userInputValues.username);
  await validateUniqueEmail(userInputValues.email);
  await hashPasswordInObject(userInputValues);
  injectDefaultFeaturesInObject(userInputValues);

  const newUser = await runInsertQuery(userInputValues);
  return newUser;

  async function runInsertQuery(userInputValues) {
    const resultado = await database.query({
      text: `
    INSERT INTO 
      users (username,email,password, features) 
    VALUES 
      ($1,$2,$3,$4) 
    RETURNING 
      *
    ;`,
      values: [
        userInputValues.username,
        userInputValues.email,
        userInputValues.password,
        userInputValues.features,
      ],
    });
    return resultado.rows[0];
  }

  function injectDefaultFeaturesInObject(userInputValues) {
    userInputValues.features = ["read:activation_token"];
  }
}
async function update(username, userInputValues) {
  const currentUser = await findOneByUsername(username);
  if ("username" in userInputValues) {
    await validateUniqueUsername(userInputValues.username);
  }
  if ("email" in userInputValues) {
    await validateUniqueEmail(userInputValues.email);
  }

  if ("password" in userInputValues) {
    await hashPasswordInObject(userInputValues);
  }

  const userAtualizado = { ...currentUser, ...userInputValues };

  const userModificado = await runUpdateQuery(userAtualizado);
  return userModificado;
}

async function runUpdateQuery(userAtualizado) {
  const results = await database.query({
    text: `
      UPDATE
        users
      SET
        username = $2,
        email = $3,
        password = $4,
        updated_at = timezone('utc',now())
      WHERE
        id = $1
      RETURNING
        *
    `,
    values: [
      userAtualizado.id,
      userAtualizado.username,
      userAtualizado.email,
      userAtualizado.password,
    ],
  });
  return results.rows[0];
}

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

async function hashPasswordInObject(userInputValues) {
  const hashedPassword = await password.hash(userInputValues.password);
  userInputValues.password = hashedPassword;
}

async function setFeatures(userId, features) {
  const updatedUser = await runUpdateQuery(userId, features);
  return updatedUser;

  async function runUpdateQuery(userId, features) {
    const results = await database.query({
      text: `
      UPDATE
        users
      SET
        features = $2,
        updated_at = timezone('utc',now())
      WHERE
        id = $1
      RETURNING
        *
      
      ;`,
      values: [userId, features],
    });

    return results.rows[0];
  }
}

const user = {
  create,
  findOneByUsername,
  update,
  findOneByEmail,
  findOneById,
  setFeatures,
};

export default user;
