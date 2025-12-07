const veiculosDB = {
    carreta: [
        { nome: "Carreta 15.2m", c: 15.20, l: 2.50, h: 2.70 },
        { nome: "Carreta 14.6m", c: 14.60, l: 2.50, h: 2.70 }
    ],
    truck: [
        { nome: "Truck 10.4m", c: 10.40, l: 2.40, h: 2.70 },
        { nome: "Truck 9.7m", c: 9.70, l: 2.40, h: 2.70 }
    ],
    van: [{ nome: "VAN 3.1m", c: 3.10, l: 1.80, h: 1.90 }],
    container: [
        { nome: "40' HC", c: 12.00, l: 2.35, h: 2.58 },
        { nome: "45' HC", c: 13.50, l: 2.35, h: 2.58 }
    ]
};

function desenharVisual(canvas, colunas, linhas) {
    const ctx = canvas.getContext("2d");
    
    // Tamanho responsivo do canvas
    const containerWidth = canvas.parentElement.parentElement.clientWidth;
    const size = Math.min(containerWidth * 10.25, 1020);

    canvas.width = size;
    canvas.height = size;

    // Fundo
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, size, size);

    const margem = 30;

    // AQUI É A MÁGICA: tamanho inteligente baseado no número de colunas
    let larguraCelula = (size - margem * 1) / colunas;
    let alturaCelula = (size - margem * 1) / linhas;

    // Regras inteligentes pra nunca estourar e sempre ficar bonito
    if (colunas >= 12) {
        // Muitas colunas (12, 13, 14) → pallets menores, mas ainda grandes e legíveis
        larguraCelula = Math.min(larguraCelula, 92);
        alturaCelula = Math.min(alturaCelula, 110);
    } else if (colunas >= 10) {
        // 10 ou 11 colunas → pallets médios/grandes
        larguraCelula = Math.min(larguraCelula, 115);
        alturaCelula = Math.min(alturaCelula, 135);
    } else {
        // Poucas colunas (8, 9) → pallets GIGANTES
        larguraCelula = Math.min(larguraCelula, 150);
        alturaCelula = Math.min(alturaCelula, 170);
    }

    // Garante tamanho mínimo pra letra ser legível
    larguraCelula = Math.max(larguraCelula, 75);
    alturaCelula = Math.max(alturaCelula, 85);

    // Centralização perfeita
    const totalW = larguraCelula * colunas;
    const totalH = alturaCelula * linhas;
    const offsetX = (size - totalW) / 2;
    const offsetY = (size - totalH) / 2;

    let numero = 1;

    for (let x = 0; x < colunas; x++) {
        for (let y = 0; y < linhas; y++) {
            const px = offsetX + x * larguraCelula;
            const py = offsetY + y * alturaCelula;

            // Quadrado verde com efeito 3D
            ctx.fillStyle = "#22c55e";
            ctx.fillRect(px + 10, py + 10, larguraCelula - 20, alturaCelula - 20);

            ctx.strokeStyle = "#166534";
            ctx.lineWidth = 7;
            ctx.strokeRect(px + 10, py + 10, larguraCelula - 20, alturaCelula - 20);

            // Número MUITO GRANDE e com contorno preto (fica 100% legível)
            const fontSize = Math.min(larguraCelula * 0.5, 72);
            ctx.font = `bold ${fontSize}px Inter, sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Contorno preto (efeito profissional)
            ctx.strokeStyle = "black";
            ctx.lineWidth = fontSize * 0.2;
            ctx.strokeText(numero, px + larguraCelula / 2, py + alturaCelula / 2);

            // Preenchimento branco
            ctx.fillStyle = "white";
            ctx.fillText(numero++, px + larguraCelula / 2, py + alturaCelula / 2);
        }
    }
}

// SUBMIT DO FORMULÁRIO
document.getElementById("pallet-form").onsubmit = function(e) {
    e.preventDefault();

    document.getElementById("loading").classList.remove("hidden");
    document.getElementById("results").classList.add("hidden");
    document.getElementById("results-container").innerHTML = "";

    setTimeout(() => {
        const tipo = document.getElementById("vehicle-type").value;
        const comp = parseFloat(document.getElementById("length").value);
        const larg = parseFloat(document.getElementById("width").value);
        const alt = parseFloat(document.getElementById("height").value);

        const resultados = [];

        veiculosDB[tipo].forEach(veiculo => {
            // Orientação A: pallet de comprido no sentido do caminhão
            const A_fileirasComprimento = Math.floor(veiculo.c / comp);
            const A_fileirasLargura = Math.floor(veiculo.l / larg);
            const totalA = A_fileirasComprimento * A_fileirasLargura;

            // Orientação B: pallet de largura no sentido do caminhão
            const B_fileirasComprimento = Math.floor(veiculo.c / larg);
            const B_fileirasLargura = Math.floor(veiculo.l / comp);
            const totalB = B_fileirasComprimento * B_fileirasLargura;

            const melhor = totalB > totalA ? "B" : "A";
            const totalPallets = Math.max(totalA, totalB);
            const camadas = Math.floor(veiculo.h / alt);

            if (totalPallets > 0) {
                resultados.push({
                    veiculo: veiculo.nome,
                    total: totalPallets,
                    fileirasComprimento: melhor === "B" ? B_fileirasComprimento : A_fileirasComprimento,
                    fileirasLargura: melhor === "B" ? B_fileirasLargura : A_fileirasLargura,
                    orientacao: melhor === "B" ? "DE LARGURA" : "DE COMPRIDO",
                    ladoNoSentido: melhor === "B" ? larg : comp,
                    camadas
                });
            }
        });

        // Ordenar do melhor para o pior
        resultados.sort((a, b) => b.total - a.total);

        const container = document.getElementById("results-container");

        resultados.forEach((r, i) => {
            const canvasId = "canvas_" + Date.now() + "_" + i;

            const card = document.createElement("div");
            card.className = `card ${i === 0 ? "best" : ""} transform transition-all duration-500 opacity-0 translate-y-10`;
            
            card.innerHTML = `
                <h3 class="text-2xl font-bold mb-3">${r.veiculo}</h3>
                <p class="text-5xl font-extrabold text-green-400">${r.total}</p>
                <p class="text-gray-400 text-lg">Pallets totais</p>

                <div class="bg-blue-900/50 backdrop-blur border border-blue-700 p-4 rounded-xl text-center my-6 text-sm leading-relaxed">
                    <span class="text-yellow-300 font-bold block text-lg">Posicione o pallet ${r.orientacao}</span>
                    <span class="text-blue-300 font-bold">(${r.ladoNoSentido.toFixed(2)} m no sentido do caminhão)</span>
                </div>

                <div class="text-lg space-y-2">
                    <p>Fileiras: <span class="text-green-300 font-bold">${r.fileirasComprimento} × ${r.fileirasLargura}</span></p>
                    <p class="text-gray-400">Camadas: <span class="text-yellow-300 font-bold">${r.camadas}</span></p>
                </div>

                <div class="w-full flex justify-center mt-8">
                    <canvas id="${canvasId}" class="max-w-full h-auto rounded-lg shadow-2xl border-2 border-gray-700"></canvas>
                </div>
            `;

            container.appendChild(card);

            // Animação de entrada
            setTimeout(() => {
                card.classList.remove("opacity-0", "translate-y-10");
            }, i * 150);

            // Desenhar o canvas
            const canvas = document.getElementById(canvasId);
            requestAnimationFrame(() => desenharVisual(canvas, r.fileirasComprimento, r.fileirasLargura));
        });

        document.getElementById("loading").classList.add("hidden");
        document.getElementById("results").classList.remove("hidden");
    }, 400);
};

// LIMPAR
document.getElementById("clear-form").onclick = () => {
    document.getElementById("results").classList.add("hidden");
    document.getElementById("results-container").innerHTML = "";
};