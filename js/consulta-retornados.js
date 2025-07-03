// Consulta de Toners Retornados - Funcionalidades

document.addEventListener('DOMContentLoaded', function() {
    // Elementos dos filtros
    const filtroModelo = document.getElementById('filtroModelo');
    const filtroCliente = document.getElementById('filtroCliente');
    const filtroFilial = document.getElementById('filtroFilial');
    const filtroStatus = document.getElementById('filtroStatus');
    const dataInicio = document.getElementById('dataInicio');
    const dataFim = document.getElementById('dataFim');
    const valorMinimo = document.getElementById('valorMinimo');
    const valorMaximo = document.getElementById('valorMaximo');
    
    // Botões
    const btnAplicarFiltros = document.getElementById('btnAplicarFiltros');
    const btnLimparFiltros = document.getElementById('btnLimparFiltros');
    const btnExportarConsulta = document.getElementById('btnExportarConsulta');
    const btnRelatorio = document.getElementById('btnRelatorio');
    const btnExportarRelatorio = document.getElementById('btnExportarRelatorio');
    
    // Elementos de estatísticas
    const totalRetornados = document.getElementById('totalRetornados');
    const totalEstoque = document.getElementById('totalEstoque');
    const valorTotal = document.getElementById('valorTotal');
    const retornadosHoje = document.getElementById('retornadosHoje');
    
    // Modais
    const modalDetalhes = new bootstrap.Modal(document.getElementById('modalDetalhes'));
    const modalRelatorio = new bootstrap.Modal(document.getElementById('modalRelatorio'));
    
    // Modal de mensagens
    const messageModal = document.getElementById('messageModal');
    const messageText = document.getElementById('messageText');
    const closeMessage = document.getElementById('closeMessage');
    
    // Paginação
    const itensPorPagina = 50;
    let paginaAtual = 1;
    let totalPaginas = 1;
    
    // Arrays para armazenar dados
    let retornados = [];
    let retornadosFiltrados = [];
    let ordenacao = { campo: 'dataRegistro', direcao: 'desc' };
    
    // Carregar dados
    carregarDados();
    
    // Event listeners
    btnAplicarFiltros.addEventListener('click', aplicarFiltros);
    btnLimparFiltros.addEventListener('click', limparFiltros);
    btnExportarConsulta.addEventListener('click', exportarConsulta);
    btnRelatorio.addEventListener('click', gerarRelatorio);
    btnExportarRelatorio.addEventListener('click', exportarRelatorio);
    closeMessage.addEventListener('click', fecharMensagem);
    
    // Função para carregar dados
    function carregarDados() {
        // Carregar retornados
        const retornadosArmazenados = localStorage.getItem('tonersRetornados');
        if (retornadosArmazenados) {
            retornados = JSON.parse(retornadosArmazenados);
        }
        
        // Preencher filtros
        preencherFiltros();
        
        // Aplicar filtros iniciais (mostrar todos)
        retornadosFiltrados = [...retornados];
        atualizarEstatisticas();
        atualizarTabela();
    }
    
    // Função para preencher os filtros
    function preencherFiltros() {
        // Modelos únicos
        const modelos = [...new Set(retornados.map(r => r.modelo))];
        filtroModelo.innerHTML = '<option value="">Todos os modelos</option>';
        modelos.forEach(modelo => {
            const option = document.createElement('option');
            option.value = modelo;
            option.textContent = modelo;
            filtroModelo.appendChild(option);
        });
        
        // Filiais únicas
        const filiais = [...new Set(retornados.map(r => r.filial))];
        filtroFilial.innerHTML = '<option value="">Todas as filiais</option>';
        filiais.forEach(filial => {
            const option = document.createElement('option');
            option.value = filial;
            option.textContent = filial;
            filtroFilial.appendChild(option);
        });
    }
    
    // Função para aplicar filtros
    function aplicarFiltros() {
        retornadosFiltrados = retornados.filter(retornado => {
            // Filtro por modelo
            if (filtroModelo.value && retornado.modelo !== filtroModelo.value) {
                return false;
            }
            
            // Filtro por cliente
            if (filtroCliente.value && !retornado.nomeCliente.toLowerCase().includes(filtroCliente.value.toLowerCase())) {
                return false;
            }
            
            // Filtro por filial
            if (filtroFilial.value && retornado.filial !== filtroFilial.value) {
                return false;
            }
            
            // Filtro por status
            if (filtroStatus.value && retornado.status !== filtroStatus.value) {
                return false;
            }
            
            // Filtro por data
            const dataRegistro = new Date(retornado.dataRegistro);
            if (dataInicio.value) {
                const inicio = new Date(dataInicio.value);
                if (dataRegistro < inicio) {
                    return false;
                }
            }
            if (dataFim.value) {
                const fim = new Date(dataFim.value);
                fim.setHours(23, 59, 59, 999);
                if (dataRegistro > fim) {
                    return false;
                }
            }
            
            // Filtro por valor
            if (valorMinimo.value && retornado.valorRecuperado < parseFloat(valorMinimo.value)) {
                return false;
            }
            if (valorMaximo.value && retornado.valorRecuperado > parseFloat(valorMaximo.value)) {
                return false;
            }
            
            return true;
        });
        
        // Aplicar ordenação
        aplicarOrdenacao();
        
        // Resetar paginação
        paginaAtual = 1;
        
        // Atualizar interface
        atualizarEstatisticas();
        atualizarTabela();
        
        mostrarMensagem(`Filtros aplicados. ${retornadosFiltrados.length} registros encontrados.`, 'success');
    }
    
    // Função para limpar filtros
    function limparFiltros() {
        filtroModelo.value = '';
        filtroCliente.value = '';
        filtroFilial.value = '';
        filtroStatus.value = '';
        dataInicio.value = '';
        dataFim.value = '';
        valorMinimo.value = '';
        valorMaximo.value = '';
        
        // Mostrar todos os registros
        retornadosFiltrados = [...retornados];
        aplicarOrdenacao();
        paginaAtual = 1;
        
        atualizarEstatisticas();
        atualizarTabela();
        
        mostrarMensagem('Filtros limpos. Mostrando todos os registros.', 'success');
    }
    
    // Função para aplicar ordenação
    function aplicarOrdenacao() {
        retornadosFiltrados.sort((a, b) => {
            let valorA = a[ordenacao.campo];
            let valorB = b[ordenacao.campo];
            
            // Tratamento especial para datas
            if (ordenacao.campo === 'dataRegistro') {
                valorA = new Date(valorA);
                valorB = new Date(valorB);
            }
            
            // Tratamento especial para valores numéricos
            if (ordenacao.campo === 'valorRecuperado') {
                valorA = parseFloat(valorA);
                valorB = parseFloat(valorB);
            }
            
            if (valorA < valorB) {
                return ordenacao.direcao === 'asc' ? -1 : 1;
            }
            if (valorA > valorB) {
                return ordenacao.direcao === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
    
    // Função para atualizar estatísticas
    function atualizarEstatisticas() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        
        const stats = {
            total: retornadosFiltrados.length,
            estoque: retornadosFiltrados.filter(r => r.status === 'Estoque').length,
            valorTotal: retornadosFiltrados.reduce((sum, r) => sum + r.valorRecuperado, 0),
            hoje: retornadosFiltrados.filter(r => {
                const dataRegistro = new Date(r.dataRegistro);
                return dataRegistro >= hoje && dataRegistro < amanha;
            }).length
        };
        
        totalRetornados.textContent = stats.total;
        totalEstoque.textContent = stats.estoque;
        valorTotal.textContent = `R$ ${stats.valorTotal.toFixed(2)}`;
        retornadosHoje.textContent = stats.hoje;
    }
    
    // Função para atualizar tabela
    function atualizarTabela() {
        const tbody = document.getElementById('tabelaConsulta');
        tbody.innerHTML = '';
        
        // Calcular paginação
        totalPaginas = Math.ceil(retornadosFiltrados.length / itensPorPagina);
        if (totalPaginas === 0) totalPaginas = 1;
        
        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
        }
        
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = Math.min(inicio + itensPorPagina, retornadosFiltrados.length);
        
        for (let i = inicio; i < fim; i++) {
            const retornado = retornadosFiltrados[i];
            const tr = document.createElement('tr');
            
            // Definir cor do status
            let statusClass = '';
            let statusColor = '';
            switch(retornado.status) {
                case 'Estoque':
                    statusClass = 'bg-success';
                    statusColor = 'green';
                    break;
                case 'Garantia':
                    statusClass = 'bg-danger';
                    statusColor = 'red';
                    break;
                case 'Uso Interno':
                    statusClass = 'bg-primary';
                    statusColor = 'blue';
                    break;
                case 'Descarte':
                    statusClass = 'text-white';
                    statusColor = '#8B4513';
                    break;
            }
            
            tr.innerHTML = `
                <td>${retornado.modelo}</td>
                <td>${retornado.nomeCliente}</td>
                <td>${retornado.filial}</td>
                <td>
                    <span class="badge ${statusClass}" style="background-color: ${statusColor};">
                        ${retornado.status}
                    </span>
                </td>
                <td>R$ ${retornado.valorRecuperado.toFixed(2)}</td>
                <td>${new Date(retornado.dataRegistro).toLocaleDateString('pt-BR')}</td>
                <td>${retornado.percentualGramatura ? retornado.percentualGramatura.toFixed(2) + '%' : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="verDetalhes(${retornado.id})" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        }
        
        atualizarControlesPaginacao();
    }
    
    // Função para atualizar controles de paginação
    function atualizarControlesPaginacao() {
        const paginacaoContainer = document.getElementById('paginacao');
        if (!paginacaoContainer) return;
        
        paginacaoContainer.innerHTML = '';
        
        if (retornadosFiltrados.length === 0) return;
        
        const infoEl = document.createElement('div');
        infoEl.className = 'pagination-info';
        const inicio = ((paginaAtual - 1) * itensPorPagina) + 1;
        const fim = Math.min(paginaAtual * itensPorPagina, retornadosFiltrados.length);
        infoEl.textContent = `Mostrando ${inicio}-${fim} de ${retornadosFiltrados.length} registros`;
        paginacaoContainer.appendChild(infoEl);
        
        const navEl = document.createElement('div');
        navEl.className = 'pagination-nav';
        
        // Botão anterior
        const btnAnterior = document.createElement('button');
        btnAnterior.className = 'btn btn-sm btn-outline-primary';
        btnAnterior.innerHTML = '<i class="fas fa-chevron-left"></i>';
        btnAnterior.disabled = paginaAtual === 1;
        btnAnterior.addEventListener('click', () => {
            if (paginaAtual > 1) {
                paginaAtual--;
                atualizarTabela();
            }
        });
        navEl.appendChild(btnAnterior);
        
        // Números das páginas
        for (let i = 1; i <= totalPaginas; i++) {
            const btnPagina = document.createElement('button');
            btnPagina.className = `btn btn-sm ${i === paginaAtual ? 'btn-primary' : 'btn-outline-primary'}`;
            btnPagina.textContent = i;
            btnPagina.addEventListener('click', () => {
                paginaAtual = i;
                atualizarTabela();
            });
            navEl.appendChild(btnPagina);
        }
        
        // Botão próximo
        const btnProximo = document.createElement('button');
        btnProximo.className = 'btn btn-sm btn-outline-primary';
        btnProximo.innerHTML = '<i class="fas fa-chevron-right"></i>';
        btnProximo.disabled = paginaAtual === totalPaginas;
        btnProximo.addEventListener('click', () => {
            if (paginaAtual < totalPaginas) {
                paginaAtual++;
                atualizarTabela();
            }
        });
        navEl.appendChild(btnProximo);
        
        paginacaoContainer.appendChild(navEl);
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
    
    // Função para exportar consulta
    function exportarConsulta() {
        // Simular exportação
        mostrarMensagem('Consulta exportada com sucesso! (Simulação)', 'success');
    }
    
    // Função para gerar relatório
    function gerarRelatorio() {
        // Preparar dados para os gráficos
        const dadosStatus = {};
        const dadosValores = {};
        const dadosModelos = {};
        const dadosFiliais = {};
        
        retornadosFiltrados.forEach(retornado => {
            // Status
            dadosStatus[retornado.status] = (dadosStatus[retornado.status] || 0) + 1;
            
            // Valores por status
            if (retornado.valorRecuperado > 0) {
                dadosValores[retornado.status] = (dadosValores[retornado.status] || 0) + retornado.valorRecuperado;
            }
            
            // Modelos
            dadosModelos[retornado.modelo] = (dadosModelos[retornado.modelo] || 0) + 1;
            
            // Filiais
            dadosFiliais[retornado.filial] = (dadosFiliais[retornado.filial] || 0) + 1;
        });
        
        // Mostrar modal
        modalRelatorio.show();
        
        // Aguardar modal abrir para criar gráficos
        setTimeout(() => {
            criarGraficos(dadosStatus, dadosValores, dadosModelos, dadosFiliais);
        }, 300);
    }
    
    // Função para criar gráficos
    function criarGraficos(dadosStatus, dadosValores, dadosModelos, dadosFiliais) {
        // Gráfico de Status
        const ctxStatus = document.getElementById('chartStatus');
        if (ctxStatus) {
            new Chart(ctxStatus, {
                type: 'pie',
                data: {
                    labels: Object.keys(dadosStatus),
                    datasets: [{
                        data: Object.values(dadosStatus),
                        backgroundColor: ['#28a745', '#dc3545', '#007bff', '#8B4513']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Distribuição por Status'
                        }
                    }
                }
            });
        }
        
        // Gráfico de Valores
        const ctxValores = document.getElementById('chartValores');
        if (ctxValores) {
            new Chart(ctxValores, {
                type: 'bar',
                data: {
                    labels: Object.keys(dadosValores),
                    datasets: [{
                        label: 'Valor Recuperado (R$)',
                        data: Object.values(dadosValores),
                        backgroundColor: '#ffc107'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Valores Recuperados por Status'
                        }
                    }
                }
            });
        }
        
        // Gráfico de Modelos (Top 10)
        const ctxModelos = document.getElementById('chartModelos');
        if (ctxModelos) {
            const topModelos = Object.entries(dadosModelos)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10);
            
            new Chart(ctxModelos, {
                type: 'bar',
                data: {
                    labels: topModelos.map(([modelo]) => modelo),
                    datasets: [{
                        label: 'Quantidade',
                        data: topModelos.map(([, quantidade]) => quantidade),
                        backgroundColor: '#17a2b8'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Top 10 Modelos Retornados'
                        }
                    }
                }
            });
        }
        
        // Gráfico de Filiais
        const ctxFiliais = document.getElementById('chartFiliais');
        if (ctxFiliais) {
            new Chart(ctxFiliais, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(dadosFiliais),
                    datasets: [{
                        data: Object.values(dadosFiliais),
                        backgroundColor: ['#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6610f2']
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Distribuição por Filial'
                        }
                    }
                }
            });
        }
    }
    
    // Função para exportar relatório
    function exportarRelatorio() {
        // Simular exportação do relatório
        mostrarMensagem('Relatório exportado com sucesso! (Simulação)', 'success');
    }
    
    // Funções globais
    window.ordenarPor = function(campo) {
        if (ordenacao.campo === campo) {
            ordenacao.direcao = ordenacao.direcao === 'asc' ? 'desc' : 'asc';
        } else {
            ordenacao.campo = campo;
            ordenacao.direcao = 'asc';
        }
        
        aplicarOrdenacao();
        atualizarTabela();
    };
    
    window.verDetalhes = function(id) {
        const retornado = retornados.find(r => r.id === id);
        if (retornado) {
            const modalBody = document.getElementById('modalDetalhesBody');
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>Informações Básicas</h6>
                        <table class="table table-sm">
                            <tr><td><strong>Modelo:</strong></td><td>${retornado.modelo}</td></tr>
                            <tr><td><strong>ID Cliente:</strong></td><td>${retornado.idCliente}</td></tr>
                            <tr><td><strong>Nome Cliente:</strong></td><td>${retornado.nomeCliente}</td></tr>
                            <tr><td><strong>Filial:</strong></td><td>${retornado.filial}</td></tr>
                            <tr><td><strong>Status:</strong></td><td>
                                <span class="badge ${retornado.status === 'Estoque' ? 'bg-success' : 
                                    retornado.status === 'Garantia' ? 'bg-danger' : 
                                    retornado.status === 'Uso Interno' ? 'bg-primary' : 'bg-secondary'}" 
                                    style="${retornado.status === 'Descarte' ? 'background-color: #8B4513 !important;' : ''}">
                                    ${retornado.status}
                                </span>
                            </td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6>Informações Técnicas</h6>
                        <table class="table table-sm">
                            <tr><td><strong>Peso Retornado:</strong></td><td>${retornado.pesoRetornado.toFixed(2)} g</td></tr>
                            <tr><td><strong>Gramatura Restante:</strong></td><td>${retornado.gramaturaRestante.toFixed(2)} g</td></tr>
                            <tr><td><strong>% Gramatura:</strong></td><td>${retornado.percentualGramatura.toFixed(2)}%</td></tr>
                            <tr><td><strong>Valor Recuperado:</strong></td><td>R$ ${retornado.valorRecuperado.toFixed(2)}</td></tr>
                            <tr><td><strong>Data Registro:</strong></td><td>${new Date(retornado.dataRegistro).toLocaleString('pt-BR')}</td></tr>
                        </table>
                    </div>
                </div>
            `;
            
            modalDetalhes.show();
        }
    };
});