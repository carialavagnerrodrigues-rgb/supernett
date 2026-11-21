// GET /api/pagamentos — Lista pagamentos para admin (consulta via wallet-balance)
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const codigo = req.query.codigo;
  if (codigo !== 'admegas8') {
    return res.status(401).json({ error: 'Acesso não autorizado.' });
  }

  const API_KEY = process.env.DEBITOPAY_API_KEY;
  const WALLET_CODE = process.env.DEBITOPAY_WALLET_CODE;
  const BASE_URL = process.env.DEBITOPAY_BASE_URL || 'https://gyqoaningqhurhvdugne.supabase.co/functions/v1';

  if (!API_KEY || !WALLET_CODE) {
    return res.status(500).json({ error: 'Configuração do servidor incompleta. Variáveis de ambiente em falta.' });
  }

  try {
    const response = await fetch(`${BASE_URL}/wallet-balance?wallet_code=${WALLET_CODE}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    return res.status(200).json({
      pagamentos: [],
      wallets: data.wallets || [],
      success: true,
    });
  } catch (err) {
    console.error('Erro /api/pagamentos:', err);
    return res.status(500).json({ error: 'Erro ao carregar dados.' });
  }
}
