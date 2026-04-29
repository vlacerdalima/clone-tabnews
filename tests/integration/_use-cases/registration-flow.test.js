import activation from "models/activation.js";
import user from "models/user.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.limpa();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteAllEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
  let createUserRespondeBody;
  let tokenObject;

  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "RegistrationFlow",
          email: "registration.flow@curso.dev",
          password: "RegistrationFlowPassword",
        }),
      },
    );

    expect(createUserResponse.status).toBe(201);

    createUserRespondeBody = await createUserResponse.json();

    expect(createUserRespondeBody).toEqual({
      id: createUserRespondeBody.id,
      username: "RegistrationFlow",
      email: "registration.flow@curso.dev",
      password: createUserRespondeBody.password,
      features: ["read:activation_token"],
      created_at: createUserRespondeBody.created_at,
      updated_at: createUserRespondeBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();
    const tokenContained = await orchestrator.findToken(lastEmail.text);

    tokenObject = await activation.findOneByValidToken(tokenContained);

    expect(lastEmail.sender).toBe("<contato@fintab.com.br>");
    expect(lastEmail.recipients[0]).toBe("<registration.flow@curso.dev>");
    expect(lastEmail.subject).toBe("Ative seu cadastro no FinTab!");
    expect(lastEmail.text).toContain("RegistrationFlow");
    expect(lastEmail.text).toContain(tokenContained);
    expect(tokenObject.user_id).toEqual(createUserRespondeBody.id);
    expect(tokenObject.used_at).toBe(null);
  });

  test("Activate account", async () => {
    const activationResponse = await fetch(
      `http://localhost:3000/api/v1/activations/${tokenObject.id}`,
      { method: "PATCH" },
    );

    expect(activationResponse.status).toBe(200);

    const activationResponseBody = await activationResponse.json();

    expect(Date.parse(activationResponseBody.used_at)).not.toBe(NaN);
    const activatedUser = await user.findOneByUsername("RegistrationFlow");
    expect(activatedUser.features).toEqual(["create:session"]);
  });

  test("Login", async () => {
    const createSessionResponse = await fetch(
      "http://localhost:3000/api/v1/sessions",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "registration.flow@curso.dev",
          password: "RegistrationFlowPassword",
        }),
      },
    );
    expect(createSessionResponse.status).toBe(201);

    const createSessionResponseBody = await createSessionResponse.json();

    expect(createSessionResponseBody.user_id).toEqual(
      createUserRespondeBody.id,
    );
  });
});
