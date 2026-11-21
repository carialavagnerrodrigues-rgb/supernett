// POST /api/pagar — Cria pagamento M-Pesa via Debito Pay Payment Orchestrator
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.DEBITOPAY_API_KEY;
  const MERCHANT_ID = process.env.DEBITOPAY_MERCHANT_ID;
  const WALLET_CODE = process.env.DEBITOPAY_WALLET_CODE;

  if (!API_KEY || !MERCHANT_ID || !WALLET_CODE) {
    return res.status(500).json({ error: 'Configuração do servidor incompleta. Contacte o administrador.' });
  }
  const BASE_URL = process.env.DEBITOPAY_BASE_URL || 'https://gyqoaningqhurhvdugne.supabase.co/functions/v1';

  try {
    const { numero, pacoteId, operadora } = req.body;

    if (!numero || !pacoteId) {
      return res.status(400).json({ error: 'Número e pacoteId são obrigatórios.' });
    }

    // Mapear pacoteId para valor
    const PACOTES = {
      n1: { dados: '3GB', valor: 38 },
      n2: { dados: '5GB', valor: 54 },
      n3: { dados: '8GB', valor: 81 },
      n4: { dados: '12GB', valor: 108 },
      n5: { dados: '20GB', valor: 162 },
      n6: { dados: '30GB', valor: 216 },
      n7: { dados: '42GB', valor: 323 },
      n8: { dados: '76GB', valor: 538 },
      n9: { dados: '86GB', valor: 807 },
      n10: { dados: '99GB', valor: 1076 },
      d1: { dados: '10GB Diamante', valor: 377 },
      d2: { dados: '25GB Diamante', valor: 538 },
      d3: { dados: '65GB Diamante', valor: 861 },
      d4: { dados: '86GB Diamante', valor: 1076 },
    };

    const pacote = PACOTES[pacoteId];
    if (!pacote) {
      return res.status(400).json({ error: 'Pacote inválido.' });
    }

    // Formatar telefone para +258XXXXXXXXX
    let phone = numero.replace(/\D/g, '');
    if (phone.length === 9) phone = '258' + phone;
    if (!phone.startsWith('258')) phone = '258' + phone;
    phone = '+' + phone;

    // Gerar source_id único
    const sourceId = `SN_${pacoteId.toUpperCase()}_${Date.now()}`;

    // Chamar Debito Pay Payment Orchestrator
    const response = await fetch(`${BASE_URL}/payment-orchestrator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Idempotency-Key': sourceId,
        ...(req.headers['x-forwarded-for'] && { 'X-Customer-IP': req.headers['x-forwarded-for'].split(',')[0].trim() }),
        ...(req.headers['user-agent'] && { 'X-Customer-User-Agent': req.headers['user-agent'] }),
        ...(req.headers['origin'] && { 'X-Customer-Origin': req.headers['origin'] }),
      },
      body: JSON.stringify({
        action: 'process',
        payment_method: 'mpesa',
        merchant_id: MERCHANT_ID,
        wallet_code: WALLET_CODE,
        amount: pacote.valor,
        currency: 'MZN',
        phone: phone,
        source: 'gateway',
        source_id: sourceId,
        customer_phone: phone,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      return res.status(response.status || 400).json({
        error: data.error || 'Erro ao processar pagamento.',
        details: data,
      });
    }

    return res.status(200).json({
      success: true,
      payment_id: data.payment_id,
      source_id: sourceId,
      reference: data.reference || data.transactionId || '',
      status: data.status,
      pacote: pacote.dados,
      valor: pacote.valor,
    });
  } catch (err) {
    console.error('Erro /api/pagar:', err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
