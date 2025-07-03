// Parâmetros do Retornados - Funcionalidades

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('formParametros');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnRestaurarPadrao = document.getElementById('btnRestaurarPadrao');
    
    // Modal de mensagens
    const messageModal = document.getElementById('messageModal');
    const messageText = document.getElementById('messageText');
    const closeMessage = document.getElementById('closeMessage');
    
    // Configurações padrão
    const configPadrao = {
        descarte: { min: 0, max: 5 },
        uso_interno: { min: 6, max: 40 },
        estoque: { min: 41, max: 80 },
        novo: { min: 81, max: 100 }
    };
    
    // Carregar configurações salvas
    carregarConfiguracoes();
    
    // Event listeners
    btnSalvar.addEventListener('click', salvarConfiguracoes);
    btnRestaurarPadrao.addEventListener('click', restaurarPadrao);
    closeMessage.addEventListener('click', fecharMensagem);
    
    // Event listeners para validação em tempo real
    const inputs = form.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('input', validarFaixas);
    });
    
    // Atualizar tabela de visualização
    atualizarTabelaVisualizacao();
    
    // Função para carregar configurações
    function carregarConfiguracoes() {
        const configSalva = localStorage.getItem('parametrosRetornados');
        let config = configSalva ? JSON.parse(configSalva) : configPadrao;
        
        // Aplicar valores aos campos
        document.getElementById('descarte_min').value = config.descarte.min;
        document.getElementById('descarte_max').value = config.descarte.max;
        document.getElementById('uso_interno_min').value = config.uso_interno.min;
        document.getElementById('uso_interno_max').value = config.uso_interno.max;
        document.getElementById('estoque_min').value = config.estoque.min;
        document.getElementById('estoque_max').value = config.estoque.max;
        document.getElementById('novo_min').value = config.novo.min;
        document.getElementById('novo_max').value = config.novo.max;
        
        atualizarTabelaVisualizacao();
    }
    
    // Função para salvar configurações
    function salvarConfiguracoes() {
        if (!validarFaixas()) {
            mostrarMensagem('Por favor, corrija os valores das faixas antes de salvar.', 'error');
            return;
        }
        
        const config = {
            descarte: {
                min: parseFloat(document.getElementById('descarte_min').value),
                max: parseFloat(document.getElementById('descarte_max').value)
            },
            uso_interno: {
                min: parseFloat(document.getElementById('uso_interno_min').value),
                max: parseFloat(document.getElementById('uso_interno_max').value)
            },
            estoque: {
                min: parseFloat(document.getElementById('estoque_min').value),
                max: parseFloat(document.getElementById('estoque_max').value)
            },
            novo: {
                min: parseFloat(document.getElementById('novo_min').value),
                max: parseFloat(document.getElementById('novo_max').value)
            }
        };
        
        localStorage.setItem('parametrosRetornados', JSON.stringify(config));
        atualizarTabelaVisualizacao();
        mostrarMensagem('Configurações salvas com sucesso!', 'success');
    }
    
    // Função para restaurar configurações padrão
    function restaurarPadrao() {
        if (confirm('Tem certeza que deseja restaurar as configurações padrão? Esta ação irá sobrescrever as configurações atuais.')) {
            document.getElementById('descarte_min').value = configPadrao.descarte.min;
            document.getElementById('descarte_max').value = configPadrao.descarte.max;
            document.getElementById('uso_interno_min').value = configPadrao.uso_interno.min;
            document.getElementById('uso_interno_max').value = configPadrao.uso_interno.max;
            document.getElementById('estoque_min').value = configPadrao.estoque.min;
            document.getElementById('estoque_max').value = configPadrao.estoque.max;
            document.getElementById('novo_min').value = configPadrao.novo.min;
            document.getElementById('novo_max').value = configPadrao.novo.max;
            
            atualizarTabelaVisualizacao();
            mostrarMensagem('Configurações padrão restauradas!', 'success');
        }
    }
    
    // Função para validar faixas
    function validarFaixas() {
        let valido = true;
        
        // Limpar classes de erro
        inputs.forEach(input => {
            input.classList.remove('is-invalid');
        });
        
        // Obter valores
        const descarte_min = parseFloat(document.getElementById('descarte_min').value);
        const descarte_max = parseFloat(document.getElementById('descarte_max').value);
        const uso_interno_min = parseFloat(document.getElementById('uso_interno_min').value);
        const uso_interno_max = parseFloat(document.getElementById('uso_interno_max').value);
        const estoque_min = parseFloat(document.getElementById('estoque_min').value);
        const estoque_max = parseFloat(document.getElementById('estoque_max').value);
        const novo_min = parseFloat(document.getElementById('novo_min').value);
        const novo_max = parseFloat(document.getElementById('novo_max').value);
        
        // Validar se min <= max em cada faixa
        if (descarte_min > descarte_max) {
            document.getElementById('descarte_min').classList.add('is-invalid');
            document.getElementById('descarte_max').classList.add('is-invalid');
            valido = false;
        }
        
        if (uso_interno_min > uso_interno_max) {
            document.getElementById('uso_interno_min').classList.add('is-invalid');
            document.getElementById('uso_interno_max').classList.add('is-invalid');
            valido = false;
        }
        
        if (estoque_min > estoque_max) {
            document.getElementById('estoque_min').classList.add('is-invalid');
            document.getElementById('estoque_max').classList.add('is-invalid');
            valido = false;
        }
        
        if (novo_min > novo_max) {
            document.getElementById('novo_min').classList.add('is-invalid');
            document.getElementById('novo_max').classList.add('is-invalid');
            valido = false;
        }
        
        // Validar continuidade das faixas
        if (descarte_max >= uso_interno_min) {
            document.getElementById('descarte_max').classList.add('is-invalid');
            document.getElementById('uso_interno_min').classList.add('is-invalid');
            valido = false;
        }
        
        if (uso_interno_max >= estoque_min) {
            document.getElementById('uso_interno_max').classList.add('is-invalid');
            document.getElementById('estoque_min').classList.add('is-invalid');
            valido = false;
        }
        
        if (estoque_max >= novo_min) {
            document.getElementById('estoque_max').classList.add('is-invalid');
            document.getElementById('novo_min').classList.add('is-invalid');
            valido = false;
        }
        
        // Validar se todos os valores estão entre 0 e 100
        inputs.forEach(input => {
            const valor = parseFloat(input.value);
            if (isNaN(valor) || valor < 0 || valor > 100) {
                input.classList.add('is-invalid');
                valido = false;
            }
        });
        
        return valido;
    }
    
    // Função para atualizar tabela de visualização
    function atualizarTabelaVisualizacao() {
        const tbody = document.getElementById('tabelaRegras');
        
        const descarte_min = document.getElementById('descarte_min').value;
        const descarte_max = document.getElementById('descarte_max').value;
        const uso_interno_min = document.getElementById('uso_interno_min').value;
        const uso_interno_max = document.getElementById('uso_interno_max').value;
        const estoque_min = document.getElementById('estoque_min').value;
        const estoque_max = document.getElementById('estoque_max').value;
        const novo_min = document.getElementById('novo_min').value;
        const novo_max = document.getElementById('novo_max').value;
        
        tbody.innerHTML = `
            <tr class="table-danger">
                <td><strong>${descarte_min}% – ${descarte_max}%</strong></td>
                <td>Descarte o toner</td>
                <td><span class="badge" style="background-color: #8B4513; color: white;">Marrom</span></td>
            </tr>
            <tr class="table-warning">
                <td><strong>${uso_interno_min}% – ${uso_interno_max}%</strong></td>
                <td>Teste o toner. Se bom → Uso Interno. Se ruim → Descarte</td>
                <td><span class="badge bg-primary">Azul</span></td>
            </tr>
            <tr class="table-info">
                <td><strong>${estoque_min}% – ${estoque_max}%</strong></td>
                <td>Teste o toner. Se bom → Estoque (com % na caixa). Se ruim → Garantia</td>
                <td><span class="badge bg-success">Verde</span></td>
            </tr>
            <tr class="table-success">
                <td><strong>${novo_min}% – ${novo_max}%</strong></td>
                <td>Teste o toner. Se bom → Estoque (como novo). Se ruim → Garantia</td>
                <td><span class="badge bg-success">Verde</span></td>
            </tr>
        `;
    }
    
    // Função para mostrar mensagem
    function mostrarMensagem(texto, tipo) {
        messageText.textContent = texto;
        messageModal.classList.remove('success', 'error');
        messageModal.classList.add(tipo);
        
        const messageIcon = messageModal.querySelector('.message-icon i');
        if (tipo === 'success') {
            messageIcon.className = 'fas fa-check-circle';
        } else {
            messageIcon.className = 'fas fa-exclamation-circle';
        }
        
        messageModal.classList.add('show');
        
        setTimeout(() => {
            fecharMensagem();
        }, 5000);
    }
    
    // Função para fechar mensagem
    function fecharMensagem() {
        messageModal.classList.remove('show');
    }
    
    // Função global para obter configurações (para uso em outros módulos)
    window.obterParametrosRetornados = function() {
        const configSalva = localStorage.getItem('parametrosRetornados');
        return configSalva ? JSON.parse(configSalva) : configPadrao;
    };
    
    // Função global para classificar toner baseado na % de gramatura
    window.classificarToner = function(percentualGramatura) {
        const config = window.obterParametrosRetornados();
        
        if (percentualGramatura >= config.descarte.min && percentualGramatura <= config.descarte.max) {
            return {
                categoria: 'descarte',
                acao: 'Descarte o toner',
                cor: '#8B4513', // Marrom
                status: 'Descarte'
            };
        } else if (percentualGramatura >= config.uso_interno.min && percentualGramatura <= config.uso_interno.max) {
            return {
                categoria: 'uso_interno',
                acao: 'Teste o toner. Se bom → Uso Interno. Se ruim → Descarte',
                cor: '#007bff', // Azul
                status: 'Uso Interno'
            };
        } else if (percentualGramatura >= config.estoque.min && percentualGramatura <= config.estoque.max) {
            return {
                categoria: 'estoque',
                acao: 'Teste o toner. Se bom → Estoque (com % na caixa). Se ruim → Garantia',
                cor: '#28a745', // Verde
                status: 'Estoque'
            };
        } else if (percentualGramatura >= config.novo.min && percentualGramatura <= config.novo.max) {
            return {
                categoria: 'novo',
                acao: 'Teste o toner. Se bom → Estoque (como novo). Se ruim → Garantia',
                cor: '#28a745', // Verde
                status: 'Estoque'
            };
        } else {
            return {
                categoria: 'indefinido',
                acao: 'Percentual fora das faixas configuradas',
                cor: '#6c757d', // Cinza
                status: 'Indefinido'
            };
        }
    };
});