let fase = parseInt(localStorage.getItem('faseAtual')) || 1;
let pontuacao = parseInt(localStorage.getItem('pontuacaoAtual')) || 0;
let pontos = [];
let parCorreto = [];
let selecionados = [];
let tentativas = 0;

document.addEventListener('DOMContentLoaded', () => {
    carregarFase(fase);

    document.getElementById('verificar').addEventListener('click', verificarResposta);
    document.getElementById('reiniciar').addEventListener('click', () => carregarFase(fase));
    document.getElementById('voltar-menu').addEventListener('click', () => {
        window.location.href = "/menu";
    });

    // ✅ Botão Resetar Jogo
    document.getElementById('resetar').addEventListener('click', () => {
        localStorage.removeItem('faseAtual');
        localStorage.removeItem('pontuacaoAtual');
        fase = 1;
        pontuacao = 0;
        carregarFase(fase);
    });
});

// Atualiza o valor visual da pontuação na tela
function atualizarPontuacao() {
    document.getElementById('pontuacao').textContent = pontuacao;
}

function carregarFase(novaFase) {
    fase = novaFase;
    localStorage.setItem('faseAtual', fase);
    tentativas = 0;
    selecionados = [];
    document.getElementById('fase').textContent = fase;
    document.getElementById('n-pontos').textContent = 50 + (fase - 1) * 10;
    document.getElementById('mapa').className = `fase-${fase}`;
    document.getElementById('mensagem').textContent = "";
    atualizarPontuacao();

    fetch(`/iniciar_fase/${fase}`)
        .then(res => res.json())
        .then(data => {
            pontos = data.pontos;
            parCorreto = data.parCorreto;
            renderizarPontos();
        });
}

function renderizarPontos() {
    const mapa = document.getElementById('mapa');
    mapa.innerHTML = '';

    const mensagem = document.getElementById('mensagem');
    if (selecionados.length === 2) {
        const [a, b] = selecionados;
        const dx = pontos[a].x - pontos[b].x;
        const dy = pontos[a].y - pontos[b].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        mensagem.textContent = `🔍 Distância: ${d.toFixed(1)}`;
        mensagem.className = "";
    }

    pontos.forEach((ponto, i) => {
        const elemento = document.createElement('div');
        elemento.className = 'ponto';
        elemento.style.left = `${ponto.x}px`;
        elemento.style.top = `${ponto.y}px`;

        if (selecionados.includes(i)) {
            elemento.classList.add('selecionado');
            elemento.style.backgroundColor = 'black';
        } else {
            elemento.classList.remove('selecionado');
            elemento.style.backgroundColor = ponto.cor;
        }

        elemento.title = `(${ponto.x}, ${ponto.y})`;
        elemento.addEventListener('click', () => selecionarPonto(i));
        mapa.appendChild(elemento);
    });
}

function selecionarPonto(i) {
    if (selecionados.includes(i)) {
        selecionados = selecionados.filter(idx => idx !== i);
    } else if (selecionados.length < 2) {
        selecionados.push(i);
    }
    renderizarPontos();
}

function verificarResposta() {
    const mensagem = document.getElementById('mensagem');

    if (selecionados.length !== 2) {
        mensagem.textContent = "Selecione DOIS asteroides!";
        mensagem.className = "errado";
        return;
    }

    tentativas++;

    const [a, b] = selecionados.sort((x, y) => x - y);
    const [corretoA, corretoB] = parCorreto;

    if (a === corretoA && b === corretoB) {
        const pontosGanhos = Math.max(100 - (tentativas - 1) * 10, 10);
        pontuacao += pontosGanhos;
        localStorage.setItem('pontuacaoAtual', pontuacao);
        atualizarPontuacao();
        mensagem.textContent = `✅ Correto! +${pontosGanhos} pontos. Total: ${pontuacao}`;
        mensagem.className = "correto";

        setTimeout(() => {
            mensagem.className = "";
            if (fase < 10) {
                carregarFase(fase + 1);
            } else {
                mensagem.textContent = "🎉 Parabéns! Você completou todas as fases!";
                mensagem.className = "correto";
            }
        }, 1500);
    } else {
        mensagem.textContent = "❌ Errado! Tente novamente.";
        mensagem.className = "errado";
        selecionados = [];
        renderizarPontos();
    }
}