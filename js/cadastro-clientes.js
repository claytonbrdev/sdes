// Cadastro de Clientes - Funcionalidades

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('formCadastroCliente');
    const idCliente = document.getElementById('idCliente');
    const nomeCliente = document.getElementById('nomeCliente');
    
    // Botões
    const btnLimpar = document.getElementById('btnLimpar');
    const btnSalvar = document.getElementById('btnSalvar');
    const buscarCliente = document.getElementById('buscarCliente');
    
    // Modal de mensagens
    const messageModal = document.getElementById('messageModal');
    const messageText = document.getElementById('messageText');
    const closeMessage = document.getElementById('closeMessage');
    
    // Paginação
    const itensPorPagina = 5;
    let paginaAtual = 1;
    let totalPaginas = 1;
    
    // Array para armazenar os clientes
    let clientes = [];
    // ID do cliente em edição ou null
    let editingId = null;
    
    // Carregar dados do localStorage
    carregarDoLocalStorage();
    
    // Event listeners para botões
    btnLimpar.addEventListener('click', limparFormulario);
    btnSalvar.addEventListener('click', salvarCliente);
    buscarCliente.addEventListener('input', filtrarTabela);
    closeMessage.addEventListener('click', fecharMensagem);
    
    // Função para limpar o formulário
    function limparFormulario() {
        form.reset();
        idCliente.readOnly = false;
        editingId = null;
    }
    
    // Função para salvar ou atualizar cliente
    function salvarCliente() {
        // Validar formulário
        if (!validarFormulario()) {
            mostrarMensagem('Por favor, preencha todos os campos corretamente.', 'error');
            return;
        }
        
        // Criar objeto cliente
        const cliente = {
            id: editingId !== null ? editingId : idCliente.value.trim(),
            nome: nomeCliente.value.trim()
        };
        
        // Se criação, verificar ID duplicado
        if (editingId === null) {
            const clienteExistente = clientes.find(c => c.id === cliente.id);
            if (clienteExistente) {
                mostrarMensagem('Este ID de cliente já está em uso. Por favor, use outro ID.', 'error');
                return;
            }
        }

        
        if (editingId !== null) {
            clientes = clientes.map(c => c.id === editingId ? cliente : c);
        } else {
            clientes.push(cliente);
        }
        
        // Salvar no localStorage
        salvarNoLocalStorage();
        
        // Atualizar tabela
        atualizarTabela();
        
        const msg = editingId !== null ? 'Cliente atualizado com sucesso!' : 'Cliente cadastrado com sucesso!';
        mostrarMensagem(msg, 'success');
        
        // Limpar formulário para novo cadastro
        limparFormulario();
    }
    
    // Função para validar o formulário antes de salvar
    function validarFormulario() {
        let valido = true;
        
        // Validar ID do cliente
        if (!idCliente.value.trim()) {
            idCliente.classList.add('is-invalid');
            valido = false;
        } else {
            idCliente.classList.remove('is-invalid');
        }
        
        // Validar nome do cliente
        if (!nomeCliente.value.trim()) {
            nomeCliente.classList.add('is-invalid');
            valido = false;
        } else {
            nomeCliente.classList.remove('is-invalid');
        }
        
        return valido;
    }
    
    // Função para mostrar mensagem modal
    function mostrarMensagem(texto, tipo) {
        messageText.textContent = texto;
        
        // Remover classes anteriores
        messageModal.classList.remove('success', 'error');
        
        // Adicionar classe de acordo com o tipo
        messageModal.classList.add(tipo);
        
        // Atualizar ícone
        const messageIcon = messageModal.querySelector('.message-icon i');
        if (tipo === 'success') {
            messageIcon.className = 'fas fa-check-circle';
        } else {
            messageIcon.className = 'fas fa-exclamation-circle';
        }
        
        // Mostrar modal
        messageModal.classList.add('show');
        
        // Fechar automaticamente após 5 segundos
        setTimeout(() => {
            fecharMensagem();
        }, 5000);
    }
    
    // Função para fechar mensagem modal
    function fecharMensagem() {
        messageModal.classList.remove('show');
    }
    
    // Função para atualizar a tabela de clientes com paginação
    function atualizarTabela() {
        const tbody = document.getElementById('tabelaClientes');
        tbody.innerHTML = '';
        
        // Filtrar clientes se houver busca
        const termo = buscarCliente.value.toLowerCase();
        const clientesFiltrados = clientes.filter(cliente => 
            cliente.id.toLowerCase().includes(termo) || 
            cliente.nome.toLowerCase().includes(termo)
        );
        
        // Calcular total de páginas
        totalPaginas = Math.ceil(clientesFiltrados.length / itensPorPagina);
        if (totalPaginas === 0) totalPaginas = 1;
        
        // Ajustar página atual se necessário
        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
        }
        
        // Calcular índices de início e fim para a página atual
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = Math.min(inicio + itensPorPagina, clientesFiltrados.length);
        
        // Exibir apenas os itens da página atual
        for (let i = inicio; i < fim; i++) {
            const cliente = clientesFiltrados[i];
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${cliente.id}</td>
                <td>${cliente.nome}</td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="editarCliente('${cliente.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="excluirCliente('${cliente.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        }
        
        // Atualizar controles de paginação
        atualizarControlesPaginacao(clientesFiltrados.length);
    }
    
    // Função para atualizar os controles de paginação
    function atualizarControlesPaginacao(totalItens) {
        const paginacaoContainer = document.getElementById('paginacao');
        if (!paginacaoContainer) return;
        
        paginacaoContainer.innerHTML = '';
        
        // Informação sobre itens exibidos
        const infoEl = document.createElement('div');
        infoEl.className = 'pagination-info';
        const inicio = ((paginaAtual - 1) * itensPorPagina) + 1;
        const fim = Math.min(paginaAtual * itensPorPagina, totalItens);
        infoEl.textContent = `Mostrando ${inicio}-${fim} de ${totalItens} itens`;
        paginacaoContainer.appendChild(infoEl);
        
        // Controles de navegação
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
    
    // Função para filtrar a tabela
    function filtrarTabela() {
        // Resetar para a primeira página quando filtrar
        paginaAtual = 1;
        atualizarTabela();
    }
    
    // Função para carregar dados do localStorage
    function carregarDoLocalStorage() {
        const clientesArmazenados = localStorage.getItem('clientes');
        if (clientesArmazenados) {
            clientes = JSON.parse(clientesArmazenados);
        } else {
            // Se não houver dados no localStorage, carrega dados de exemplo
            clientes = [
                {
                    id: "CLI001",
                    nome: "Empresa ABC Ltda"
                },
                {
                    id: "CLI002",
                    nome: "Indústrias XYZ S.A."
                }
            ];
            // Salva os dados de exemplo no localStorage
            salvarNoLocalStorage();
        }
        
        atualizarTabela();
    }
    
    // Função para salvar no localStorage
    function salvarNoLocalStorage() {
        localStorage.setItem('clientes', JSON.stringify(clientes));
    }
    
    // Funções globais para editar e excluir
    window.editarCliente = function(id) {
        const cliente = clientes.find(c => c.id === id);
        if (cliente) {
            editingId = id;
            idCliente.value = cliente.id;
            nomeCliente.value = cliente.nome;
            idCliente.readOnly = true;
        }
    };
    
    window.excluirCliente = function(id) {
        if (confirm('Tem certeza que deseja excluir este cliente?')) {
            clientes = clientes.filter(c => c.id !== id);
            salvarNoLocalStorage();
            atualizarTabela();
            mostrarMensagem('Cliente excluído com sucesso!', 'success');
        }
    };
});
