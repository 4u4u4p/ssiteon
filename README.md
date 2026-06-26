# Dívida Zero — Deploy no Vercel (via GitHub)

## ⚠️ Se você já tem um repositório no GitHub com erro

O erro `"Unexpected token 'T', "The page c"... is not valid JSON"` acontece
quando o Vercel não encontra a pasta `api/` no lugar certo — geralmente porque
os arquivos ficaram dentro de uma subpasta extra (ex: `divida-zero/api/...`
em vez de `api/...` na raiz do repositório).

### Como corrigir

1. Apague todo o conteúdo do seu repositório no GitHub (ou crie um repositório novo)
2. Copie estes arquivos **diretamente para a raiz** do repositório:
   ```
   seu-repositorio/
   ├── api/
   │   ├── criar-pix.js
   │   └── verificar-pix.js
   ├── index.html
   ├── package.json
   └── vercel.json
   ```
   **Não deve existir uma pasta `divida-zero/` ou `public/` por dentro.**
3. Faça commit e push
4. No Vercel, vá em Deployments → clique nos "..." do último deploy → **Redeploy**

## Estrutura correta do projeto

```
/
├── api/
│   ├── criar-pix.js      ← Gera transação Pix via MisticPay
│   └── verificar-pix.js  ← Verifica status do pagamento
├── index.html             ← Landing page com 3 planos (raiz!)
├── package.json
└── vercel.json
```

## Passo a passo do zero

### 1. Crie o repositório no GitHub
- Crie um repositório novo (ex: `divida-zero`)
- Faça upload de **todos os arquivos soltos na raiz** (não dentro de uma pasta)

### 2. Conecte ao Vercel
- Acesse https://vercel.com → "Add New Project"
- Selecione o repositório
- **Root Directory**: deixe como `.` (raiz) — não aponte para nenhuma subpasta
- Framework Preset: "Other"

### 3. Configure as variáveis de ambiente (IMPORTANTE)
Em Settings → Environment Variables, adicione:

| Variável | Valor |
|---|---|
| MISTICPAY_CI | ci_1a3q6njdt57xurt |
| MISTICPAY_CS | cs_rhcv5wstvu2hxsf9q0bnvg3xk |

Depois de adicionar, **clique em Redeploy** (variáveis novas só valem a partir do próximo deploy).

### 4. Teste a API isoladamente
Depois do deploy, acesse direto no navegador:
```
https://seu-site.vercel.app/api/criar-pix
```
Deve aparecer um erro JSON tipo `{"erro":"Método não permitido"}` — isso é
**bom sinal**, significa que a rota existe. Se aparecer uma página de erro 404
do Vercel, a rota não foi encontrada (revise a estrutura de pastas).

## Como funciona o checkout

1. Cliente escolhe um plano e clica no botão
2. Modal abre pedindo nome e CPF
3. Backend chama a API MisticPay e gera o QR Code Pix
4. Cliente escaneia ou copia o código e paga
5. A cada 5 segundos o site verifica o status automaticamente
6. Quando confirmado, exibe a tela de sucesso

## Planos configurados

| Plano | ID | Valor |
|---|---|---|
| Essencial | essencial | R$25,90 |
| Completo | completo | R$47,90 |
| Master | master | R$89,90 |

Para alterar valores, edite o objeto `PLANOS` em `api/criar-pix.js`.

## Personalizar entrega do produto

Após confirmar o pagamento, você precisa entregar o material ao cliente.
Opções recomendadas:
- Webhook da MisticPay → enviar e-mail automático com link
- Ou monitorar o painel da MisticPay e enviar manualmente

## Suporte MisticPay
- Docs: https://docs.misticpay.com
- Email: contato@misticpay.com
