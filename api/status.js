// POST /api/status — Consulta estado do pagamento via Debito Pay
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.DEBITOPAY_API_KEY;
  const BASE_URL = process.env.DEBITOPAY_BASE_URL || 'https://gyqoaningqhurhvdugne.supabase.co/functions/v1';

  if (!API_KEY) {
    return res.status(500).json({ error: 'Configuração do servidor incompleta. DEBITOPAY_API_KEY em falta.' });
  }

  try {
    const { payment_id, source_id, reference } = req.body;

    if (!payment_id) {
      return res.status(400).json({ error: 'payment_id obrigatório.' });
    }

    const response = await fetch(`${BASE_URL}/payment-orchestrator`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        action: 'check-status',
        payment_id: payment_id,
      }),
    });

    const data = await response.json();

    if (!response.ok || data.success === false) {
      return res.status(200).json({
        status: 'pending',
        payment_id: payment_id,
      });
    }

    const payment = data.payment || {};
    return res.status(200).json({
      status: payment.status || 'pending',
      payment_id: payment.id || payment_id,
      reference: payment.provider_reference || reference || '',
      reason: payment.status === 'failed' ? (payment.failure_reason || 'Pagamento recusado pela operadora.') : undefined,
    });
  } catch (err) {
    console.error('Erro /api/status:', err);
    return res.status(200).json({ status: 'pending' });
  }
}
