// Sistema de navegação SPA
document.addEventListener('DOMContentLoaded', function() {
    const pageContent = document.getElementById('pageContent');
    const backButton = document.getElementById('backButton');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const mainContent = document.getElementById('mainContent');
    
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
    
    // Configurar cards que viram
    setupFlipCards();
    
    // Event listeners para navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            if (page && page !== currentPage) {
                navigateToPage(page);
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
            updateLayout(page);
            
            // Carregar scripts específicos da página
            await loadPageScripts(page);
            
            // Configurar cards que viram se estiver na página inicial
            if (page === 'inicio') {
                setupFlipCards();
            }
            
        } catch (error) {
            console.error('Erro ao carregar página:', error);
            showMessage('Erro ao carregar a página. Tente novamente.', 'error');
            
            // Voltar ao estado anterior
            pageContent.classList.remove('fade-out', 'fade-in');
        }
        
        // Esconder loading
        hideLoading();
    }
    
    // Configurar cards que viram
    function setupFlipCards() {
        // Botões para virar o card (frente para trás)
        document.querySelectorAll('.nav-group-front .nav-group-back-button').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const navGroup = this.closest('.nav-group');
                navGroup.classList.add('flipped');
            });
        });
        
        // Botões para voltar (trás para frente)
        document.querySelectorAll('.nav-group-back .nav-group-back-button.flip-back').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const navGroup = this.closest('.nav-group');
                navGroup.classList.remove('flipped');
            });
        });
    }
    
    // Função para atualizar layout (mostrar/esconder sidebar)
    function updateLayout(page) {
        if (page === 'inicio') {
            // Página inicial: content em tela cheia
            mainContent.classList.remove('fullscreen');
            backButton.classList.remove('show');
        } else {
            // Outras páginas: content em tela cheia com botão de voltar
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

                    <!-- Cards de navegação principal -->
                    <div class="navigation-grid">
                        <!-- Grupo: Cadastros -->
                        <div class="nav-group">
                            <div class="nav-group-card">
                                <div class="nav-group-front">
                                    <div class="nav-group-icon">
                                        <i class="fas fa-box"></i>
                                    </div>
                                    <h3 class="nav-group-title">Cadastros</h3>
                                    <p class="nav-group-description">Gerencie cadastros de toners, fornecedores, filiais e mais</p>
                                    <button class="nav-group-back-button">
                                        <i class="fas fa-chevron-right"></i> Acessar
                                    </button>
                                </div>
                                <div class="nav-group-back">
                                    <div class="nav-group-header">
                                        <i class="fas fa-box"></i>
                                        <h3>Cadastros</h3>
                                    </div>
                                    <div class="nav-group-items">
                                        <div class="nav-item" data-page="cadastro-toners">
                                            <i class="fas fa-print"></i>
                                            <span>Toners</span>
                                        </div>
                                        <div class="nav-item" data-page="cadastro-fornecedores">
                                            <i class="fas fa-truck"></i>
                                            <span>Fornecedores</span>
                                        </div>
                                        <div class="nav-item" data-page="cadastro-filiais">
                                            <i class="fas fa-building"></i>
                                            <span>Filiais</span>
                                        </div>
                                        <div class="nav-item" data-page="cadastro-setores">
                                            <i class="fas fa-sitemap"></i>
                                            <span>Setores</span>
                                        </div>
                                        <div class="nav-item" data-page="cadastro-clientes">
                                            <i class="fas fa-users"></i>
                                            <span>Clientes</span>
                                        </div>
                                        <div class="nav-item" data-page="titulos-pop-it">
                                            <i class="fas fa-file-alt"></i>
                                            <span>POP / IT</span>
                                        </div>
                                        <div class="nav-item" data-page="titulos-processos">
                                            <i class="fas fa-project-diagram"></i>
                                            <span>Processos</span>
                                        </div>
                                        <div class="nav-item" data-page="status-garantia">
                                            <i class="fas fa-shield-alt"></i>
                                            <span>Status Garantia</span>
                                        </div>
                                    </div>
                                    <button class="nav-group-back-button flip-back">
                                        <i class="fas fa-chevron-left"></i> Voltar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Grupo: Toners Retornados -->
                        <div class="nav-group">
                            <div class="nav-group-card">
                                <div class="nav-group-front">
                                    <div class="nav-group-icon">
                                        <i class="fas fa-recycle"></i>
                                    </div>
                                    <h3 class="nav-group-title">Toners Retornados</h3>
                                    <p class="nav-group-description">Registre e consulte toners retornados</p>
                                    <button class="nav-group-back-button">
                                        <i class="fas fa-chevron-right"></i> Acessar
                                    </button>
                                </div>
                                <div class="nav-group-back">
                                    <div class="nav-group-header">
                                        <i class="fas fa-recycle"></i>
                                        <h3>Toners Retornados</h3>
                                    </div>
                                    <div class="nav-group-items">
                                        <div class="nav-item" data-page="registro-retornados">
                                            <i class="fas fa-plus-circle"></i>
                                            <span>Registrar</span>
                                        </div>
                                        <div class="nav-item" data-page="consulta-retornados">
                                            <i class="fas fa-search"></i>
                                            <span>Consultar</span>
                                        </div>
                                    </div>
                                    <button class="nav-group-back-button flip-back">
                                        <i class="fas fa-chevron-left"></i> Voltar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Grupo: Garantias -->
                        <div class="nav-group">
                            <div class="nav-group-card">
                                <div class="nav-group-front">
                                    <div class="nav-group-icon">
                                        <i class="fas fa-shield-alt"></i>
                                    </div>
                                    <h3 class="nav-group-title">Garantias</h3>
                                    <p class="nav-group-description">Gerencie garantias de produtos</p>
                                    <button class="nav-group-back-button">
                                        <i class="fas fa-chevron-right"></i> Acessar
                                    </button>
                                </div>
                                <div class="nav-group-back">
                                    <div class="nav-group-header">
                                        <i class="fas fa-shield-alt"></i>
                                        <h3>Garantias</h3>
                                    </div>
                                    <div class="nav-group-items">
                                        <div class="nav-item" data-page="registrar-garantia">
                                            <i class="fas fa-plus-circle"></i>
                                            <span>Registrar</span>
                                        </div>
                                        <div class="nav-item" data-page="consulta-garantias">
                                            <i class="fas fa-search"></i>
                                            <span>Consultar</span>
                                        </div>
                                    </div>
                                    <button class="nav-group-back-button flip-back">
                                        <i class="fas fa-chevron-left"></i> Voltar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Grupo: Gestão de Documentos -->
                        <div class="nav-group">
                            <div class="nav-group-card">
                                <div class="nav-group-front">
                                    <div class="nav-group-icon">
                                        <i class="fas fa-folder"></i>
                                    </div>
                                    <h3 class="nav-group-title">Documentos</h3>
                                    <p class="nav-group-description">Gerencie documentos do sistema</p>
                                    <button class="nav-group-back-button">
                                        <i class="fas fa-chevron-right"></i> Acessar
                                    </button>
                                </div>
                                <div class="nav-group-back">
                                    <div class="nav-group-header">
                                        <i class="fas fa-folder"></i>
                                        <h3>Documentos</h3>
                                    </div>
                                    <div class="nav-group-items">
                                        <div class="nav-item" data-page="registro-documentos">
                                            <i class="fas fa-file-upload"></i>
                                            <span>Registrar</span>
                                        </div>
                                    </div>
                                    <button class="nav-group-back-button flip-back">
                                        <i class="fas fa-chevron-left"></i> Voltar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Grupo: Gestão de POP/IT -->
                        <div class="nav-group">
                            <div class="nav-group-card">
                                <div class="nav-group-front">
                                    <div class="nav-group-icon">
                                        <i class="fas fa-file-alt"></i>
                                    </div>
                                    <h3 class="nav-group-title">POP / IT</h3>
                                    <p class="nav-group-description">Gerencie procedimentos operacionais</p>
                                    <button class="nav-group-back-button">
                                        <i class="fas fa-chevron-right"></i> Acessar
                                    </button>
                                </div>
                                <div class="nav-group-back">
                                    <div class="nav-group-header">
                                        <i class="fas fa-file-alt"></i>
                                        <h3>POP / IT</h3>
                                    </div>
                                    <div class="nav-group-items">
                                        <div class="nav-item" data-page="registro-pop-it">
                                            <i class="fas fa-edit"></i>
                                            <span>Registrar</span>
                                        </div>
                                        <div class="nav-item" data-page="visualizar-pop-it">
                                            <i class="fas fa-eye"></i>
                                            <span>Visualizar</span>
                                        </div>
                                    </div>
                                    <button class="nav-group-back-button flip-back">
                                        <i class="fas fa-chevron-left"></i> Voltar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Grupo: Gestão de Processos -->
                        <div class="nav-group">
                            <div class="nav-group-card">
                                <div class="nav-group-front">
                                    <div class="nav-group-icon">
                                        <i class="fas fa-project-diagram"></i>
                                    </div>
                                    <h3 class="nav-group-title">Processos</h3>
                                    <p class="nav-group-description">Gerencie processos do sistema</p>
                                    <button class="nav-group-back-button">
                                        <i class="fas fa-chevron-right"></i> Acessar
                                    </button>
                                </div>
                                <div class="nav-group-back">
                                    <div class="nav-group-header">
                                        <i class="fas fa-project-diagram"></i>
                                        <h3>Processos</h3>
                                    </div>
                                    <div class="nav-group-items">
                                        <div class="nav-item" data-page="registro-processos">
                                            <i class="fas fa-edit"></i>
                                            <span>Registrar</span>
                                        </div>
                                        <div class="nav-item" data-page="visualizar-processos">
                                            <i class="fas fa-eye"></i>
                                            <span>Visualizar</span>
                                        </div>
                                    </div>
                                    <button class="nav-group-back-button flip-back">
                                        <i class="fas fa-chevron-left"></i> Voltar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Grupo: Análises -->
                        <div class="nav-group">
                            <div class="nav-group-card">
                                <div class="nav-group-front">
                                    <div class="nav-group-icon">
                                        <i class="fas fa-chart-pie"></i>
                                    </div>
                                    <h3 class="nav-group-title">Análises</h3>
                                    <p class="nav-group-description">Visualize análises e relatórios</p>
                                    <button class="nav-group-back-button">
                                        <i class="fas fa-chevron-right"></i> Acessar
                                    </button>
                                </div>
                                <div class="nav-group-back">
                                    <div class="nav-group-header">
                                        <i class="fas fa-chart-pie"></i>
                                        <h3>Análises</h3>
                                    </div>
                                    <div class="nav-group-items">
                                        <div class="nav-item" data-page="analise-ishikawa">
                                            <i class="fas fa-fish"></i>
                                            <span>Ishikawa</span>
                                        </div>
                                        <div class="nav-item" data-page="analise-pareto">
                                            <i class="fas fa-chart-bar"></i>
                                            <span>Pareto</span>
                                        </div>
                                    </div>
                                    <button class="nav-group-back-button flip-back">
                                        <i class="fas fa-chevron-left"></i> Voltar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Grupo: Utilitários -->
                        <div class="nav-group">
                            <div class="nav-group-card">
                                <div class="nav-group-front">
                                    <div class="nav-group-icon">
                                        <i class="fas fa-tools"></i>
                                    </div>
                                    <h3 class="nav-group-title">Utilitários</h3>
                                    <p class="nav-group-description">Acesse ferramentas úteis do sistema</p>
                                    <button class="nav-group-back-button">
                                        <i class="fas fa-chevron-right"></i> Acessar
                                    </button>
                                </div>
                                <div class="nav-group-back">
                                    <div class="nav-group-header">
                                        <i class="fas fa-tools"></i>
                                        <h3>Utilitários</h3>
                                    </div>
                                    <div class="nav-group-items">
                                        <div class="nav-item" data-page="me-lembre">
                                            <i class="fas fa-bell"></i>
                                            <span>Me Lembre!</span>
                                        </div>
                                        <div class="nav-item" data-page="dashboard">
                                            <i class="fas fa-tachometer-alt"></i>
                                            <span>Dashboard</span>
                                        </div>
                                    </div>
                                    <button class="nav-group-back-button flip-back">
                                        <i class="fas fa-chevron-left"></i> Voltar
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Grupo: Configurações -->
                        <div class="nav-group">
                            <div class="nav-group-card">
                                <div class="nav-group-front">
                                    <div class="nav-group-icon">
                                        <i class="fas fa-cogs"></i>
                                    </div>
                                    <h3 class="nav-group-title">Configurações</h3>
                                    <p class="nav-group-description">Configure parâmetros do sistema</p>
                                    <button class="nav-group-back-button">
                                        <i class="fas fa-chevron-right"></i> Acessar
                                    </button>
                                </div>
                                <div class="nav-group-back">
                                    <div class="nav-group-header">
                                        <i class="fas fa-cogs"></i>
                                        <h3>Configurações</h3>
                                    </div>
                                    <div class="nav-group-items">
                                        <div class="nav-item" data-page="perfis-permissoes">
                                            <i class="fas fa-user-lock"></i>
                                            <span>Perfis</span>
                                        </div>
                                        <div class="nav-item" data-page="usuarios">
                                            <i class="fas fa-users-cog"></i>
                                            <span>Usuários</span>
                                        </div>
                                        <div class="nav-item" data-page="parametros-retornados">
                                            <i class="fas fa-sliders-h"></i>
                                            <span>Parâmetros</span>
                                        </div>
                                        <div class="nav-item" data-page="apis">
                                            <i class="fas fa-plug"></i>
                                            <span>APIs</span>
                                        </div>
                                        <div class="nav-item" data-page="smtp">
                                            <i class="fas fa-envelope"></i>
                                            <span>SMTP</span>
                                        </div>
                                    </div>
                                    <button class="nav-group-back-button flip-back">
                                        <i class="fas fa-chevron-left"></i> Voltar
                                    </button>
                                </div>
                            </div>
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
    
    // Expor função globalmente para uso em outros scripts
    window.navigateToPage = navigateToPage;
    window.showMessage = showMessage;
});