// api/criar-pix.js
// Serverless function — Vercel Node.js

const fetch = require("node-fetch");

const PLANOS = {
  essencial: {
    nome: "Plano Essencial",
    valor: 25.90,
    descricao: "Divida Zero - Plano Essencial (Guia + Planilha)"
  },
  completo: {
    nome: "Plano Completo",
    valor: 47.90,
    descricao: "Divida Zero - Plano Completo (Guia + Scripts + Planilha + Organizacao)"
  },
  master: {
    nome: "Plano Master",
    valor: 89.90,
    descricao: "Divida Zero - Plano Master (Tudo + Suporte Prioritario)"
  }
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ erro: "Metodo nao permitido" });

  try {
    const { plano, nome, cpf } = req.body || {};

    if (!plano || !PLANOS[plano]) {
      return res.status(400).json({ erro: "Plano invalido. Use: essencial, completo ou master" });
    }
    if (!nome || nome.trim().length < 3) {
      return res.status(400).json({ erro: "Nome invalido" });
    }
    if (!cpf || cpf.replace(/\D/g, "").length !== 11) {
      return res.status(400).json({ erro: "CPF invalido" });
    }

    const cpfLimpo = cpf.replace(/\D/g, "");
    const planoSelecionado = PLANOS[plano];
    const transactionId = "dz-" + plano + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);

    const response = await fetch("https://api.misticpay.com/api/transactions/create", {
      method: "POST",
      headers: {
        "ci": process.env.MISTICPAY_CI || "ci_1a3q6njdt57xurt",
        "cs": process.env.MISTICPAY_CS || "cs_rhcv5wstvu2hxsf9q0bnvg3xk",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: planoSelecionado.valor,
        payerName: nome.trim(),
        payerDocument: cpfLimpo,
        transactionId: transactionId,
        description: planoSelecionado.descricao
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erro MisticPay:", data);
      return res.status(500).json({ erro: "Erro ao gerar Pix. Tente novamente." });
    }

    return res.status(200).json({
      ok: true,
      transactionId: data.data.transactionId,
      qrCodeBase64: data.data.qrCodeBase64,
      copyPaste: data.data.copyPaste,
      plano: planoSelecionado.nome,
      valor: planoSelecionado.valor
    });

  } catch (error) {
    console.error("Erro interno:", error);
    return res.status(500).json({ erro: "Erro interno no servidor" });
  }
};
