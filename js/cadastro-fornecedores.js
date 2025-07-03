// Cadastro de Fornecedores - Funcionalidades

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('formCadastroFornecedor');
    const nome = document.getElementById('nome');
    const linkRMA = document.getElementById('linkRMA');
    const contato = document.getElementById('contato');
    const observacao = document.getElementById('observacao');
    
    // Botões
    const btnLimpar = document.getElementById('btnLimpar');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnImportar = document.getElementById('btnImportar');
    const btnExportar = document.getElementById('btnExportar');
    const buscarFornecedor = document.getElementById('buscarFornecedor');
    
    // Filtros
    const filtroColuna = document.getElementById('filtroColuna');
    const filtroValor = document.getElementById('filtroValor');
    
    // Modais
    const modalEdicao = new bootstrap.Modal(document.getElementById('modalEdicao'));
    const modalExclusao = new bootstrap.Modal(document.getElementById('modalExclusao'));
    const modalImportacao = new bootstrap.Modal(document.getElementById('modalImportacao'));
    const modalExportacao = new bootstrap.Modal(document.getElementById('modalExportacao'));
    
    // Modal de mensagens
    const messageModal = document.getElementById('messageModal');
    const messageText = document.getElementById('messageText');
    const closeMessage = document.getElementById('closeMessage');
    
    // Paginação
    const itensPorPagina = 10;
    let paginaAtual = 1;
    let totalPaginas = 1;
    
    // Array para armazenar os fornecedores
    let fornecedores = [];
    let editingId = null;
    let deletingId = null;
    
    // Carregar dados do localStorage
    carregarDoLocalStorage();
    
    // Event listeners
    btnLimpar.addEventListener('click', limparFormulario);
    btnSalvar.addEventListener('click', salvarFornecedor);
    btnImportar.addEventListener('click', () => modalImportacao.show());
    btnExportar.addEventListener('click', () => modalExportacao.show());
    buscarFornecedor.addEventListener('input', filtrarTabela);
    filtroColuna.addEventListener('change', atualizarFiltroValor);
    filtroValor.addEventListener('change', filtrarTabela);
    closeMessage.addEventListener('click', fecharMensagem);
    
    // Event listeners dos modais
    document.getElementById('btnSalvarEdicao').addEventListener('click', salvarEdicao);
    document.getElementById('btnConfirmarExclusao').addEventListener('click', confirmarExclusao);
    document.getElementById('btnProcessarImportacao').addEventListener('click', processarImportacao);
    document.getElementById('btnProcessarExportacao').addEventListener('click', processarExportacao);
    document.getElementById('btnBaixarModelo').addEventListener('click', baixarModelo);
    
    // Função para limpar o formulário
    function limparFormulario() {
        form.reset();
        editingId = null;
        
        form.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
    }
    
    // Função para salvar fornecedor
    function salvarFornecedor() {
        if (!validarFormulario()) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        const fornecedor = {
            id: editingId !== null ? editingId : Date.now(),
            nome: nome.value.trim(),
            linkRMA: linkRMA.value.trim(),
            contato: contato.value.trim(),
            observacao: observacao.value.trim(),
            dataCadastro: editingId !== null ? 
                fornecedores.find(f => f.id === editingId).dataCadastro : 
                new Date().toISOString()
        };
        
        if (editingId !== null) {
            fornecedores = fornecedores.map(f => f.id === editingId ? fornecedor : f);
            mostrarMensagem('Fornecedor atualizado com sucesso!', 'success');
        } else {
            fornecedores.push(fornecedor);
            mostrarMensagem('Fornecedor cadastrado com sucesso!', 'success');
        }
        
        salvarNoLocalStorage();
        atualizarTabela();
        limparFormulario();
    }
    
    // Função para validar formulário
    function validarFormulario() {
        let valido = true;
        
        if (!nome.value.trim()) {
            nome.classList.add('is-invalid');
            valido = false;
        } else {
            nome.classList.remove('is-invalid');
        }
        
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
        const tbody = document.getElementById('tabelaFornecedores');
        tbody.innerHTML = '';
        
        let fornecedoresFiltrados = aplicarFiltros();
        
        // Calcular paginação
        totalPaginas = Math.ceil(fornecedoresFiltrados.length / itensPorPagina);
        if (totalPaginas === 0) totalPaginas = 1;
        
        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
        }
        
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = Math.min(inicio + itensPorPagina, fornecedoresFiltrados.length);
        
        for (let i = inicio; i < fim; i++) {
            const fornecedor = fornecedoresFiltrados[i];
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${fornecedor.nome}</td>
                <td>${fornecedor.linkRMA ? `<a href="${fornecedor.linkRMA}" target="_blank">${fornecedor.linkRMA}</a>` : '-'}</td>
                <td>${fornecedor.contato || '-'}</td>
                <td>${fornecedor.observacao || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="editarFornecedor(${fornecedor.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="excluirFornecedor(${fornecedor.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        }
        
        atualizarControlesPaginacao(fornecedoresFiltrados.length);
    }
    
    // Função para aplicar filtros
    function aplicarFiltros() {
        let filtrados = [...fornecedores];
        
        // Filtro de busca
        const termo = buscarFornecedor.value.toLowerCase();
        if (termo) {
            filtrados = filtrados.filter(f => 
                f.nome.toLowerCase().includes(termo) ||
                f.contato.toLowerCase().includes(termo) ||
                f.observacao.toLowerCase().includes(termo)
            );
        }
        
        // Filtro por coluna
        if (filtroColuna.value && filtroValor.value) {
            filtrados = filtrados.filter(f => 
                f[filtroColuna.value].toLowerCase().includes(filtroValor.value.toLowerCase())
            );
        }
        
        return filtrados;
    }
    
    // Função para atualizar filtro de valor
    function atualizarFiltroValor() {
        const coluna = filtroColuna.value;
        filtroValor.innerHTML = '<option value="">Selecione um valor</option>';
        
        if (!coluna) {
            filtroValor.disabled = true;
            filtroValor.innerHTML = '<option value="">Primeiro selecione uma coluna</option>';
            return;
        }
        
        filtroValor.disabled = false;
        
        // Obter valores únicos da coluna selecionada
        const valoresUnicos = [...new Set(fornecedores.map(f => f[coluna]).filter(v => v))];
        
        valoresUnicos.forEach(valor => {
            const option = document.createElement('option');
            option.value = valor;
            option.textContent = valor;
            filtroValor.appendChild(option);
        });
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
        infoEl.textContent = `Mostrando ${inicio}-${fim} de ${totalItens} fornecedores`;
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
    
    // Função para carregar do localStorage
    function carregarDoLocalStorage() {
        const fornecedoresArmazenados = localStorage.getItem('fornecedores');
        if (fornecedoresArmazenados) {
            fornecedores = JSON.parse(fornecedoresArmazenados);
        } else {
            // Dados de exemplo
            fornecedores = [
                {
                    id: 1,
                    nome: 'Fornecedor ABC Ltda',
                    linkRMA: 'https://rma.fornecedorabc.com.br',
                    contato: '(11) 99999-9999 - João Silva',
                    observacao: 'Fornecedor principal de toners compatíveis',
                    dataCadastro: new Date().toISOString()
                },
                {
                    id: 2,
                    nome: 'Suprimentos XYZ S.A.',
                    linkRMA: 'https://garantia.suprimentosxyz.com',
                    contato: 'suporte@suprimentosxyz.com',
                    observacao: 'Especializado em toners originais',
                    dataCadastro: new Date().toISOString()
                }
            ];
            salvarNoLocalStorage();
        }
        
        atualizarTabela();
        atualizarFiltroValor();
    }
    
    // Função para salvar no localStorage
    function salvarNoLocalStorage() {
        localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
    }
    
    // Função para salvar edição
    function salvarEdicao() {
        const editNome = document.getElementById('editNome');
        const editLinkRMA = document.getElementById('editLinkRMA');
        const editContato = document.getElementById('editContato');
        const editObservacao = document.getElementById('editObservacao');
        
        if (!editNome.value.trim()) {
            editNome.classList.add('is-invalid');
            return;
        }
        
        const fornecedor = fornecedores.find(f => f.id === editingId);
        if (fornecedor) {
            fornecedor.nome = editNome.value.trim();
            fornecedor.linkRMA = editLinkRMA.value.trim();
            fornecedor.contato = editContato.value.trim();
            fornecedor.observacao = editObservacao.value.trim();
            
            salvarNoLocalStorage();
            atualizarTabela();
            modalEdicao.hide();
            mostrarMensagem('Fornecedor atualizado com sucesso!', 'success');
        }
    }
    
    // Função para confirmar exclusão
    function confirmarExclusao() {
        fornecedores = fornecedores.filter(f => f.id !== deletingId);
        salvarNoLocalStorage();
        atualizarTabela();
        modalExclusao.hide();
        mostrarMensagem('Fornecedor excluído com sucesso!', 'success');
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
    window.editarFornecedor = function(id) {
        const fornecedor = fornecedores.find(f => f.id === id);
        if (fornecedor) {
            editingId = id;
            document.getElementById('editNome').value = fornecedor.nome;
            document.getElementById('editLinkRMA').value = fornecedor.linkRMA;
            document.getElementById('editContato').value = fornecedor.contato;
            document.getElementById('editObservacao').value = fornecedor.observacao;
            modalEdicao.show();
        }
    };
    
    window.excluirFornecedor = function(id) {
        deletingId = id;
        modalExclusao.show();
    };
});