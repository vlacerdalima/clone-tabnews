import database from "../../../../infra/database.js";

async function aux(request, response) {
  const result = await database.query("SELECT 1 + 1 as sum;");
  console.log(result.rows);
  response.status(200).json({ sla: "teste" });
}

export default aux;
