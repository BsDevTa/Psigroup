/* ==========================================================================
   PSIGroup — interações
   Sem dependências externas. Cada bloco é isolado e falha em silêncio se o
   elemento correspondente não existir na página (defensivo por padrão).
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     1. Menu mobile
     ------------------------------------------------------------------ */
  (function mobileNav() {
    var toggle = document.getElementById('navToggle');
    var nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    var body = document.body;

    function openNav() {
      body.classList.add('nav-open');
      body.classList.remove('js-nav-closed');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Fechar menu');
    }

    function closeNav() {
      body.classList.remove('nav-open');
      body.classList.add('js-nav-closed');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menu');
    }

    function isOpen() {
      return body.classList.contains('nav-open');
    }

    toggle.addEventListener('click', function () {
      isOpen() ? closeNav() : openNav();
    });

    // Fecha ao clicar num link do menu (comportamento esperado em mobile)
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) closeNav();
    });

    // Fecha com Esc
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) {
        closeNav();
        toggle.focus();
      }
    });

    // Fecha ao clicar fora do header
    document.addEventListener('click', function (event) {
      if (!isOpen()) return;
      var header = document.querySelector('.site-header');
      if (header && !header.contains(event.target)) closeNav();
    });

    // Se a viewport crescer para desktop com o menu aberto, reseta o estado
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900 && isOpen()) closeNav();
    });
  })();

  /* ------------------------------------------------------------------
     1.5. Dropdown "Serviços" na navbar
     ------------------------------------------------------------------ */
  (function servicesDropdown() {
    var trigger = document.getElementById('servicosTrigger');
    var menu = document.getElementById('servicosMenu');
    if (!trigger || !menu) return;

    var wrapper = trigger.closest('.has-dropdown');

    function open() {
      wrapper.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function close() {
      wrapper.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    function isOpen() {
      return wrapper.classList.contains('is-open');
    }

    trigger.addEventListener('click', function (event) {
      event.stopPropagation();
      isOpen() ? close() : open();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) {
        close();
        trigger.focus();
      }
    });

    document.addEventListener('click', function (event) {
      if (isOpen() && !wrapper.contains(event.target)) close();
    });

    // Fecha o dropdown (e o menu mobile) ao escolher um serviço disponível
    menu.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        close();
        document.body.classList.remove('nav-open');
      }
    });
  })();

  /* ------------------------------------------------------------------
     2. Header: sombra/compactação ao rolar
     ------------------------------------------------------------------ */
  (function headerOnScroll() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  })();

  /* ------------------------------------------------------------------
     3. Scroll reveal genérico — timeline, hexágonos, diagrama "Sobre",
     fluxo "Como funciona" e a "pop" de entrada da seção Soluções.
     ------------------------------------------------------------------ */
  (function scrollReveal() {
    var revealItems = document.querySelectorAll('[data-reveal]');
    var popItems = document.querySelectorAll('[data-reveal-pop]');
    if (!revealItems.length && !popItems.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach(function (el) { el.classList.add('is-visible'); });
      popItems.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    // Escalona o atraso dos itens dentro de um mesmo grupo (timeline, hexágonos, flow)
    ['.timeline__item', '.flow__item', '.hex'].forEach(function (selector) {
      Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function (el, i) {
        el.style.setProperty('--i', i);
      });
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    revealItems.forEach(function (el) { observer.observe(el); });
    popItems.forEach(function (el) { observer.observe(el); });
  })();

  /* ------------------------------------------------------------------
     4. Números: contagem crescente ao entrar na viewport
     ------------------------------------------------------------------ */
  (function countUpStats() {
    var items = document.querySelectorAll('[data-count-to]');
    if (!items.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      return; // mantém os valores estáticos já presentes no HTML
    }

    function formatNumber(value, el) {
      var out = String(value);
      if (el.dataset.format === 'dot') {
        out = value.toLocaleString('pt-BR');
      }
      return (el.dataset.prefix || '') + out + (el.dataset.suffix || '');
    }

    function animate(el) {
      var target = parseInt(el.dataset.countTo, 10);
      if (isNaN(target)) return;

      var duration = 1200;
      var start = null;

      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        var current = Math.round(target * eased);
        el.textContent = formatNumber(current, el);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          el.textContent = formatNumber(target, el);
        }
      }
      window.requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });

    items.forEach(function (el) { observer.observe(el); });
  })();

  /* ------------------------------------------------------------------
     5. Botões de play (hero + depoimentos)
     Não há arquivo de vídeo real — o botão alterna um estado visual
     "reproduzindo" (ícone de pausa) para dar feedback de clique.
     Troque por integração de vídeo real quando houver asset.
     ------------------------------------------------------------------ */
  (function playButtons() {
    var buttons = document.querySelectorAll('[data-play-btn]');
    if (!buttons.length) return;

    var PLAY_ICON = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" style="width:100%;height:100%"><path d="M8 5v14l11-7z"/></svg>';
    var PAUSE_ICON = '<svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" style="width:100%;height:100%"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var playing = btn.getAttribute('aria-pressed') === 'true';
        btn.setAttribute('aria-pressed', String(!playing));
        btn.classList.toggle('is-playing', !playing);
        btn.innerHTML = !playing ? PAUSE_ICON : PLAY_ICON;
      });
    });
  })();

  /* ------------------------------------------------------------------
     6. Ano corrente no rodapé (se existir marcador)
     ------------------------------------------------------------------ */
  (function footerYear() {
    var el = document.querySelector('[data-current-year]');
    if (!el) return;
    el.textContent = new Date().getFullYear();
  })();

  /* ------------------------------------------------------------------
     7. Diagnóstico gratuito: seção "Nossas Soluções" + questionário modal
     ------------------------------------------------------------------ */
  (function diagnosticQuiz() {
    var quiz = document.getElementById('quiz');
    if (!quiz) return;

    var dialogEl = quiz.querySelector('.quiz__dialog');
    var overlayEl = quiz.querySelector('[data-quiz-close]');
    var bodyEl = document.getElementById('quizBody');
    var scrollEl = quiz.querySelector('.quiz__scroll');
    var titleEl = document.getElementById('quizTitle');
    var stepLabelEl = document.getElementById('quizStepLabel');
    var progressBarEl = document.getElementById('quizProgressBar');
    var backBtn = document.getElementById('quizBackBtn');
    var nextBtn = document.getElementById('quizNextBtn');
    var closeBtn = document.getElementById('quizCloseBtn');

    var PATH_LABEL = {
      pessoas: 'Pessoas', operacao: 'Operação', facilities: 'Facilities',
      saude: 'Saúde', gestao: 'Gestão e Tecnologia', expansao: 'Expansão'
    };
    var LEVEL_LABEL = { baixo: 'Baixo', moderado: 'Moderado', alto: 'Alto', urgente: 'Urgente' };
    var LEVEL_ORDER = ['baixo', 'moderado', 'alto', 'urgente'];
    var PILLAR_LABEL = { pessoas: 'Pessoas', operacao: 'Operação', gestao: 'Gestão' };
    var UNIT_INFO = {
      pessoas: { name: 'ContrateExpress', desc: 'Atração, seleção e mentoria para estruturar sua equipe.' },
      operacao: { name: 'TerceirizaJá', desc: 'Gestão de mão de obra e apoio operacional.' },
      gestao: { name: 'Consultoria PSIGroup', desc: 'Estruturação de indicadores, processos e acompanhamento de perto.' }
    };
    var SUMMARY_TEMPLATES = {
      pessoas: 'Sua empresa parece sentir mais o peso na atração e retenção de pessoas — vagas difíceis de preencher e equipe que não entrega como deveria costumam gerar sobrecarga direta pra gestão.',
      operacao: 'Sua empresa parece estar tentando resolver problemas operacionais com ações pontuais, sem um processo estruturado para prevenir recorrências.',
      gestao: 'A falta de processos documentados e de indicadores de acompanhamento parece deixar a operação mais dependente do improviso do que deveria.'
    };

    var QUESTIONS = [
      { id: 'segmento', title: 'Qual é o seu segmento?', type: 'single', options: [
        'Hotelaria ou Alimentos e Bebidas', 'Condomínio ou Residências', 'Comércio ou Indústrias',
        'Escritório ou Serviços', 'Logística ou Distribuição', 'Bem-estar e Fitness', 'Outros'
      ]},
      { id: 'tamanho', title: 'Quantas pessoas fazem parte da sua operação atualmente?', type: 'single', options: [
        'Até 10', '11 a 30', '31 a 100', '101 a 300', 'Mais de 300'
      ]},
      { id: 'momento', title: 'Sua empresa está em qual momento?', type: 'single', options: [
        { label: 'Começando ou estruturando', weights: { gestao: 15 } },
        { label: 'Crescendo rapidamente', weights: { pessoas: 15, operacao: 10 } },
        { label: 'Operando normalmente', weights: {} },
        { label: 'Passando por dificuldades', weights: { operacao: 25, gestao: 15 } },
        { label: 'Expandindo para novas unidades', weights: { operacao: 10, gestao: 10 } },
        { label: 'Reestruturando equipes e processos', weights: { gestao: 20, operacao: 10 } }
      ]},
      { id: 'dores', title: 'Hoje, qual situação mais está tirando sua energia como gestor?', type: 'multi', max: 3,
        hint: 'Selecione até 3 opções', options: [
        { label: 'Tenho dificuldade para encontrar as pessoas certas', weights: { pessoas: 18 } },
        { label: 'Contrato pessoas, mas tenho muita rotatividade', weights: { pessoas: 20 } },
        { label: 'Minha equipe não está entregando como deveria', weights: { pessoas: 15, gestao: 10 } },
        { label: 'Tenho problemas para controlar a operação', weights: { operacao: 20 } },
        { label: 'Minha empresa está crescendo e preciso estruturar melhor', weights: { gestao: 18 } },
        { label: 'Perco muito tempo resolvendo problemas que deveriam estar organizados', weights: { gestao: 15, operacao: 10 } },
        { label: 'Tenho custos altos e não sei exatamente onde estão os gargalos', weights: { operacao: 15, gestao: 10 } }
      ]},
      { id: 'impacto', title: 'Quanto isso impacta você ou sua empresa? Imagine se esse problema continuar pelos próximos 6 meses, qual será o impacto?', type: 'single', options: [
        { label: 'Baixo', level: 'baixo', multiplier: 0.6 },
        { label: 'Moderado', level: 'moderado', multiplier: 0.8 },
        { label: 'Alto', level: 'alto', multiplier: 1.0 },
        { label: 'Crítico', level: 'urgente', multiplier: 1.2 }
      ]},
      { id: 'prazo', title: 'Quando você precisa começar a resolver todas as situações?', type: 'single', options: [
        { label: 'Estou apenas pesquisando', level: 'baixo' },
        { label: 'Nos próximos 3 meses', level: 'moderado' },
        { label: 'Nos próximos 30 dias', level: 'alto' },
        { label: 'Nos próximos 15 dias', level: 'urgente' },
        { label: 'Preciso de uma solução imediata', level: 'urgente' }
      ]},
      { id: 'acontecendo', title: 'O que está acontecendo hoje?', type: 'multi', options: [
        { label: 'Faltas', weights: { pessoas: 8 } },
        { label: 'Atrasos', weights: { pessoas: 8 } },
        { label: 'Falta de profissionais', weights: { pessoas: 8 } },
        { label: 'Trocas de equipe', weights: { pessoas: 8 } },
        { label: 'Qualidade do serviço', weights: { operacao: 8 } },
        { label: 'Escalas', weights: { operacao: 8 } },
        { label: 'Documentação', weights: { gestao: 8 } },
        { label: 'Falta de acompanhamento', weights: { gestao: 8 } },
        { label: 'Comunicação', weights: { gestao: 8 } },
        { label: 'Custos', weights: { operacao: 8 } }
      ]},
      { id: 'processos', title: 'Hoje, seus processos estão documentados?', type: 'single', options: [
        { label: 'Sim, na maior parte', weights: {} },
        { label: 'Alguns', weights: { gestao: 10 } },
        { label: 'Poucos', weights: { gestao: 18 } },
        { label: 'Não', weights: { gestao: 25 } }
      ]},
      { id: 'desempenho', title: 'Quando alguém apresenta baixo desempenho, o que acontece?', type: 'single', options: [
        { label: 'Recebe feedback e plano de melhoria', weights: {} },
        { label: 'O gestor conversa informalmente', weights: { gestao: 8 } },
        { label: 'Normalmente trocamos a pessoa', weights: { pessoas: 15 } },
        { label: 'Nada estruturado', weights: { pessoas: 15, gestao: 15 } },
        { label: 'Depende do gestor', weights: { gestao: 10 } }
      ]},
      { id: 'responsavel', title: 'Quem assume esses problemas hoje?', type: 'single', options: [
        { label: 'Proprietário', weights: { gestao: 8 } },
        { label: 'Gestor', weights: {} },
        { label: 'RH', weights: {} },
        { label: 'Administrativo', weights: {} },
        { label: 'Supervisor', weights: {} },
        { label: 'Cada pessoa resolve de um jeito', weights: { gestao: 15 } }
      ]}
    ];

    // Normaliza opções string ("Até 10") para o mesmo formato { label, weights }
    QUESTIONS.forEach(function (q) {
      q.options = q.options.map(function (opt) {
        return typeof opt === 'string' ? { label: opt, weights: {} } : opt;
      });
    });

    var quizState = { stepIndex: 0, answers: {}, path: null };
    var lastFocusedEl = null;

    function getSelectedOption(qid) {
      var q = null;
      for (var i = 0; i < QUESTIONS.length; i++) {
        if (QUESTIONS[i].id === qid) { q = QUESTIONS[i]; break; }
      }
      if (!q) return null;
      var selected = quizState.answers[qid] || [];
      return selected.length ? q.options[selected[0]] : null;
    }

    function toggleOption(q, index) {
      var selected = quizState.answers[q.id] || [];
      if (q.type === 'single') {
        selected = [index];
      } else {
        var pos = selected.indexOf(index);
        if (pos !== -1) {
          selected.splice(pos, 1);
        } else {
          if (q.max && selected.length >= q.max) return;
          selected.push(index);
        }
      }
      quizState.answers[q.id] = selected;
      renderStep(quizState.stepIndex);
    }

    function renderStep(index) {
      var q = QUESTIONS[index];
      var selected = quizState.answers[q.id] || [];

      titleEl.textContent = q.title;
      stepLabelEl.textContent = 'Passo ' + (index + 1) + ' de ' + QUESTIONS.length;
      progressBarEl.style.width = Math.round(((index + 1) / QUESTIONS.length) * 100) + '%';

      bodyEl.innerHTML = '';

      var listEl = document.createElement('div');
      listEl.className = 'quiz__options';

      q.options.forEach(function (opt, i) {
        var isSelected = selected.indexOf(i) !== -1;
        var atMax = q.type === 'multi' && q.max && selected.length >= q.max && !isSelected;

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz__option';
        btn.setAttribute('data-type', q.type);
        btn.setAttribute('aria-pressed', String(isSelected));
        if (atMax) btn.disabled = true;
        btn.innerHTML = '<span class="quiz__option-mark" aria-hidden="true"></span><span>' + opt.label + '</span>';
        btn.addEventListener('click', function () { toggleOption(q, i); });
        listEl.appendChild(btn);
      });

      bodyEl.appendChild(listEl);

      if (q.hint) {
        var hintEl = document.createElement('p');
        hintEl.className = 'quiz__hint';
        hintEl.textContent = q.hint + ' (' + selected.length + ' de ' + q.max + ' selecionadas)';
        bodyEl.appendChild(hintEl);
      }

      backBtn.hidden = index === 0;
      nextBtn.textContent = index === QUESTIONS.length - 1 ? 'Ver meu diagnóstico' : 'Continuar';
      nextBtn.disabled = selected.length === 0;

      if (scrollEl) scrollEl.scrollTop = 0;
    }

    function computeResult() {
      var scores = { pessoas: 0, operacao: 0, gestao: 0 };

      QUESTIONS.forEach(function (q) {
        var selected = quizState.answers[q.id] || [];
        selected.forEach(function (i) {
          var opt = q.options[i];
          if (!opt.weights) return;
          for (var pillar in opt.weights) {
            if (Object.prototype.hasOwnProperty.call(opt.weights, pillar)) {
              scores[pillar] += opt.weights[pillar];
            }
          }
        });
      });

      var impactoOpt = getSelectedOption('impacto');
      var multiplier = impactoOpt && impactoOpt.multiplier ? impactoOpt.multiplier : 1;
      Object.keys(scores).forEach(function (pillar) {
        scores[pillar] = Math.max(0, Math.min(100, Math.round(scores[pillar] * multiplier)));
      });

      var prazoOpt = getSelectedOption('prazo');
      var levelFromImpacto = impactoOpt ? impactoOpt.level : 'baixo';
      var levelFromPrazo = prazoOpt ? prazoOpt.level : 'baixo';
      var level = LEVEL_ORDER[Math.max(LEVEL_ORDER.indexOf(levelFromImpacto), LEVEL_ORDER.indexOf(levelFromPrazo))];

      return { scores: scores, level: level };
    }

    function buildWhatsAppLink(result) {
      var lines = ['Olá! Fiz o diagnóstico gratuito no site da PSIGroup e quero saber mais.'];
      if (quizState.path && PATH_LABEL[quizState.path]) {
        lines.push('Caminho escolhido: ' + PATH_LABEL[quizState.path]);
      }
      QUESTIONS.forEach(function (q) {
        var selected = quizState.answers[q.id] || [];
        if (!selected.length) return;
        var labels = selected.map(function (i) { return q.options[i].label; }).join(', ');
        lines.push(q.title + ' ' + labels);
      });
      lines.push('Nível de atenção: ' + LEVEL_LABEL[result.level]);
      lines.push('Scores — Pessoas: ' + result.scores.pessoas + ', Operação: ' + result.scores.operacao + ', Gestão: ' + result.scores.gestao);
      return 'https://wa.me/5571988221221?text=' + encodeURIComponent(lines.join('\n'));
    }

    function showResult() {
      var result = computeResult();
      var pillars = Object.keys(result.scores).sort(function (a, b) { return result.scores[b] - result.scores[a]; });
      var topPillar = pillars[0];
      var topTwo = pillars.slice(0, 2);

      dialogEl.classList.add('is-result');
      stepLabelEl.textContent = 'Seu diagnóstico';
      progressBarEl.style.width = '100%';
      titleEl.textContent = 'Seu diagnóstico e situação atual';

      bodyEl.innerHTML = '';

      var badge = document.createElement('div');
      badge.className = 'quiz__badge';
      badge.setAttribute('data-level', result.level);
      badge.innerHTML = '<span class="quiz__badge-dot" aria-hidden="true"></span>Nível de atenção: ' + LEVEL_LABEL[result.level];
      bodyEl.appendChild(badge);

      var scoresWrap = document.createElement('div');
      scoresWrap.className = 'quiz__scores';
      pillars.forEach(function (p) {
        var row = document.createElement('div');
        row.className = 'quiz__score-row';
        row.innerHTML =
          '<div class="quiz__score-label"><span>' + PILLAR_LABEL[p] + '</span><span>' + result.scores[p] + '/100</span></div>' +
          '<div class="quiz__score-track"><span class="quiz__score-bar" data-target="' + result.scores[p] + '"></span></div>';
        scoresWrap.appendChild(row);
      });
      bodyEl.appendChild(scoresWrap);

      var summary = document.createElement('p');
      summary.className = 'quiz__summary';
      summary.textContent = SUMMARY_TEMPLATES[topPillar];
      bodyEl.appendChild(summary);

      var recoHead = document.createElement('p');
      recoHead.className = 'quiz__reco-head';
      recoHead.textContent = 'Algumas soluções indicadas';
      bodyEl.appendChild(recoHead);

      var reco = document.createElement('div');
      reco.className = 'quiz__reco';
      var seenNames = {};
      topTwo.forEach(function (p) {
        var unit = UNIT_INFO[p];
        if (seenNames[unit.name]) return;
        seenNames[unit.name] = true;
        var card = document.createElement('a');
        card.href = '#unidades';
        card.className = 'quiz__reco-card';
        card.innerHTML = '<div><strong>' + unit.name + '</strong><span>' + unit.desc + '</span></div>';
        reco.appendChild(card);
      });
      bodyEl.appendChild(reco);

      var actions = document.createElement('div');
      actions.className = 'quiz__result-actions';

      var waLink = document.createElement('a');
      waLink.className = 'btn btn--gold';
      waLink.target = '_blank';
      waLink.rel = 'noopener';
      waLink.href = buildWhatsAppLink(result);
      waLink.textContent = 'Falar com um especialista';
      actions.appendChild(waLink);

      var restartBtn = document.createElement('button');
      restartBtn.type = 'button';
      restartBtn.className = 'btn btn--outline';
      restartBtn.textContent = 'Refazer diagnóstico';
      restartBtn.addEventListener('click', function () { openQuiz(quizState.path, lastFocusedEl); });
      actions.appendChild(restartBtn);

      bodyEl.appendChild(actions);

      if (!prefersReducedMotion) {
        window.requestAnimationFrame(function () {
          Array.prototype.slice.call(scoresWrap.querySelectorAll('.quiz__score-bar')).forEach(function (bar) {
            bar.style.width = bar.getAttribute('data-target') + '%';
          });
        });
      } else {
        Array.prototype.slice.call(scoresWrap.querySelectorAll('.quiz__score-bar')).forEach(function (bar) {
          bar.style.width = bar.getAttribute('data-target') + '%';
        });
      }
    }

    function openQuiz(path, triggerEl) {
      quizState = { stepIndex: 0, answers: {}, path: path || null };
      dialogEl.classList.remove('is-result');
      lastFocusedEl = triggerEl || document.activeElement;
      quiz.hidden = false;
      document.body.style.overflow = 'hidden';
      renderStep(0);
      var firstOption = bodyEl.querySelector('.quiz__option');
      if (firstOption) firstOption.focus();
    }

    function closeQuiz() {
      quiz.hidden = true;
      document.body.style.overflow = '';
      if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') lastFocusedEl.focus();
    }

    document.querySelectorAll('[data-open-quiz]').forEach(function (el) {
      el.addEventListener('click', function () { openQuiz(el.getAttribute('data-path'), el); });
    });

    nextBtn.addEventListener('click', function () {
      if (quizState.stepIndex < QUESTIONS.length - 1) {
        quizState.stepIndex++;
        renderStep(quizState.stepIndex);
      } else {
        showResult();
      }
    });

    backBtn.addEventListener('click', function () {
      if (quizState.stepIndex > 0) {
        quizState.stepIndex--;
        renderStep(quizState.stepIndex);
      }
    });

    closeBtn.addEventListener('click', closeQuiz);
    if (overlayEl) overlayEl.addEventListener('click', closeQuiz);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !quiz.hidden) closeQuiz();
    });
  })();

  /* ------------------------------------------------------------------
     Utilitário: debounce simples, sem dependências
     ------------------------------------------------------------------ */
  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

})();
