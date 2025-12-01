function aux(request, response) {
  response.status(200).json({ sla: "teste" });
}

export default aux;
