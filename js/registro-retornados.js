// Registro de Toners Retornados - Funcionalidades

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('formRegistroRetornado');
    const modelo = document.getElementById('modelo');
    const idCliente = document.getElementById('idCliente');
    const nomeCliente = document.getElementById('nomeCliente');
    const filial = document.getElementById('filial');
    const pesoRetornado = document.getElementById('pesoRetornado');
    const gramaturaRestante = document.getElementById('gramaturaRestante');
    const percentualGramatura = document.getElementById('percentualGramatura');
    
    // Botões
    const btnBuscarCliente = document.getElementById('btnBuscarCliente');
    const btnLimpar = document.getElementById('btnLimpar');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnImportar = document.getElementById('btnImportar');
    const btnExportar = document.getElementById('btnExportar');
    const buscarRetornado = document.getElementById('buscarRetornado');
    
    // Botões de destino
    const btnEstoque = document.getElementById('btnEstoque');
    const btnGarantia = document.getElementById('btnGarantia');
    const btnUsoInterno = document.getElementById('btnUsoInterno');
    const btnDescarte = document.getElementById('btnDescarte');
    
    // Modais
    const modalClienteNaoEncontrado = new bootstrap.Modal(document.getElementById('modalClienteNaoEncontrado'));
    const modalEdicao = new bootstrap.Modal(document.getElementById('modalEdicao'));
    const modalExclusao = new bootstrap.Modal(document.getElementById('modalExclusao'));
    const modalImportacao = new bootstrap.Modal(document.getElementById('modalImportacao'));
    const modalExportacao = new bootstrap.Modal(document.getElementById('modalExportacao'));
    
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
    let toners = [];
    let clientes = [];
    let filiais = [];
    let tonerSelecionado = null;
    let destinoSelecionado = null;
    let editingId = null;
    let deletingId = null;
    
    // Carregar dados do localStorage
    carregarDados();
    
    // Event listeners
    modelo.addEventListener('change', selecionarToner);
    idCliente.addEventListener('blur', buscarCliente);
    btnBuscarCliente.addEventListener('click', buscarCliente);
    pesoRetornado.addEventListener('input', calcularGramatura);
    
    btnEstoque.addEventListener('click', () => selecionarDestino('Estoque'));
    btnGarantia.addEventListener('click', () => selecionarDestino('Garantia'));
    btnUsoInterno.addEventListener('click', () => selecionarDestino('Uso Interno'));
    btnDescarte.addEventListener('click', () => selecionarDestino('Descarte'));
    
    btnLimpar.addEventListener('click', limparFormulario);
    btnSalvar.addEventListener('click', salvarRetornado);
    btnImportar.addEventListener('click', () => modalImportacao.show());
    btnExportar.addEventListener('click', () => modalExportacao.show());
    buscarRetornado.addEventListener('input', filtrarTabela);
    closeMessage.addEventListener('click', fecharMensagem);
    
    // Event listeners dos modais
    document.getElementById('btnConfirmarCliente').addEventListener('click', confirmarClienteModal);
    document.getElementById('btnSalvarEdicao').addEventListener('click', salvarEdicao);
    document.getElementById('btnConfirmarExclusao').addEventListener('click', confirmarExclusao);
    document.getElementById('btnProcessarImportacao').addEventListener('click', processarImportacao);
    document.getElementById('btnProcessarExportacao').addEventListener('click', processarExportacao);
    document.getElementById('btnBaixarModelo').addEventListener('click', baixarModelo);
    
    // Função para carregar dados do localStorage
    function carregarDados() {
        // Carregar toners
        const tonersArmazenados = localStorage.getItem('toners');
        if (tonersArmazenados) {
            toners = JSON.parse(tonersArmazenados);
        }
        
        // Carregar clientes
        const clientesArmazenados = localStorage.getItem('clientes');
        if (clientesArmazenados) {
            clientes = JSON.parse(clientesArmazenados);
        }
        
        // Carregar filiais
        const filiaisArmazenadas = localStorage.getItem('filiais');
        if (filiaisArmazenadas) {
            filiais = JSON.parse(filiaisArmazenadas);
        }
        
        // Carregar retornados
        const retornadosArmazenados = localStorage.getItem('tonersRetornados');
        if (retornadosArmazenados) {
            retornados = JSON.parse(retornadosArmazenados);
        } else {
            // Dados de exemplo
            retornados = [
                {
                    id: 1,
                    modelo: 'HP CF258A',
                    idCliente: 'CLI001',
                    nomeCliente: 'Empresa ABC Ltda',
                    filial: 'Matriz São Paulo',
                    pesoRetornado: 750.50,
                    gramaturaRestante: 300.30,
                    percentualGramatura: 60.06,
                    status: 'Estoque',
                    valorRecuperado: 19.22,
                    dataRegistro: new Date().toISOString()
                }
            ];
            salvarNoLocalStorage();
        }
        
        // Preencher selects
        preencherSelects();
        atualizarTabela();
    }
    
    // Função para preencher os selects
    function preencherSelects() {
        // Preencher select de modelos
        modelo.innerHTML = '<option value="" selected disabled>Selecione o modelo</option>';
        toners.forEach(toner => {
            const option = document.createElement('option');
            option.value = toner.modelo;
            option.textContent = toner.modelo;
            modelo.appendChild(option);
        });
        
        // Preencher select de filiais
        const selectsFiliais = [filial, document.getElementById('editFilial')];
        selectsFiliais.forEach(select => {
            if (select) {
                select.innerHTML = '<option value="" selected disabled>Selecione a filial</option>';
                filiais.forEach(f => {
                    const option = document.createElement('option');
                    option.value = f.nomeFilial;
                    option.textContent = f.nomeFilial;
                    select.appendChild(option);
                });
            }
        });
        
        // Preencher select de modelos no modal de edição
        const editModelo = document.getElementById('editModelo');
        if (editModelo) {
            editModelo.innerHTML = '<option value="" selected disabled>Selecione o modelo</option>';
            toners.forEach(toner => {
                const option = document.createElement('option');
                option.value = toner.modelo;
                option.textContent = toner.modelo;
                editModelo.appendChild(option);
            });
        }
    }
    
    // Função para selecionar toner e mostrar informações
    function selecionarToner() {
        const modeloSelecionado = modelo.value;
        tonerSelecionado = toners.find(t => t.modelo === modeloSelecionado);
        
        if (tonerSelecionado) {
            // Mostrar informações do toner
            document.getElementById('infoTonerPesoVazio').textContent = tonerSelecionado.pesoVazio.toFixed(2);
            document.getElementById('infoTonerPesoCheio').textContent = tonerSelecionado.pesoCheio.toFixed(2);
            document.getElementById('infoTonerCapacidade').textContent = tonerSelecionado.capacidadeFolhas;
            document.getElementById('infoTonerCustoPagina').textContent = tonerSelecionado.custoPagina.toFixed(4);
            
            document.getElementById('infoToner').style.display = 'block';
            
            // Recalcular gramatura se já houver peso
            if (pesoRetornado.value) {
                calcularGramatura();
            }
        } else {
            document.getElementById('infoToner').style.display = 'none';
            document.getElementById('classificacaoToner').style.display = 'none';
            document.getElementById('botoesDestino').style.display = 'none';
        }
    }
    
    // Função para buscar cliente
    function buscarCliente() {
        const id = idCliente.value.trim();
        if (!id) return;
        
        const cliente = clientes.find(c => c.id === id);
        
        if (cliente) {
            nomeCliente.value = cliente.nome;
        } else {
            // Cliente não encontrado - abrir modal
            document.getElementById('idClienteNaoEncontrado').textContent = id;
            document.getElementById('nomeClienteModal').value = '';
            modalClienteNaoEncontrado.show();
        }
    }
    
    // Função para confirmar cliente no modal
    function confirmarClienteModal() {
        const nomeModal = document.getElementById('nomeClienteModal').value.trim();
        const idClienteModal = idCliente.value.trim();
        
        if (nomeModal && idClienteModal) {
            // Adicionar novo cliente ao sistema
            const novoCliente = {
                id: idClienteModal,
                nome: nomeModal
            };
            
            // Adicionar à lista local
            clientes.push(novoCliente);
            
            // Salvar no localStorage de clientes
            localStorage.setItem('clientes', JSON.stringify(clientes));
            
            // Preencher campo nome
            nomeCliente.value = nomeModal;
            
            // Fechar modal
            modalClienteNaoEncontrado.hide();
            
            mostrarMensagem('Cliente cadastrado com sucesso no sistema!', 'success');
        }
    }
    
    // Função para calcular gramatura
    function calcularGramatura() {
        if (!tonerSelecionado || !pesoRetornado.value) return;
        
        const peso = parseFloat(pesoRetornado.value);
        const pesoVazio = tonerSelecionado.pesoVazio;
        const gramaturaTotal = tonerSelecionado.gramaturaToner;
        
        if (peso <= pesoVazio) {
            gramaturaRestante.value = '0.00';
            percentualGramatura.value = '0.00';
        } else {
            const gramRestante = peso - pesoVazio;
            const percentual = (gramRestante / gramaturaTotal) * 100;
            
            gramaturaRestante.value = gramRestante.toFixed(2);
            percentualGramatura.value = percentual.toFixed(2);
            
            // Classificar toner automaticamente
            classificarToner(percentual);
        }
    }
    
    // Função para classificar toner baseado na % de gramatura
    function classificarToner(percentual) {
        // Obter parâmetros de classificação
        const parametros = window.obterParametrosRetornados ? window.obterParametrosRetornados() : {
            descarte: { min: 0, max: 5 },
            uso_interno: { min: 6, max: 40 },
            estoque: { min: 41, max: 80 },
            novo: { min: 81, max: 100 }
        };
        
        let classificacao;
        let alertClass = 'alert-info';
        
        if (percentual >= parametros.descarte.min && percentual <= parametros.descarte.max) {
            classificacao = {
                acao: 'Descarte o toner',
                valorRecuperado: 0,
                recomendacao: 'Descarte'
            };
            alertClass = 'alert-danger';
        } else if (percentual >= parametros.uso_interno.min && percentual <= parametros.uso_interno.max) {
            classificacao = {
                acao: 'Teste o toner. Se bom → Uso Interno. Se ruim → Descarte',
                valorRecuperado: 0,
                recomendacao: 'Uso Interno'
            };
            alertClass = 'alert-primary';
        } else if (percentual >= parametros.estoque.min && percentual <= parametros.estoque.max) {
            const folhasRecuperadas = (parseFloat(gramaturaRestante.value) / tonerSelecionado.gramaturaToner) * tonerSelecionado.capacidadeFolhas;
            const valor = folhasRecuperadas * tonerSelecionado.custoPagina;
            
            classificacao = {
                acao: 'Teste o toner. Se bom → Estoque (com % na caixa). Se ruim → Garantia',
                valorRecuperado: valor,
                recomendacao: 'Estoque'
            };
            alertClass = 'alert-success';
        } else if (percentual >= parametros.novo.min && percentual <= parametros.novo.max) {
            const folhasRecuperadas = (parseFloat(gramaturaRestante.value) / tonerSelecionado.gramaturaToner) * tonerSelecionado.capacidadeFolhas;
            const valor = folhasRecuperadas * tonerSelecionado.custoPagina;
            
            classificacao = {
                acao: 'Teste o toner. Se bom → Estoque (como novo). Se ruim → Garantia',
                valorRecuperado: valor,
                recomendacao: 'Estoque'
            };
            alertClass = 'alert-success';
        } else {
            classificacao = {
                acao: 'Percentual fora das faixas configuradas',
                valorRecuperado: 0,
                recomendacao: 'Indefinido'
            };
            alertClass = 'alert-warning';
        }
        
        // Mostrar classificação
        const alertClassificacao = document.getElementById('alertClassificacao');
        alertClassificacao.className = `alert ${alertClass}`;
        
        document.getElementById('acaoRecomendada').textContent = classificacao.acao;
        document.getElementById('valorRecuperado').textContent = classificacao.valorRecuperado.toFixed(2);
        
        document.getElementById('classificacaoToner').style.display = 'block';
        document.getElementById('botoesDestino').style.display = 'block';
        
        // Destacar botão recomendado
        resetarBotoesDestino();
        if (classificacao.recomendacao === 'Descarte') {
            btnDescarte.classList.add('btn-outline-dark');
        } else if (classificacao.recomendacao === 'Uso Interno') {
            btnUsoInterno.classList.add('btn-outline-primary');
        } else if (classificacao.recomendacao === 'Estoque') {
            btnEstoque.classList.add('btn-outline-success');
        }
    }
    
    // Função para resetar botões de destino
    function resetarBotoesDestino() {
        [btnEstoque, btnGarantia, btnUsoInterno, btnDescarte].forEach(btn => {
            btn.classList.remove('btn-outline-success', 'btn-outline-danger', 'btn-outline-primary', 'btn-outline-dark');
        });
        destinoSelecionado = null;
        btnSalvar.disabled = true;
    }
    
    // Função para selecionar destino
    function selecionarDestino(destino) {
        destinoSelecionado = destino;
        
        // Resetar todos os botões
        resetarBotoesDestino();
        
        // Destacar botão selecionado
        switch(destino) {
            case 'Estoque':
                btnEstoque.classList.add('btn-outline-success');
                break;
            case 'Garantia':
                btnGarantia.classList.add('btn-outline-danger');
                break;
            case 'Uso Interno':
                btnUsoInterno.classList.add('btn-outline-primary');
                break;
            case 'Descarte':
                btnDescarte.classList.add('btn-outline-dark');
                break;
        }
        
        btnSalvar.disabled = false;
    }
    
    // Função para limpar formulário
    function limparFormulario() {
        form.reset();
        nomeCliente.value = '';
        gramaturaRestante.value = '';
        percentualGramatura.value = '';
        
        document.getElementById('infoToner').style.display = 'none';
        document.getElementById('classificacaoToner').style.display = 'none';
        document.getElementById('botoesDestino').style.display = 'none';
        
        tonerSelecionado = null;
        destinoSelecionado = null;
        btnSalvar.disabled = true;
        resetarBotoesDestino();
        
        form.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
    }
    
    // Função para salvar retornado
    function salvarRetornado() {
        if (!validarFormulario()) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        if (!destinoSelecionado) {
            mostrarMensagem('Por favor, selecione o destino do toner.', 'error');
            return;
        }
        
        // Calcular valor recuperado baseado no destino
        let valorRecuperado = 0;
        if (destinoSelecionado === 'Estoque') {
            const folhasRecuperadas = (parseFloat(gramaturaRestante.value) / tonerSelecionado.gramaturaToner) * tonerSelecionado.capacidadeFolhas;
            valorRecuperado = folhasRecuperadas * tonerSelecionado.custoPagina;
        }
        
        const retornado = {
            id: Date.now(),
            modelo: modelo.value,
            idCliente: idCliente.value.trim(),
            nomeCliente: nomeCliente.value.trim(),
            filial: filial.value,
            pesoRetornado: parseFloat(pesoRetornado.value),
            gramaturaRestante: parseFloat(gramaturaRestante.value),
            percentualGramatura: parseFloat(percentualGramatura.value),
            status: destinoSelecionado,
            valorRecuperado: valorRecuperado,
            dataRegistro: new Date().toISOString()
        };
        
        retornados.push(retornado);
        salvarNoLocalStorage();
        atualizarTabela();
        limparFormulario();
        
        mostrarMensagem('Toner retornado registrado com sucesso!', 'success');
    }
    
    // Função para validar formulário
    function validarFormulario() {
        let valido = true;
        const campos = [modelo, idCliente, nomeCliente, filial, pesoRetornado];
        
        campos.forEach(campo => {
            if (!campo.value.trim()) {
                campo.classList.add('is-invalid');
                valido = false;
            } else {
                campo.classList.remove('is-invalid');
            }
        });
        
        return valido;
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
    
    // Função para atualizar tabela
    function atualizarTabela() {
        const tbody = document.getElementById('tabelaRetornados');
        tbody.innerHTML = '';
        
        let retornadosFiltrados = aplicarFiltros();
        
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
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="editarRetornado(${retornado.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="excluirRetornado(${retornado.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        }
        
        atualizarControlesPaginacao(retornadosFiltrados.length);
    }
    
    // Função para aplicar filtros
    function aplicarFiltros() {
        let filtrados = [...retornados];
        
        // Filtro de busca
        const termo = buscarRetornado.value.toLowerCase();
        if (termo) {
            filtrados = filtrados.filter(r => 
                r.modelo.toLowerCase().includes(termo) ||
                r.nomeCliente.toLowerCase().includes(termo) ||
                r.filial.toLowerCase().includes(termo) ||
                r.status.toLowerCase().includes(termo)
            );
        }
        
        return filtrados;
    }
    
    // Função para atualizar controles de paginação
    function atualizarControlesPaginacao(totalItens) {
        const paginacaoContainer = document.getElementById('paginacao');
        if (!paginacaoContainer) return;
        
        paginacaoContainer.innerHTML = '';
        
        if (totalItens === 0) return;
        
        const infoEl = document.createElement('div');
        infoEl.className = 'pagination-info';
        const inicio = ((paginaAtual - 1) * itensPorPagina) + 1;
        const fim = Math.min(paginaAtual * itensPorPagina, totalItens);
        infoEl.textContent = `Mostrando ${inicio}-${fim} de ${totalItens} retornados`;
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
    
    // Função para filtrar tabela
    function filtrarTabela() {
        paginaAtual = 1;
        atualizarTabela();
    }
    
    // Função para salvar no localStorage
    function salvarNoLocalStorage() {
        localStorage.setItem('tonersRetornados', JSON.stringify(retornados));
    }
    
    // Função para salvar edição
    function salvarEdicao() {
        const editModelo = document.getElementById('editModelo');
        const editIdCliente = document.getElementById('editIdCliente');
        const editNomeCliente = document.getElementById('editNomeCliente');
        const editFilial = document.getElementById('editFilial');
        const editPesoRetornado = document.getElementById('editPesoRetornado');
        const editStatus = document.getElementById('editStatus');
        const editValorRecuperado = document.getElementById('editValorRecuperado');
        
        if (!editModelo.value || !editIdCliente.value.trim() || !editNomeCliente.value.trim() || 
            !editFilial.value || !editPesoRetornado.value || !editStatus.value) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        const retornado = retornados.find(r => r.id === editingId);
        if (retornado) {
            retornado.modelo = editModelo.value;
            retornado.idCliente = editIdCliente.value.trim();
            retornado.nomeCliente = editNomeCliente.value.trim();
            retornado.filial = editFilial.value;
            retornado.pesoRetornado = parseFloat(editPesoRetornado.value);
            retornado.status = editStatus.value;
            retornado.valorRecuperado = parseFloat(editValorRecuperado.value) || 0;
            
            salvarNoLocalStorage();
            atualizarTabela();
            modalEdicao.hide();
            mostrarMensagem('Retornado atualizado com sucesso!', 'success');
        }
    }
    
    // Função para confirmar exclusão
    function confirmarExclusao() {
        retornados = retornados.filter(r => r.id !== deletingId);
        salvarNoLocalStorage();
        atualizarTabela();
        modalExclusao.hide();
        mostrarMensagem('Retornado excluído com sucesso!', 'success');
    }
    
    // Função para processar importação
    function processarImportacao() {
        const arquivo = document.getElementById('arquivoImportacao').files[0];
        if (!arquivo) {
            mostrarMensagem('Selecione um arquivo para importar.', 'error');
            return;
        }
        
        // Simular processamento
        mostrarMensagem('Importação processada com sucesso! (Simulação)', 'success');
        modalImportacao.hide();
    }
    
    // Função para processar exportação
    function processarExportacao() {
        const dataInicio = document.getElementById('dataInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        const exportarTodos = document.getElementById('exportarTodos').checked;
        
        // Simular exportação
        mostrarMensagem('Arquivo Excel gerado com sucesso! (Simulação)', 'success');
        modalExportacao.hide();
    }
    
    // Função para baixar modelo
    function baixarModelo() {
        // Simular download do modelo
        mostrarMensagem('Modelo de planilha baixado! (Simulação)', 'success');
    }
    
    // Funções globais
    window.editarRetornado = function(id) {
        const retornado = retornados.find(r => r.id === id);
        if (retornado) {
            editingId = id;
            
            // Preencher campos do modal
            document.getElementById('editModelo').value = retornado.modelo;
            document.getElementById('editIdCliente').value = retornado.idCliente;
            document.getElementById('editNomeCliente').value = retornado.nomeCliente;
            document.getElementById('editFilial').value = retornado.filial;
            document.getElementById('editPesoRetornado').value = retornado.pesoRetornado;
            document.getElementById('editStatus').value = retornado.status;
            document.getElementById('editValorRecuperado').value = retornado.valorRecuperado;
            
            modalEdicao.show();
        }
    };
    
    window.excluirRetornado = function(id) {
        deletingId = id;
        modalExclusao.show();
    };
});