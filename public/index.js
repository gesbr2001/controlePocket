// Config
const separadores = [
    "Separador 1","Separador 2","Separador 3","Separador 4",
    "Separador 5","Separador 6","Separador 7","Separador 8"
  ];
  const pockets = [1,2,3,4,5,6,7,8];

  // Estados
  let separadorSelecionado = null;
  let pocketSelecionado = null;

  // DOM refs
  const separadoresGrid = document.getElementById("separadoresGrid");
  const pocketsGrid = document.getElementById("pocketsGrid");
  const btnAvancar = document.getElementById("btnAvancar");
  const btnSalvar = document.getElementById("btnSalvar");
  const btnVoltar = document.getElementById("btnVoltar");
  const msg = document.getElementById("msg");
  const error = document.getElementById("error");

  // Monta cards
  function montarSeparadores() {
    separadoresGrid.innerHTML = "";
    separadores.forEach((s, i) => {
      const d = document.createElement("div");
      d.className = "card";
      d.textContent = s;
      d.onclick = () => {
        separadorSelecionado = s;
        Array.from(separadoresGrid.children).forEach(c=>c.classList.remove("selected"));
        d.classList.add("selected");
        btnAvancar.disabled = false;
      };
      separadoresGrid.appendChild(d);
    });
  }

  function montarPockets() {
    pocketsGrid.innerHTML = "";
    pockets.forEach((n) => {
      const d = document.createElement("div");
      d.className = "card";
      d.textContent = n;
      d.onclick = () => {
        pocketSelecionado = n;
        Array.from(pocketsGrid.children).forEach(c=>c.classList.remove("selected"));
        d.classList.add("selected");
      };
      pocketsGrid.appendChild(d);
    });
  }

  // Navegação
  btnAvancar.onclick = () => {
    if (!separadorSelecionado) return alert("Selecione um separador");
    document.getElementById("page-separador").classList.remove("active");
    document.getElementById("page-pocket").classList.add("active");
    msg.textContent = "";
    error.textContent = "";
  };
  btnVoltar.onclick = () => {
    document.getElementById("page-pocket").classList.remove("active");
    document.getElementById("page-separador").classList.add("active");
    pocketSelecionado = null;
    Array.from(pocketsGrid.children).forEach(c=>c.classList.remove("selected"));
  };

  btnSalvar.onclick = async () => {
  const acao = document.querySelector('input[name="acao"]:checked')?.value;
  if (!separadorSelecionado || !pocketSelecionado) {
    alert("❌ Selecione separador e pocket antes de salvar.");
    return;
  }

  const body = {
    nome: separadorSelecionado,
    numero_pocket: pocketSelecionado,
    acao: acao
  };

  try {
    const res = await fetch("/movimentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await (res.headers.get("content-type")?.includes("application/json") ? res.json() : {});
    if (!res.ok) {
      const msgErro = data?.error || "Erro desconhecido ao salvar";
      alert("❌ Não salvo: " + msgErro);
      return;
    }

    // Pop-up de sucesso
    alert("✅ Movimento salvo com sucesso!");

    // reset visual e voltar para seleção
    pocketSelecionado = null;
    Array.from(pocketsGrid.children).forEach(c=>c.classList.remove("selected"));
    document.getElementById("page-pocket").classList.remove("active");
    document.getElementById("page-separador").classList.add("active");
    btnAvancar.disabled = true;
    separadorSelecionado = null;
    Array.from(separadoresGrid.children).forEach(c=>c.classList.remove("selected"));
  } catch (err) {
    console.error(err);
    alert("⚠️ Erro de conexão: " + err.message);
  }

  //DELETAR 
  document.getElementById("btnDeletar").addEventListener("click", async () => {
    const id = prompt("Digite o ID do movimento que deseja deletar:");
  
    if (!id) return alert("ID não informado!");
  
    if (!confirm(`Tem certeza que deseja deletar o movimento #${id}?`)) return;
  
    try {
      const response = await fetch(`http://192.168.88.56:3000/movimentos/${id}`, {
        method: "DELETE",
      });
  
      const result = await response.json();
  
      if (response.ok) {
        alert("Movimento deletado com sucesso!");
      } else {
        alert(`Erro: ${result.error}`);
      }
    } catch (err) {
      alert("Erro ao conectar com o servidor.");
      console.error(err);
    }
  });
  

};

  // inicializa
  montarSeparadores();
  montarPockets();