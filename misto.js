const veiculosDB = {
  carreta: [
    {nome:"Carreta 15.4m",c:15.40,l:2.50,h:2.70}, 
    {nome:"Carreta 14.6m",c:14.60,l:2.50,h:2.70}
  ],
  truck: [
    {nome:"Truck 10.4m",c:10.40,l:2.40,h:2.70}, 
    {nome:"Truck 9.7m",c:9.70,l:2.40,h:2.70}, 
    {nome:"Truck 8.5m",c:8.50,l:2.40,h:2.70}
  ],
  van: [
    {nome:"VAN 3.1m",c:3.10,l:1.80,h:1.90},
    {nome: "IVECO BAU 3.9m",c: 3.90, l: 2.10, h: 2.10 }
  ],
  container: [
    {nome:"45' HC",c:13.50,l:2.35,h:2.58}, 
    {nome:"40' HC",c:12.00,l:2.35,h:2.58}, 
    {nome:"20' DC",c:5.88,l:2.35,h:2.26}
  ]
};

const cores = [
  "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444",
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#a78bfa"
];

let veiculo = null, numeroPallet = 1, tipoPallet = 0;
const carga = [];
let restante = 0;

const cat = document.getElementById('categoria');
const vei = document.getElementById('veiculo');
const infoVei = document.getElementById('infoVeiculo');
const passo2 = document.getElementById('passo2');
const bau = document.getElementById('bau');
const legenda = document.getElementById('legenda');
const info = document.getElementById('info');
const total = document.getElementById('total');

// Preencher categorias
Object.keys(veiculosDB).forEach(k => 
  cat.add(new Option(k.charAt(0).toUpperCase() + k.slice(1).replace('container','Container'), k))
);

cat.onchange = () => {
  vei.innerHTML = '<option>-- Escolha o veículo --</option>';
  veiculosDB[cat.value]?.forEach(v => vei.add(new Option(v.nome, JSON.stringify(v))));
};

vei.onchange = () => {
  if (!vei.value) return;
  veiculo = JSON.parse(vei.value);
  restante = veiculo.c;
  infoVei.textContent = `${veiculo.nome} → ${veiculo.c}m × ${veiculo.l}m × ${veiculo.h}m de espaço útil`;
  passo2.style.display = 'block';
  limpar();
};

function limpar() {
  bau.innerHTML = ''; legenda.innerHTML = ''; info.innerHTML = '';
  total.innerHTML = '';
  carga.length = 0; numeroPallet = 1; tipoPallet = 0;
  restante = veiculo?.c || 0;
}

document.getElementById('add').onclick = () => {
  const cp = +document.getElementById('comp').value;
  const lp = +document.getElementById('larg').value;
  const hp = +document.getElementById('alt').value;
  const desejado = +document.getElementById('qtd').value;

  if (!cp || !lp || !hp || !desejado) return alert("⚠️ Preencha todos os campos!");
  if (hp > veiculo.h) return alert("❌ Pallet muito alto para este veículo!");

  // Determinar lado de apoio correto
  let lado, avanco;
  if (lp <= cp) { 
    lado = lp; avanco = cp; 
  } else { 
    lado = cp; avanco = lp; 
  }

  const porColuna = Math.floor(veiculo.l / lado);
  const colunasCabem = Math.floor(restante / avanco);
  const max = porColuna * colunasCabem;
  if (max === 0) return alert("❌ Não há mais espaço no comprimento!");

  const colocados = Math.min(desejado, max);
  const colunasUsadas = Math.ceil(colocados / porColuna);

  // Calcular avanço proporcional para o restante
  const colunasCompletas = Math.floor(colocados / porColuna);
  const ultimaColuna = colocados % porColuna;
  const avancosReais = colunasCompletas * avanco + (ultimaColuna > 0 ? avanco * (ultimaColuna / porColuna) : 0);
  restante = Math.round((restante - avancosReais) * 100) / 100;

  // Salvar na carga
  carga.push({
    tipo: ++tipoPallet,
    cor: cores[(tipoPallet-1) % cores.length],
    inicio: numeroPallet,
    cp, lp, hp, desejado, colocados,
    porColuna, colunasUsadas,
    lado, avanco
  });
  numeroPallet += colocados;

  ['comp','larg','alt','qtd'].forEach(id => document.getElementById(id).value = '');
  desenhar();
};

function desenhar() {
  bau.innerHTML = ''; 
  legenda.innerHTML = ''; 
  info.innerHTML = '<strong class="text-xl text-primary">Instruções de carregamento:</strong><br><br>';
  
  let totalColocados = 0;
  let totalDesejado = 0;
  let totalUsado = 0;

  carga.forEach(p => {
    totalColocados += p.colocados;
    totalDesejado += p.desejado;

    // Avanço proporcional real
    const colunasCompletas = Math.floor(p.colocados / p.porColuna);
    const ultimaColuna = p.colocados % p.porColuna;
    const avancosReais = colunasCompletas * p.avanco + (ultimaColuna > 0 ? p.avanco * (ultimaColuna / p.porColuna) : 0);
    totalUsado += avancosReais;

    // Legenda
    const item = document.createElement('div');
    item.className = 'flex items-center gap-4 bg-slate/50 px-6 py-4 rounded-xl border border-gray-700';
    item.innerHTML = `<div class="w-10 h-10 rounded-lg shadow-lg" style="background:${p.cor}"></div>
                      <span class="font-bold text-lg">#${String(p.tipo).padStart(2,'0')} → ${p.cp} × ${p.lp} × ${p.hp} m</span>`;
    legenda.appendChild(item);

    // Pallets visuais
    for (let c = 0; c < p.colunasUsadas; c++) {
      const coluna = document.createElement('div');
      coluna.className = 'flex flex-col items-center gap-3';
      const qtdNesta = Math.min(p.colocados - c * p.porColuna, p.porColuna);
      for (let i = 0; i < qtdNesta; i++) {
        const pallet = document.createElement('div');
        pallet.className = 'w-24 h-24 rounded-2xl flex items-center justify-center text-2xl font-black shadow-2xl transform hover:scale-110 transition';
        pallet.style.background = p.cor;
        pallet.textContent = p.inicio + c * p.porColuna + i;
        coluna.appendChild(pallet);
      }
      bau.appendChild(coluna);
    }

    // Resumo formal
    info.innerHTML += `
      <div class="mb-6 p-5 bg-slate/50 rounded-xl border border-gray-700">
        <strong>#${String(p.tipo).padStart(2,'0')} → ${p.cp} × ${p.lp} × ${p.hp} m</strong><br>
        Carregar no lado de <strong>${p.lado.toFixed(2)} m</strong><br>
        Pedido: ${p.desejado} pallets → Carregado: ${p.colocados} ${p.colocados < p.desejado ? `(faltaram ${p.desejado - p.colocados})` : ''}<br>
        Distribuição: ${p.porColuna} pallets por linha × ${p.colunasUsadas} linhas → Total: ${p.colocados}
      </div>`;
  });

  total.innerHTML = `
    <div class="grid grid-cols-3 gap-8 text-center mt-6">
      <div>
        <div class="text-5xl font-black text-success">${totalColocados}</div>
        <div class="text-gray-400 uppercase text-sm tracking-wider">TOTAL PALLETS</div>
      </div>
      <div>
        <div class="text-5xl font-black text-primary">${(veiculo.c - totalUsado).toFixed(2)}</div>
        <div class="text-gray-400 uppercase text-sm tracking-wider">SOBRANDO (m)</div>
      </div>
      <div>
        <div class="text-5xl font-black text-yellow-400">${totalUsado.toFixed(2)}</div>
        <div class="text-gray-400 uppercase text-sm tracking-wider">TOTAL FECHADO (m)</div>
      </div>
    </div>
  `;
}

document.getElementById('finalizar').onclick = () => {
  const perc = ((veiculo.c - restante) / veiculo.c * 100).toFixed(1);
  alert(`🚛 CARGA FINALIZADA!\n\n${veiculo.nome}\n${carga.reduce((a,c)=>a+c.colocados,0)} pallets carregados de ${carga.reduce((a,c)=>a+c.desejado,0)}\n${(veiculo.c - restante).toFixed(2)}m utilizados → ${perc}% de aproveitamento`);
};

// Botão Carga Mista
document.getElementById('mixed-load')?.addEventListener('click', () => {
  window.location.href = 'misto.html';
});

// Botão limpar
document.getElementById('clear-form').onclick = limpar;
