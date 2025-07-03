// Cadastro de Setores - Funcionalidades

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('formCadastroSetor');
    const nomeSetor = document.getElementById('nomeSetor');
    
    // Botões
    const btnLimpar = document.getElementById('btnLimpar');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnImportar = document.getElementById('btnImportar');
    const btnExportar = document.getElementById('btnExportar');
    const buscarSetor = document.getElementById('buscarSetor');
    
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
    
    // Array para armazenar os setores
    let setores = [];
    let editingId = null;
    let deletingId = null;
    
    // Carregar dados do localStorage
    carregarDoLocalStorage();
    
    // Event listeners
    btnLimpar.addEventListener('click', limparFormulario);
    btnSalvar.addEventListener('click', salvarSetor);
    btnImportar.addEventListener('click', () => modalImportacao.show());
    btnExportar.addEventListener('click', () => modalExportacao.show());
    buscarSetor.addEventListener('input', filtrarTabela);
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
    
    // Função para salvar setor
    function salvarSetor() {
        if (!validarFormulario()) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        const setor = {
            id: editingId !== null ? editingId : Date.now(),
            nomeSetor: nomeSetor.value.trim(),
            dataCadastro: editingId !== null ? 
                setores.find(s => s.id === editingId).dataCadastro : 
                new Date().toISOString()
        };
        
        if (editingId !== null) {
            setores = setores.map(s => s.id === editingId ? setor : s);
            mostrarMensagem('Setor atualizado com sucesso!', 'success');
        } else {
            setores.push(setor);
            mostrarMensagem('Setor cadastrado com sucesso!', 'success');
        }
        
        salvarNoLocalStorage();
        atualizarTabela();
        limparFormulario();
    }
    
    // Função para validar formulário
    function validarFormulario() {
        let valido = true;
        
        if (!nomeSetor.value.trim()) {
            nomeSetor.classList.add('is-invalid');
            valido = false;
        } else {
            nomeSetor.classList.remove('is-invalid');
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
        const tbody = document.getElementById('tabelaSetores');
        tbody.innerHTML = '';
        
        let setoresFiltrados = aplicarFiltros();
        
        // Calcular paginação
        totalPaginas = Math.ceil(setoresFiltrados.length / itensPorPagina);
        if (totalPaginas === 0) totalPaginas = 1;
        
        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
        }
        
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = Math.min(inicio + itensPorPagina, setoresFiltrados.length);
        
        for (let i = inicio; i < fim; i++) {
            const setor = setoresFiltrados[i];
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${setor.nomeSetor}</td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="editarSetor(${setor.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="excluirSetor(${setor.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        }
        
        atualizarControlesPaginacao(setoresFiltrados.length);
    }
    
    // Função para aplicar filtros
    function aplicarFiltros() {
        let filtrados = [...setores];
        
        // Filtro de busca
        const termo = buscarSetor.value.toLowerCase();
        if (termo) {
            filtrados = filtrados.filter(s => 
                s.nomeSetor.toLowerCase().includes(termo)
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
        infoEl.textContent = `Mostrando ${inicio}-${fim} de ${totalItens} setores`;
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
        const setoresArmazenados = localStorage.getItem('setores');
        if (setoresArmazenados) {
            setores = JSON.parse(setoresArmazenados);
        } else {
            // Dados de exemplo
            setores = [
                {
                    id: 1,
                    nomeSetor: 'Recursos Humanos',
                    dataCadastro: new Date().toISOString()
                },
                {
                    id: 2,
                    nomeSetor: 'Tecnologia da Informação',
                    dataCadastro: new Date().toISOString()
                },
                {
                    id: 3,
                    nomeSetor: 'Financeiro',
                    dataCadastro: new Date().toISOString()
                }
            ];
            salvarNoLocalStorage();
        }
        
        atualizarTabela();
    }
    
    // Função para salvar no localStorage
    function salvarNoLocalStorage() {
        localStorage.setItem('setores', JSON.stringify(setores));
    }
    
    // Função para salvar edição
    function salvarEdicao() {
        const editNomeSetor = document.getElementById('editNomeSetor');
        
        if (!editNomeSetor.value.trim()) {
            editNomeSetor.classList.add('is-invalid');
            return;
        }
        
        const setor = setores.find(s => s.id === editingId);
        if (setor) {
            setor.nomeSetor = editNomeSetor.value.trim();
            
            salvarNoLocalStorage();
            atualizarTabela();
            modalEdicao.hide();
            mostrarMensagem('Setor atualizado com sucesso!', 'success');
        }
    }
    
    // Função para confirmar exclusão
    function confirmarExclusao() {
        setores = setores.filter(s => s.id !== deletingId);
        salvarNoLocalStorage();
        atualizarTabela();
        modalExclusao.hide();
        mostrarMensagem('Setor excluído com sucesso!', 'success');
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
    window.editarSetor = function(id) {
        const setor = setores.find(s => s.id === id);
        if (setor) {
            editingId = id;
            document.getElementById('editNomeSetor').value = setor.nomeSetor;
            modalEdicao.show();
        }
    };
    
    window.excluirSetor = function(id) {
        deletingId = id;
        modalExclusao.show();
    };
});