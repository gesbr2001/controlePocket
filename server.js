// server.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
// Serve arquivos estáticos (coloque index.html em ./public)
app.use(express.static(path.join(__dirname, "public")));

const db = new sqlite3.Database("./controlePocket.db", (err) => {
  if (err) console.error("Erro ao abrir DB:", err.message);
  else console.log("Conectado ao banco controlePocket.db");
});

// Cria tabela
db.run(`
  CREATE TABLE IF NOT EXISTS movimentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    numero_pocket INTEGER NOT NULL,
    acao TEXT CHECK(acao IN ('entrada','saida')) NOT NULL,
    data_hora TEXT NOT NULL
  )
`);

// Normaliza/valida ações
function normalizeAcao(raw) {
  if (!raw && raw !== 0) return null;
  const a = String(raw).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (["entrada", "entrando", "in", "1"].includes(a)) return "entrada";
  if (["saida", "saída", "saindo", "out", "0"].includes(a)) return "saida";
  return null;
}

// Mapeia corpos com nomes diferentes (comodidade)
function extractFields(body) {
  const nome = body.nome || body.separador || body.usuario || body.user;
  const numero_pocket = body.numero_pocket || body.pocket || body.numero;
  const acaoRaw = body.acao || body.tipo || body.action;
  return { nome, numero_pocket, acaoRaw };
}

// ROTA: criar movimento
app.post("/movimentos", (req, res) => {
  const { nome, numero_pocket, acaoRaw } = extractFields(req.body);
  const acao = normalizeAcao(acaoRaw);

  if (!nome || !numero_pocket || !acao) {
    return res.status(400).json({
      error:
        "Campos obrigatórios: nome, numero_pocket, acao (entrada|saida). Recebido: " +
        JSON.stringify({ nome, numero_pocket, acaoRaw }),
    });
  }

  const dataHora = new Date().toISOString();

  db.run(
    `INSERT INTO movimentos (nome, numero_pocket, acao, data_hora) VALUES (?, ?, ?, ?)`,
    [nome, numero_pocket, acao, dataHora],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, nome, numero_pocket, acao, data_hora: dataHora });
    }
  );
});

// ROTA: listar tudo
app.get("/movimentos", (req, res) => {
  db.all(`SELECT * FROM movimentos ORDER BY data_hora DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ROTA: deletar
app.delete("/movimentos/:id", (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM movimentos WHERE id = ?`, [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Registro não encontrado" });
    res.json({ message: "Movimento deletado com sucesso" });
  });
});

app.listen(3000, "0.0.0.0", () => {
    console.log("Servidor rodando em http://0.0.0.0:3000");
  });
  
