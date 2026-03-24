import useSWR from "swr";

async function fetchAPI(key) {
  const response = fetch(key);
  const corpo = (await response).json();
  return corpo;
}

export default function statusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
    </>
  );
}

function UpdatedAt() {
  const { isLoading, data } = useSWR("api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });
  let agora = "Carregando...";
  if (!isLoading && data)
    agora = new Date(data.data_agr).toLocaleString("pt-BR");
  return <div>Última verificação: {agora}</div>;
}
