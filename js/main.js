// Dados iniciais (simulando um banco de dados)
const pointsData = {
    palmas: {
        description: "Capital do Tocantins, conhecida por sua arquitetura moderna e belas praias fluviais.",
        media: []
    },
    jalapao: {
        description: "Conhecido como o deserto das águas, com dunas, cachoeiras e fervedouros.",
        media: []
    },
    cantao: {
        description: "Área de preservação com rica biodiversidade e belas paisagens naturais.",
        media: []
    },
    pequizeiro: {
        description: "Lagoa de águas cristalinas cercada por vegetação típica do cerrado.",
        media: []
    },
    taquarucu: {
        description: "Distrito de Palmas com cachoeiras e trilhas ecológicas.",
        media: []
    }
};

// Carregar dados do localStorage se existirem
function loadData() {
    const savedData = localStorage.getItem('tocantinsPointsData');
    if (savedData) {
        Object.assign(pointsData, JSON.parse(savedData));
    }
    
    // Atualizar as descrições iniciais nos textareas
    for (const point in pointsData) {
        const textarea = document.getElementById(`${point}-text`);
        if (textarea) {
            textarea.value = pointsData[point].description;
        }
    }
    
    // Carregar mídias nas galerias
    renderAllGalleries();
}

// Salvar dados no localStorage
function saveData() {
    localStorage.setItem('tocantinsPointsData', JSON.stringify(pointsData));
}

// Renderizar todas as galerias
function renderAllGalleries() {
    for (const point in pointsData) {
        renderGallery(point);
    }
}

// Renderizar a galeria de um ponto específico
function renderGallery(point) {
    const gallery = document.getElementById(`${point}-gallery`);
    if (!gallery) return;
    
    gallery.innerHTML = '';
    
    pointsData[point].media.forEach((mediaItem, index) => {
        const mediaElement = mediaItem.type === 'image' ? 
            `<img src="${mediaItem.url}" alt="${mediaItem.caption || 'Imagem do ponto turístico'}" 
                 onclick="openModal('${point}', ${index})">` :
            `<video controls onclick="openModal('${point}', ${index}, event)">
                <source src="${mediaItem.url}" type="video/mp4">
                Seu navegador não suporta vídeos.
             </video>`;
        
        const caption = mediaItem.caption ? `<p class="media-caption">${mediaItem.caption}</p>` : '';
        
        gallery.innerHTML += `
            <div class="gallery-item">
                ${mediaElement}
                ${caption}
                <button class="delete-btn" onclick="deleteMedia('${point}', ${index})">×</button>
            </div>
        `;
    });
}

// Adicionar conteúdo a um ponto turístico
function addContent(point) {
    const textarea = document.getElementById(`${point}-text`);
    const fileInput = document.getElementById(`${point}-media`);
    
    // Atualizar descrição
    if (textarea) {
        pointsData[point].description = textarea.value;
    }
    
    // Adicionar novas mídias
    if (fileInput && fileInput.files.length > 0) {
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
                pointsData[point].media.push({
                    type: mediaType,
                    url: e.target.result,
                    caption: '', // Pode ser expandido para incluir legendas
                    timestamp: new Date().toISOString() // Para ordenação
                });
                
                renderGallery(point);
                saveData();
            };
            
            reader.onerror = function() {
                console.error('Erro ao ler o arquivo:', file.name);
            };
            
            reader.readAsDataURL(file);
        }
    } else {
        // Apenas atualizar a descrição se não houver arquivos
        renderGallery(point);
        saveData();
    }
    
    // Limpar o input de arquivo
    if (fileInput) {
        fileInput.value = '';
    }
}

// Abrir modal com mídia em tamanho maior
function openModal(point, index, event = null) {
    // Prevenir a abertura do modal se o clique foi em um vídeo que está sendo controlado
    if (event && event.target.tagName === 'VIDEO') {
        const video = event.target;
        // Se o vídeo está tocando ou se o clique foi nos controles
        if (!video.paused || (event.offsetY > video.clientHeight - 30)) {
            return;
        }
    }
    
    const modal = document.getElementById('media-modal');
    const modalContent = document.getElementById('modal-content');
    const mediaItem = pointsData[point].media[index];
    
    if (!mediaItem) return;
    
    if (mediaItem.type === 'image') {
        modalContent.innerHTML = `
            <img src="${mediaItem.url}" alt="${mediaItem.caption || 'Imagem em tela cheia'}">
            ${mediaItem.caption ? `<p class="modal-caption">${mediaItem.caption}</p>` : ''}
            <div class="modal-actions">
                <button onclick="editCaption('${point}', ${index})">Editar Legenda</button>
            </div>
        `;
    } else {
        modalContent.innerHTML = `
            <video controls autoplay>
                <source src="${mediaItem.url}" type="video/mp4">
                Seu navegador não suporta vídeos.
            </video>
            ${mediaItem.caption ? `<p class="modal-caption">${mediaItem.caption}</p>` : ''}
            <div class="modal-actions">
                <button onclick="editCaption('${point}', ${index})">Editar Legenda</button>
            </div>
        `;
    }
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevenir scroll da página
}

// Fechar modal
function closeModal() {
    document.getElementById('media-modal').style.display = 'none';
    document.body.style.overflow = 'auto'; // Restaurar scroll da página
}

// Editar legenda de uma mídia
function editCaption(point, index) {
    const mediaItem = pointsData[point].media[index];
    if (!mediaItem) return;
    
    const newCaption = prompt('Editar legenda:', mediaItem.caption || '');
    if (newCaption !== null) { // Não faz nada se o usuário cancelar
        mediaItem.caption = newCaption;
        renderGallery(point);
        saveData();
        closeModal();
        openModal(point, index); // Reabre o modal com a legenda atualizada
    }
}

// Excluir uma mídia
function deleteMedia(point, index) {
    if (confirm('Tem certeza que deseja excluir esta mídia?')) {
        pointsData[point].media.splice(index, 1);
        renderGallery(point);
        saveData();
    }
}

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    
    // Configurar eventos dos pontos no mapa
    const points = document.querySelectorAll('.point');
    const infoPanels = document.querySelectorAll('.point-info');
    
    points.forEach(point => {
        point.addEventListener('click', function() {
            const pointName = this.getAttribute('data-point');
            
            // Esconder todos os painéis de informação
            infoPanels.forEach(panel => {
                panel.classList.remove('active');
            });
            
            // Mostrar o painel correspondente
            const targetPanel = document.getElementById(`${pointName}-info`);
            if (targetPanel) {
                targetPanel.classList.add('active');
            }
        });
    });
    
    // Mostrar o primeiro painel por padrão
    if (infoPanels.length > 0) {
        infoPanels[0].classList.add('active');
    }
    
    // Fechar modal ao clicar fora do conteúdo ou pressionar ESC
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('media-modal');
        if (event.target === modal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
    
    // Adicionar tooltips aos pontos do mapa
    points.forEach(point => {
        const pointName = point.getAttribute('data-point');
        point.setAttribute('title', pointName.charAt(0).toUpperCase() + pointName.slice(1));
    });
});