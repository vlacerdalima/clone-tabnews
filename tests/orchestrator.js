import retry from "async-retry";

async function waitForAllServices() {
  await waitForWebServer();

  async function waitForWebServer() {
    return retry(fetche, { retries: 100, maxTimeout: 1000 });

    async function fetche() {
      const resposta = await fetch("http://localhost:3000/api/v1/status");
      if (resposta.status !== 200) throw Error();
    }
  }
}

export default {
  waitForAllServices,
};
