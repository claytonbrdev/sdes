// Cadastro de Filiais - Funcionalidades

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('formCadastroFilial');
    const nomeFilial = document.getElementById('nomeFilial');
    const endereco = document.getElementById('endereco');
    
    // Botões
    const btnLimpar = document.getElementById('btnLimpar');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnImportar = document.getElementById('btnImportar');
    const btnExportar = document.getElementById('btnExportar');
    const buscarFilial = document.getElementById('buscarFilial');
    
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
    
    // Array para armazenar as filiais
    let filiais = [];
    let editingId = null;
    let deletingId = null;
    
    // Carregar dados do localStorage
    carregarDoLocalStorage();
    
    // Event listeners
    btnLimpar.addEventListener('click', limparFormulario);
    btnSalvar.addEventListener('click', salvarFilial);
    btnImportar.addEventListener('click', () => modalImportacao.show());
    btnExportar.addEventListener('click', () => modalExportacao.show());
    buscarFilial.addEventListener('input', filtrarTabela);
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
    
    // Função para salvar filial
    function salvarFilial() {
        if (!validarFormulario()) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        const filial = {
            id: editingId !== null ? editingId : Date.now(),
            nomeFilial: nomeFilial.value.trim(),
            endereco: endereco.value.trim(),
            dataCadastro: editingId !== null ? 
                filiais.find(f => f.id === editingId).dataCadastro : 
                new Date().toISOString()
        };
        
        if (editingId !== null) {
            filiais = filiais.map(f => f.id === editingId ? filial : f);
            mostrarMensagem('Filial atualizada com sucesso!', 'success');
        } else {
            filiais.push(filial);
            mostrarMensagem('Filial cadastrada com sucesso!', 'success');
        }
        
        salvarNoLocalStorage();
        atualizarTabela();
        limparFormulario();
    }
    
    // Função para validar formulário
    function validarFormulario() {
        let valido = true;
        
        if (!nomeFilial.value.trim()) {
            nomeFilial.classList.add('is-invalid');
            valido = false;
        } else {
            nomeFilial.classList.remove('is-invalid');
        }
        
        if (!endereco.value.trim()) {
            endereco.classList.add('is-invalid');
            valido = false;
        } else {
            endereco.classList.remove('is-invalid');
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
        const tbody = document.getElementById('tabelaFiliais');
        tbody.innerHTML = '';
        
        let filiaisFiltradas = aplicarFiltros();
        
        // Calcular paginação
        totalPaginas = Math.ceil(filiaisFiltradas.length / itensPorPagina);
        if (totalPaginas === 0) totalPaginas = 1;
        
        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
        }
        
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = Math.min(inicio + itensPorPagina, filiaisFiltradas.length);
        
        for (let i = inicio; i < fim; i++) {
            const filial = filiaisFiltradas[i];
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${filial.nomeFilial}</td>
                <td>${filial.endereco}</td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="editarFilial(${filial.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="excluirFilial(${filial.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        }
        
        atualizarControlesPaginacao(filiaisFiltradas.length);
    }
    
    // Função para aplicar filtros
    function aplicarFiltros() {
        let filtradas = [...filiais];
        
        // Filtro de busca
        const termo = buscarFilial.value.toLowerCase();
        if (termo) {
            filtradas = filtradas.filter(f => 
                f.nomeFilial.toLowerCase().includes(termo) ||
                f.endereco.toLowerCase().includes(termo)
            );
        }
        
        // Filtro por coluna
        if (filtroColuna.value && filtroValor.value) {
            filtradas = filtradas.filter(f => 
                f[filtroColuna.value].toLowerCase().includes(filtroValor.value.toLowerCase())
            );
        }
        
        return filtradas;
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
        const valoresUnicos = [...new Set(filiais.map(f => f[coluna]).filter(v => v))];
        
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
        infoEl.textContent = `Mostrando ${inicio}-${fim} de ${totalItens} filiais`;
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
        const filiaisArmazenadas = localStorage.getItem('filiais');
        if (filiaisArmazenadas) {
            filiais = JSON.parse(filiaisArmazenadas);
        } else {
            // Dados de exemplo
            filiais = [
                {
                    id: 1,
                    nomeFilial: 'Matriz São Paulo',
                    endereco: 'Av. Paulista, 1000 - São Paulo/SP',
                    dataCadastro: new Date().toISOString()
                },
                {
                    id: 2,
                    nomeFilial: 'Filial Rio de Janeiro',
                    endereco: 'Rua das Flores, 500 - Rio de Janeiro/RJ',
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
        localStorage.setItem('filiais', JSON.stringify(filiais));
    }
    
    // Função para salvar edição
    function salvarEdicao() {
        const editNomeFilial = document.getElementById('editNomeFilial');
        const editEndereco = document.getElementById('editEndereco');
        
        if (!editNomeFilial.value.trim() || !editEndereco.value.trim()) {
            if (!editNomeFilial.value.trim()) editNomeFilial.classList.add('is-invalid');
            if (!editEndereco.value.trim()) editEndereco.classList.add('is-invalid');
            return;
        }
        
        const filial = filiais.find(f => f.id === editingId);
        if (filial) {
            filial.nomeFilial = editNomeFilial.value.trim();
            filial.endereco = editEndereco.value.trim();
            
            salvarNoLocalStorage();
            atualizarTabela();
            modalEdicao.hide();
            mostrarMensagem('Filial atualizada com sucesso!', 'success');
        }
    }
    
    // Função para confirmar exclusão
    function confirmarExclusao() {
        filiais = filiais.filter(f => f.id !== deletingId);
        salvarNoLocalStorage();
        atualizarTabela();
        modalExclusao.hide();
        mostrarMensagem('Filial excluída com sucesso!', 'success');
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
    window.editarFilial = function(id) {
        const filial = filiais.find(f => f.id === id);
        if (filial) {
            editingId = id;
            document.getElementById('editNomeFilial').value = filial.nomeFilial;
            document.getElementById('editEndereco').value = filial.endereco;
            modalEdicao.show();
        }
    };
    
    window.excluirFilial = function(id) {
        deletingId = id;
        modalExclusao.show();
    };
});