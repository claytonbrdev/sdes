// Sistema de navegação SPA
document.addEventListener('DOMContentLoaded', function() {
    const pageContent = document.getElementById('pageContent');
    const backButton = document.getElementById('backButton');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const navLinks = document.querySelectorAll('.nav-link');
    const submenuToggles = document.querySelectorAll('.submenu-toggle');
    const featureCards = document.querySelectorAll('.feature-card');
    
    let currentPage = 'inicio';
    let pageCache = new Map();
    
    // Mapeamento de páginas para arquivos
    const pageFiles = {
        'inicio': null, // Página inicial já está carregada
        'dashboard': 'dashboard.html',
        'cadastro-toners': 'cadastro-toners.html',
        'cadastro-fornecedores': 'cadastro-fornecedores.html',
        'cadastro-filiais': 'cadastro-filiais.html',
        'cadastro-setores': 'cadastro-setores.html',
        'cadastro-clientes': 'cadastro-clientes.html',
        'titulos-pop-it': 'titulos-pop-it.html',
        'titulos-processos': 'titulos-processos.html',
        'status-garantia': 'status-garantia.html',
        'registro-retornados': 'registro-retornados.html',
        'consulta-retornados': 'consulta-retornados.html',
        'registrar-garantia': 'registrar-garantia.html',
        'me-lembre': 'me-lembre.html',
        'parametros-retornados': 'parametros-retornados.html'
    };
    
    // Event listeners para navegação
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            if (page && page !== currentPage) {
                navigateToPage(page);
            }
        });
    });
    
    // Event listeners para cards de funcionalidades
    featureCards.forEach(card => {
        card.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page && page !== currentPage) {
                navigateToPage(page);
            }
        });
    });
    
    // Event listeners para submenus
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const submenu = this.nextElementSibling;
            
            if (submenu && submenu.classList.contains('submenu')) {
                // Fechar outros submenus
                submenuToggles.forEach(otherToggle => {
                    if (otherToggle !== this) {
                        const otherSubmenu = otherToggle.nextElementSibling;
                        if (otherSubmenu && otherSubmenu.classList.contains('submenu')) {
                            otherSubmenu.classList.remove('show');
                            otherToggle.classList.remove('expanded');
                        }
                    }
                });
                
                // Toggle do submenu atual
                submenu.classList.toggle('show');
                this.classList.toggle('expanded');
            }
        });
    });
    
    // Event listener para botão de voltar
    backButton.addEventListener('click', function() {
        navigateToPage('inicio');
    });
    
    // Função principal de navegação
    async function navigateToPage(page) {
        if (page === currentPage) return;
        
        // Verificar se a página existe
        if (page !== 'inicio' && !pageFiles[page]) {
            showMessage(`Página "${page}" ainda não foi implementada.`, 'error');
            return;
        }
        
        // Mostrar loading
        showLoading();
        
        // Fade out da página atual
        pageContent.classList.add('fade-out');
        
        // Aguardar animação
        await new Promise(resolve => setTimeout(resolve, 300));
        
        try {
            // Carregar conteúdo da página
            const content = await loadPageContent(page);
            
            // Atualizar conteúdo
            pageContent.innerHTML = content;
            
            // Fade in da nova página
            pageContent.classList.remove('fade-out');
            pageContent.classList.add('fade-in');
            
            // Remover classe fade-in após animação
            setTimeout(() => {
                pageContent.classList.remove('fade-in');
            }, 300);
            
            // Atualizar estado
            currentPage = page;
            updateNavigation(page);
            updateLayout(page);
            
            // Carregar scripts específicos da página
            await loadPageScripts(page);
            
        } catch (error) {
            console.error('Erro ao carregar página:', error);
            showMessage('Erro ao carregar a página. Tente novamente.', 'error');
            
            // Voltar ao estado anterior
            pageContent.classList.remove('fade-out', 'fade-in');
        }
        
        // Esconder loading
        hideLoading();
    }
    
    // Função para atualizar layout (mostrar/esconder sidebar)
    function updateLayout(page) {
        if (page === 'inicio') {
            // Página inicial: mostrar sidebar, content com margem
            sidebar.classList.remove('hidden');
            mainContent.classList.remove('fullscreen');
            backButton.classList.remove('show');
        } else {
            // Outras páginas: esconder sidebar, content em tela cheia
            sidebar.classList.add('hidden');
            mainContent.classList.add('fullscreen');
            backButton.classList.add('show');
        }
    }
    
    // Função para carregar conteúdo da página
    async function loadPageContent(page) {
        if (page === 'inicio') {
            return getInicioContent();
        }
        
        if (page === 'dashboard') {
            return getDashboardContent();
        }
        
        // Verificar cache
        if (pageCache.has(page)) {
            return pageCache.get(page);
        }
        
        const fileName = pageFiles[page];
        if (!fileName) {
            throw new Error(`Página ${page} não encontrada`);
        }
        
        try {
            const response = await fetch(fileName);
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }
            
            const html = await response.text();
            
            // Extrair apenas o conteúdo da main
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = doc.querySelector('main.content');
            
            if (mainContent) {
                const content = mainContent.innerHTML;
                // Armazenar no cache
                pageCache.set(page, content);
                return content;
            } else {
                throw new Error('Conteúdo principal não encontrado');
            }
            
        } catch (error) {
            console.error('Erro ao buscar página:', error);
            throw error;
        }
    }
    
    // Função para carregar scripts específicos da página
    async function loadPageScripts(page) {
        const scriptMap = {
            'cadastro-toners': 'js/cadastro-toners.js',
            'cadastro-fornecedores': 'js/cadastro-fornecedores.js',
            'cadastro-filiais': 'js/cadastro-filiais.js',
            'cadastro-setores': 'js/cadastro-setores.js',
            'cadastro-clientes': 'js/cadastro-clientes.js',
            'titulos-pop-it': 'js/titulos-pop-it.js',
            'titulos-processos': 'js/titulos-processos.js',
            'status-garantia': 'js/status-garantia.js',
            'registro-retornados': 'js/registro-retornados.js',
            'consulta-retornados': 'js/consulta-retornados.js',
            'me-lembre': 'js/me-lembre.js',
            'parametros-retornados': 'js/parametros-retornados.js'
        };
        
        const scriptFile = scriptMap[page];
        if (scriptFile) {
            // Remover script anterior se existir
            const existingScript = document.querySelector(`script[src="${scriptFile}"]`);
            if (existingScript) {
                existingScript.remove();
            }
            
            // Carregar novo script
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = scriptFile;
                script.onload = resolve;
                script.onerror = () => {
                    console.warn(`Script ${scriptFile} não encontrado, continuando...`);
                    resolve(); // Não falhar se o script não existir
                };
                document.head.appendChild(script);
            });
        }
        
        // Para o dashboard, recarregar os gráficos
        if (page === 'dashboard') {
            // Aguardar um pouco para o DOM estar pronto
            setTimeout(() => {
                if (typeof Chart !== 'undefined') {
                    // Recriar gráficos do dashboard
                    initDashboardCharts();
                }
            }, 100);
        }
    }
    
    // Função para obter conteúdo da página inicial
    function getInicioContent() {
        return `
            <div class="welcome-container">
                <!-- Header com botão sair -->
                <div class="welcome-header">
                    <button class="btn btn-outline-light btn-sm">
                        <i class="fas fa-sign-out-alt me-2"></i>Sair
                    </button>
                </div>

                <!-- Conteúdo principal de boas-vindas -->
                <div class="welcome-content">
                    <div class="welcome-logo">
                        <div class="logo-circle">
                            <i class="fas fa-cogs"></i>
                        </div>
                    </div>
                    
                    <h1 class="welcome-title">
                        Bem-vindo ao <span class="text-primary">SGQ OTI</span>
                    </h1>
                    
                    <p class="welcome-subtitle">
                        Sistema de Gestão da Qualidade - Otimizando processos e garantindo excelência
                    </p>

                    <!-- Cards de funcionalidades principais -->
                    <div class="features-grid">
                        <div class="feature-card" data-page="dashboard">
                            <div class="feature-icon">
                                <i class="fas fa-tachometer-alt"></i>
                            </div>
                            <h3>Dashboard</h3>
                            <p>Visão geral dos indicadores e métricas do sistema</p>
                        </div>

                        <div class="feature-card" data-page="cadastro-toners">
                            <div class="feature-icon">
                                <i class="fas fa-box"></i>
                            </div>
                            <h3>Gestão de Toners</h3>
                            <p>Cadastro e controle completo de toners e suprimentos</p>
                        </div>

                        <div class="feature-card" data-page="registro-retornados">
                            <div class="feature-icon">
                                <i class="fas fa-recycle"></i>
                            </div>
                            <h3>Toners Retornados</h3>
                            <p>Controle e análise de toners retornados</p>
                        </div>

                        <div class="feature-card" data-page="registrar-garantia">
                            <div class="feature-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <h3>Garantias</h3>
                            <p>Gestão completa de garantias e RMA</p>
                        </div>

                        <div class="feature-card" data-page="me-lembre">
                            <div class="feature-icon">
                                <i class="fas fa-bell"></i>
                            </div>
                            <h3>Me Lembre!</h3>
                            <p>Sistema de lembretes e notificações</p>
                        </div>

                        <div class="feature-card" data-page="parametros-retornados">
                            <div class="feature-icon">
                                <i class="fas fa-cogs"></i>
                            </div>
                            <h3>Configurações</h3>
                            <p>Parâmetros e configurações do sistema</p>
                        </div>
                    </div>

                    <!-- Estatísticas rápidas -->
                    <div class="stats-section">
                        <h2 class="stats-title">Estatísticas do Sistema</h2>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-number">1,247</div>
                                <div class="stat-label">Toners Cadastrados</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">89</div>
                                <div class="stat-label">Retornados Este Mês</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">15</div>
                                <div class="stat-label">Garantias Ativas</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">98.5%</div>
                                <div class="stat-label">Taxa de Qualidade</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="welcome-footer">
                    <p>&copy; 2025 SGQ OTI - Sistema de Gestão da Qualidade. Todos os direitos reservados.</p>
                </div>
            </div>
        `;
    }
    
    // Função para obter conteúdo do dashboard
    function getDashboardContent() {
        return `
            <div class="header">
                <h2>Dashboard</h2>
            </div>
            <div class="row mb-4">
                <div class="col-md-6"><div class="card p-3"><h5>Gráfico de Auditorias</h5><canvas id="chartAuditorias"></canvas></div></div>
                <div class="col-md-6"><div class="card p-3"><h5>Gráfico de Retornos</h5><canvas id="chartRetornos"></canvas></div></div>
            </div>
            <div class="row mb-4">
                <div class="col-md-6"><div class="card p-3"><h5>Garantias por Status</h5><canvas id="chartGarantias"></canvas></div></div>
                <div class="col-md-6"><div class="card p-3"><h5>Documentos Ativos</h5><canvas id="chartDocumentos"></canvas></div></div>
            </div>
            <div class="row">
                <div class="col-md-6"><div class="card p-3"><h5>Garantias por Fornecedor</h5><canvas id="chartGarantiasFornecedor"></canvas></div></div>
                <div class="col-md-6"><div class="card p-3"><h5>Toners Recuperados por Mês</h5><canvas id="chartTonersRecuperados"></canvas></div></div>
            </div>
        `;
    }
    
    // Função para atualizar navegação
    function updateNavigation(page) {
        // Remover classe active de todos os links
        navLinks.forEach(link => link.classList.remove('active'));
        
        // Adicionar classe active ao link atual
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            
            // Abrir submenu se necessário
            const submenu = activeLink.closest('.submenu');
            if (submenu) {
                submenu.classList.add('show');
                
                // Expandir o toggle do submenu pai
                const parentToggle = submenu.previousElementSibling;
                if (parentToggle && parentToggle.classList.contains('submenu-toggle')) {
                    parentToggle.classList.add('expanded');
                }
            }
        }
    }
    
    // Funções de loading
    function showLoading() {
        loadingOverlay.classList.add('show');
    }
    
    function hideLoading() {
        loadingOverlay.classList.remove('show');
    }
    
    // Função para mostrar mensagens
    function showMessage(text, type) {
        const messageModal = document.getElementById('messageModal');
        const messageText = document.getElementById('messageText');
        
        if (messageModal && messageText) {
            messageText.textContent = text;
            messageModal.classList.remove('success', 'error');
            messageModal.classList.add(type);
            
            const messageIcon = messageModal.querySelector('.message-icon i');
            if (messageIcon) {
                if (type === 'success') {
                    messageIcon.className = 'fas fa-check-circle';
                } else {
                    messageIcon.className = 'fas fa-exclamation-circle';
                }
            }
            
            messageModal.classList.add('show');
            
            setTimeout(() => {
                messageModal.classList.remove('show');
            }, 5000);
        }
    }
    
    // Função para inicializar gráficos do dashboard
    function initDashboardCharts() {
        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js não está carregado');
            return;
        }

        // Gráfico de Auditorias
        const chartAuditorias = document.getElementById('chartAuditorias');
        if (chartAuditorias) {
            new Chart(chartAuditorias, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr'],
                    datasets: [{
                        label: 'Auditorias',
                        data: [5, 8, 4, 6],
                        backgroundColor: '#0d6efd'
                    }]
                }
            });
        }

        // Gráfico de Retornos
        const chartRetornos = document.getElementById('chartRetornos');
        if (chartRetornos) {
            new Chart(chartRetornos, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr'],
                    datasets: [{
                        label: 'Toners Retornados',
                        data: [12, 9, 14, 10],
                        borderColor: '#6610f2',
                        fill: false
                    }]
                }
            });
        }

        // Gráfico de Garantias
        const chartGarantias = document.getElementById('chartGarantias');
        if (chartGarantias) {
            new Chart(chartGarantias, {
                type: 'pie',
                data: {
                    labels: ['Aprovadas', 'Pendentes', 'Rejeitadas'],
                    datasets: [{
                        data: [10, 5, 2],
                        backgroundColor: ['#198754', '#ffc107', '#dc3545']
                    }]
                }
            });
        }

        // Gráfico de Documentos
        const chartDocumentos = document.getElementById('chartDocumentos');
        if (chartDocumentos) {
            new Chart(chartDocumentos, {
                type: 'doughnut',
                data: {
                    labels: ['POP', 'IT', 'BPMN'],
                    datasets: [{
                        data: [30, 20, 10],
                        backgroundColor: ['#0d6efd', '#20c997', '#6f42c1']
                    }]
                }
            });
        }

        // Gráfico de Garantias por Fornecedor
        const chartGarantiasFornecedor = document.getElementById('chartGarantiasFornecedor');
        if (chartGarantiasFornecedor) {
            new Chart(chartGarantiasFornecedor, {
                type: 'bar',
                data: {
                    labels: ['Fornecedor A', 'Fornecedor B', 'Fornecedor C'],
                    datasets: [{
                        label: 'Garantias',
                        data: [12, 7, 5],
                        backgroundColor: ['#0d6efd', '#6f42c1', '#20c997']
                    }]
                }
            });
        }

        // Gráfico de Toners Recuperados
        const chartTonersRecuperados = document.getElementById('chartTonersRecuperados');
        if (chartTonersRecuperados) {
            new Chart(chartTonersRecuperados, {
                type: 'bar',
                data: {
                    labels: ['Jan', 'Fev', 'Mar', 'Abr'],
                    datasets: [
                        {
                            label: 'Quantidade',
                            data: [40, 55, 60, 70],
                            backgroundColor: '#198754'
                        },
                        {
                            label: 'Valor R$',
                            data: [800, 1200, 1500, 1800],
                            backgroundColor: '#ffc107'
                        }
                    ]
                }
            });
        }
    }
    
    // Adicionar event listeners para os cards de funcionalidades após carregar a página inicial
    setTimeout(() => {
        const newFeatureCards = document.querySelectorAll('.feature-card');
        newFeatureCards.forEach(card => {
            card.addEventListener('click', function() {
                const page = this.getAttribute('data-page');
                if (page && page !== currentPage) {
                    navigateToPage(page);
                }
            });
        });
    }, 100);
    
    // Expor função globalmente para uso em outros scripts
    window.navigateToPage = navigateToPage;
    window.showMessage = showMessage;
});