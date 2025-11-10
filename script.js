// Espera o documento carregar antes de rodar o script
document.addEventListener("DOMContentLoaded", function() {

    // --- BANCO DE DADOS DE VEÍCULOS ---
    // ATENÇÃO: As imagens agora são locais.
    // Crie uma pasta 'assets' e salve as imagens nela.
    const carretas = [
        { nome: "Carreta de 15.2m", comprimento: 15.2, largura: 2.5, alturaMaxima: 2.7, quantidadeMaxima: 30, imagem: "assets/carreta.jpg" }, // Pode usar a mesma imagem
        { nome: "Carreta de 14.6m", comprimento: 14.6, largura: 2.5, alturaMaxima: 2.7, quantidadeMaxima: 28, imagem: "assets/carreta.jpg" }, // Pode usar a mesma imagem
    ];
    const trucks = [
        { nome: "Truck de 10.4m", comprimento: 10.4, largura: 2.4, alturaMaxima: 2.7, quantidadeMaxima: 16, imagem: "assets/truck.jpg" },
        { nome: "Truck de 9.7m", comprimento: 9.7, largura: 2.4, alturaMaxima: 2.7, quantidadeMaxima: 16, imagem: "assets/truck.jpg" },
        { nome: "Truck de 8.7m", comprimento: 8.7, largura: 2.4, alturaMaxima: 2.7, quantidadeMaxima: 14, imagem: "assets/truck.jpg" },
    ];
    const van = [
        { nome: "VAN 01", comprimento: 3.10, largura: 1.8, alturaMaxima: 1.9, quantidadeMaxima: 3, imagem: "assets/van.jpg" },
    ];
    const container = [
        { nome: "CONTAINER 45'HC", comprimento: 13, largura: 2.35, alturaMaxima: 2.58, quantidadeMaxima: 26, imagem: "assets/container.jpg" },
        { nome: "CONTAINER 40'HC", comprimento: 12, largura: 2.35, alturaMaxima: 2.58, quantidadeMaxima: 25, imagem: "assets/container.jpg" },
        { nome: "CONTAINER 20'DC", comprimento: 5.88, largura: 2.35, alturaMaxima: 2.26, quantidadeMaxima: 10, imagem: "assets/container.jpg" },
    ];
    const tiposVeiculo = {
        carreta: carretas,
        truck: trucks,
        van: van,
        container: container
    };

    // --- FUNÇÃO PARA ATUALIZAR IMAGEM DO VEÍCULO ---
    
    function updateVehicleImage(selectedType) {
        const vehicleSelect = document.getElementById("vehicle-type");
        const vehicleImageContainer = document.getElementById("vehicle-image-container");
        const vehicleImage = document.getElementById("vehicle-image");
        const vehiclePlaceholderIcon = document.getElementById("vehicle-placeholder-icon");
        const vehiclePlaceholderText = document.getElementById("vehicle-placeholder-text");
        const vehicleSelectedTitle = document.getElementById("vehicle-selected-title");

        const selectedOption = vehicleSelect.querySelector(`option[value="${selectedType}"]`);
        const selectedOptionText = selectedOption ? selectedOption.text : "Veículo";
        const vehicles = tiposVeiculo[selectedType];

        if (vehicles && vehicles.length > 0) {
            // Pega a imagem do primeiro veículo desse tipo
            const imageUrl = vehicles[0].imagem; 
            // Extrai o nome (ex: "Carreta") do texto (ex: "🚚 Carreta")
            const titleText = selectedOptionText.substring(selectedOptionText.indexOf(' ') + 1).trim(); 

            vehicleSelectedTitle.textContent = titleText + " Selecionado(a)";
            vehicleImage.src = imageUrl;
            vehicleImage.alt = "Imagem de " + titleText;
            vehicleImage.classList.remove("hidden");
            
            vehiclePlaceholderIcon.classList.add("hidden");
            vehiclePlaceholderText.classList.add("hidden");
            
            // Remove o estilo de placeholder (borda tracejada, etc.)
            vehicleImageContainer.classList.remove("border-dashed", "flex", "flex-col", "items-center", "justify-center", "text-gray-500");
        } else {
            // Caso de fallback (se houver uma opção "Selecione...")
            vehicleSelectedTitle.textContent = "Veículo Selecionado";
            vehicleImage.classList.add("hidden");
            vehicleImage.src = "";
            
            vehiclePlaceholderIcon.classList.remove("hidden");
            vehiclePlaceholderText.classList.remove("hidden");
            
            vehicleImageContainer.classList.add("border-dashed", "flex", "flex-col", "items-center", "justify-center", "text-gray-500");
        }
    }

    // --- Listener do Formulário Principal (CÁLCULO) ---
    document.getElementById("pallet-form").addEventListener("submit", function (e) {
        e.preventDefault();

        const loadingGif = document.getElementById("loading-gif");
        const resultsDiv = document.getElementById("results");
        const resultsTableBody = document.getElementById("results-table-body");

        loadingGif.classList.remove("hidden");
        resultsDiv.classList.add("hidden");
        resultsTableBody.innerHTML = ""; 

        // MELHORIA: Atraso reduzido de 500ms para 50ms.
        // Isso torna o cálculo quase instantâneo, eliminando o "lag".
        setTimeout(() => {
            const vehicleType = document.getElementById("vehicle-type").value;
            const length = parseFloat(document.getElementById("length").value);
            const width = parseFloat(document.getElementById("width").value);
            const height = parseFloat(document.getElementById("height").value);

            const veiculos = tiposVeiculo[vehicleType] || [];

            veiculos.forEach(veiculo => {
                const palletsPorComprimento = Math.floor(veiculo.comprimento / length);
                const palletsPorLargura = Math.floor(veiculo.largura / width);
                const totalPallets = palletsPorComprimento * palletsPorLargura;

                const camadas = Math.floor(veiculo.alturaMaxima / height);
                const alturaValida = camadas >= 1;
                const quantidadeValida = totalPallets <= veiculo.quantidadeMaxima;

                let statusClass, statusText;
                if (!alturaValida) {
                    statusClass = "bg-red-600 text-white";
                    statusText = "ATENÇÃO";
                } else if (!quantidadeValida) {
                    statusClass = "bg-yellow-500 text-black";
                    statusText = "ATENÇÃO";
                } else {
                    statusClass = "bg-green-600 text-white";
                    statusText = "OK";
                }
                const mensagemValidacao = `<span class="px-3 py-1 rounded-full font-semibold text-xs ${statusClass}">${statusText}</span>`;
                const cubagemTotal = length * width * height * totalPallets;
                const row = document.createElement("tr");
                row.className = "hover:bg-gray-700/50 transition-colors";
                
                row.innerHTML = `
                    <td class="px-4 py-3 border-b border-gray-700 text-gray-200">${veiculo.nome}</td>
                    <td class="px-4 py-3 border-b border-gray-700 text-gray-200">${totalPallets}</td>
                    <td class="px-4 py-3 border-b border-gray-700 text-gray-200">${height.toFixed(2)}</td>
                    <td class="px-4 py-3 border-b border-gray-700 text-gray-200">${camadas}</td>
                    <td class="px-4 py-3 border-b border-gray-700 text-gray-200">${veiculo.largura.toFixed(2)}</td>
                    <td class="px-4 py-3 border-b border-gray-700 text-gray-200">${cubagemTotal.toFixed(1)}</td>
                    <td class="px-4 py-3 border-b border-gray-700">${mensagemValidacao}</td>
                `;
                
                resultsTableBody.appendChild(row);
            });

            loadingGif.classList.add("hidden");
            if (veiculos.length > 0) {
                resultsDiv.classList.remove("hidden");
            }

        }, 50); // <-- Reduzido de 500 para 50
    });

    // --- Listener do Botão LIMPAR ---
    document.getElementById("clear-form").addEventListener("click", function() {
        document.getElementById("results").classList.add("hidden");
        document.getElementById("results-table-body").innerHTML = "";
        document.getElementById("loading-gif").classList.add("hidden");
        
        // Reseta o dropdown e a imagem para o padrão (Carreta)
        const vehicleSelect = document.getElementById("vehicle-type");
        const defaultVehicleType = "carreta";
        vehicleSelect.value = defaultVehicleType;
        //updateVehicleImage(defaultVehicleType); // Reseta a imagem
    });

    // --- Listener da SELEÇÃO DE VEÍCULO (para trocar a imagem) ---
    const vehicleSelect = document.getElementById("vehicle-type");
    vehicleSelect.addEventListener("change", function() {
        //updateVehicleImage(this.value);
    });

    // --- Carga Inicial ---
    // Define a imagem inicial ao carregar a página
   // updateVehicleImage(vehicleSelect.value);

});