import useSWR from "swr";
/* eslint-disable react/prop-types */
async function fetchAPI(key) {
  const response = await fetch(key);
  const corpo = await response.json();
  return corpo;
}

function Mostrar({ nome, valor, carregando }) {
  return (
    <div>
      <strong>{nome}:</strong> {carregando ? "Carregando..." : valor}
    </div>
  );
}

function Horario({ valor, carregando }) {
  let horarioFormatado = "Não carregado";
  if (!carregando && valor) {
    horarioFormatado = new Date(valor).toLocaleString("pt-BR");
  }

  return (
    <Mostrar
      nome="Última atualização"
      valor={horarioFormatado}
      carregando={carregando}
    />
  );
}
export default function statusPage() {
  const { isLoading, data: resultado } = useSWR("api/v1/status", fetchAPI, {
    refreshInterval: 2000,
  });
  return (
    <>
      <h1>Status</h1>
      <Horario valor={resultado?.data_agr} carregando={isLoading} />
      <Mostrar
        nome="Versão do Banco"
        valor={resultado?.psql_version}
        carregando={isLoading}
      />
      <Mostrar
        nome="Conexões Máximas"
        valor={resultado?.conexoes_maximas}
        carregando={isLoading}
      />
      <Mostrar
        nome="Conexões Ativas"
        valor={resultado?.conexoes_agora}
        carregando={isLoading}
      />
    </>
  );
}
