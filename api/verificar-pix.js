// api/verificar-pix.js
// Serverless function — Vercel Node.js

const fetch = require("node-fetch");

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ erro: "Metodo nao permitido" });

  try {
    const { transactionId } = req.body || {};

    if (!transactionId) {
      return res.status(400).json({ erro: "transactionId obrigatorio" });
    }

    const response = await fetch("https://api.misticpay.com/api/transactions/check", {
      method: "POST",
      headers: {
        "ci": process.env.MISTICPAY_CI || "ci_1a3q6njdt57xurt",
        "cs": process.env.MISTICPAY_CS || "cs_rhcv5wstvu2hxsf9q0bnvg3xk",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ transactionId: String(transactionId) })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ erro: "Erro ao verificar transacao" });
    }

    const status = (data.transaction && data.transaction.transactionState) || "PENDENTE";

    return res.status(200).json({
      ok: true,
      status: status,
      pago: status === "COMPLETO"
    });

  } catch (error) {
    console.error("Erro verificar-pix:", error);
    return res.status(500).json({ erro: "Erro interno" });
  }
};
