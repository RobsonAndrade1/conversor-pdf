// Importa a classe jsPDF da biblioteca carregada no HTML
const { jsPDF } = window.jspdf;

// --- SELEÇÃO DE ELEMENTOS DO DOM (PASSO 1 - EDITOR) ---
const editorInput = document.getElementById('editor-input'); // Input de arquivo escondido
const editorDropZone = document.getElementById('editor-drop-zone'); // Área de arraste azul tracejada
const editorPreview = document.getElementById('editor-preview'); // Container onde as miniaturas aparecem
const sendToPdfBtn = document.getElementById('send-to-pdf-btn'); // Botão "Confirmar e Enviar"

// --- SELEÇÃO DE ELEMENTOS DO DOM (PASSO 2 - PDF) ---
const pdfPreview = document.getElementById('pdf-preview'); // Container final de organização
const convertBtn = document.getElementById('convert-btn'); // Botão "Gerar PDF"
const clearBtn = document.getElementById('clear-btn'); // Botão "Limpar Tudo"
const counterText = document.getElementById('counter'); // Texto indicador de quantidade de fotos

// --- ESTADOS GLOBAIS ---
let editorList = []; // Armazena objetos das fotos originais (Passo 1)
let pdfList = [];    // Armazena objetos das fotos tratadas (Passo 2)
let currentViewMode = 'grid'; // Controla se a exibição está em grade ou lista

// --- FUNÇÃO: ALTERNAR VISUALIZAÇÃO (GRID/LISTA) ---
window.toggleView = (event) => {
    event.stopPropagation(); // Impede que o clique no botão ative o seletor de arquivos
    
    // Inverte o modo de visualização
    currentViewMode = (currentViewMode === 'grid') ? 'list' : 'grid';

    // Aplica ou remove a classe CSS de lista em todos os containers de preview
    document.querySelectorAll('.preview-grid').forEach(grid => {
        if (currentViewMode === 'list') grid.classList.add('list-view');
        else grid.classList.remove('list-view');
    });

    // Atualiza visualmente o ícone dos botões de Toggle em ambas as seções
    [document.getElementById('toggle-btn-1'), document.getElementById('toggle-btn-2')].forEach(btn => {
        if (currentViewMode === 'list') btn.classList.replace('grid-mode', 'list-mode');
        else btn.classList.replace('list-mode', 'grid-mode');
    });
};

// --- FUNÇÃO: CLIQUE NA ÁREA DE ARRASTE ---
editorDropZone.onclick = (e) => {
    // BUG FIX: Se o clique foi em um botão ou em um card de foto, não faz nada
    if (e.target.closest('button') || e.target.closest('.img-card')) return;
    editorInput.click(); // Caso contrário, simula o clique no seletor de arquivos
};

// --- FUNÇÃO: PARAR PROPAGAÇÃO (STOP BUBBLE) ---
// Evita que eventos de clique em botões internos "subam" para os elementos pais
function stopBubble(e) { e.stopPropagation(); }

// --- FUNÇÃO: EXCLUIR IMAGEM ---
window.deleteImage = (id, isEditor, event) => {
    stopBubble(event); // Impede abrir o seletor de arquivos ao clicar na lixeira
    
    if (isEditor) {
        // Remove da lista do Passo 1 e limpa o HTML correspondente
        editorList = editorList.filter(p => p.id !== id);
        document.getElementById(`card-${id}`).remove();
        sendToPdfBtn.disabled = editorList.length === 0;
    } else {
        // Remove da lista do Passo 2 e limpa o HTML correspondente
        pdfList = pdfList.filter(p => p.id !== id);
        document.getElementById(`card-pdf-${id}`).remove();
        updateUI(); // Atualiza contador e estado do botão Gerar PDF
    }
};

// --- FUNÇÃO: ROTACIONAR IMAGEM (VISUAL) ---
window.rotateEditorImage = (id, event) => {
    stopBubble(event); // Impede abrir o seletor de arquivos ao clicar no botão girar
    const item = editorList.find(p => p.id === id);
    
    // Soma 90 graus à rotação atual (ciclo de 0, 90, 180, 270)
    item.rotation = (item.rotation + 90) % 360;
    
    // Aplica a rotação visual na imagem usando CSS Transform
    document.getElementById(`img-${id}`).style.transform = `rotate(${item.rotation}deg)`;
};

// --- CONFIGURAÇÃO DE DRAG & DROP (PASSO 1) ---
['dragover', 'dragleave', 'drop'].forEach(evt => {
    // Previne que o navegador abra a imagem em uma nova aba
    editorDropZone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); });
});

editorDropZone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files; // Captura os arquivos soltos
    if (files.length > 0) handleEditorFiles(files);
});

// Evento disparado quando o usuário escolhe arquivos pelo seletor padrão
editorInput.onchange = (e) => handleEditorFiles(e.target.files);

// --- FUNÇÃO: TRATAR ARQUIVOS RECEBIDOS ---
function handleEditorFiles(files) {
    Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file); // Cria link temporário para a foto
        const id = Math.random().toString(36).substr(2, 9); // Gera ID único para o card
        
        // Adiciona dados da foto à lista de controle
        editorList.push({ id, url, file, rotation: 0 });

        // Cria o HTML do card de visualização
        const card = document.createElement('div');
        card.className = 'img-card';
        card.id = `card-${id}`;
        card.innerHTML = `
            <img src="${url}" class="thumbnail" id="img-${id}">
            <button class="delete-btn" onclick="deleteImage('${id}', true, event)">🗑</button>
            <button class="rotate-btn" onclick="rotateEditorImage('${id}', event)">↻</button>
        `;
        editorPreview.appendChild(card);
    });
    // Habilita o botão de envio se houver fotos
    sendToPdfBtn.disabled = editorList.length === 0;
}

// --- FUNÇÃO: CONFIRMAR E ENVIAR PARA O PASSO 2 ---
sendToPdfBtn.onclick = async () => {
    sendToPdfBtn.disabled = true;
    sendToPdfBtn.innerText = "Processando...";

    // Percorre cada foto do editor para gerar uma nova imagem "limpa" (sem metadados e rotacionada)
    for (const item of editorList) {
        const cleanBlobUrl = await generateCleanImage(item);
        const id = Math.random().toString(36).substr(2, 9);
        
        pdfList.push({ id, blobUrl: cleanBlobUrl });

        // Cria o card na seção de PDF (Passo 2)
        const card = document.createElement('div');
        card.className = 'img-card';
        card.id = `card-pdf-${id}`;
        card.dataset.id = id; // Atributo necessário para o Sortable (arraste) identificar o item
        card.innerHTML = `
            <img src="${cleanBlobUrl}" class="thumbnail">
            <button class="delete-btn" onclick="deleteImage('${id}', false, event)">🗑</button>
        `;
        pdfPreview.appendChild(card);
    }
    
    // Limpa o Passo 1 após o envio
    editorList = [];
    editorPreview.innerHTML = '';
    sendToPdfBtn.innerText = "Confirmar Posições e Enviar";
    updateUI();
};

// --- FUNÇÃO: GERAR IMAGEM LIMPA VIA CANVAS (NORMALIZAÇÃO) ---
async function generateCleanImage(item) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = item.url;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const rot = item.rotation;
            
            // Define o tamanho do canvas (inverte se a rotação for 90 ou 270 graus)
            if (rot === 90 || rot === 270) { 
                canvas.width = img.height; 
                canvas.height = img.width; 
            } else { 
                canvas.width = img.width; 
                canvas.height = img.height; 
            }
            
            // Aplica a rotação definitiva nos pixels da imagem
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rot * Math.PI / 180);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);
            
            // Converte o canvas em um novo arquivo (Blob) JPG
            canvas.toBlob((blob) => resolve(URL.createObjectURL(blob)), 'image/jpeg', 0.85);
        };
    });
}

// --- INICIALIZAÇÃO DO ARRASTE (SORTABLE JS) ---
// Permite reordenar as fotos no Passo 1
new Sortable(editorPreview, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    onEnd: () => {
        const ids = Array.from(editorPreview.children).map(card => card.id.replace('card-', ''));
        editorList.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    }
});

// Permite reordenar as fotos no Passo 2
new Sortable(pdfPreview, {
    animation: 150,
    ghostClass: 'sortable-ghost',
    onEnd: () => {
        const ids = Array.from(pdfPreview.children).map(card => card.dataset.id);
        pdfList.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    }
});

// --- FUNÇÃO: GERAR O PDF FINAL ---
convertBtn.onclick = async () => {
    const doc = new jsPDF('p', 'mm', 'a4'); // Cria o PDF no formato A4
    const margin = 10; // Margem de segurança de 10mm
    convertBtn.disabled = true;

    for (let i = 0; i < pdfList.length; i++) {
        if (i > 0) doc.addPage(); // Adiciona nova página para cada foto a partir da segunda
        
        const img = new Image();
        img.src = pdfList[i].blobUrl;
        await new Promise(r => img.onload = r); // Aguarda a imagem carregar na memória
        
        const pW = doc.internal.pageSize.getWidth();
        const pH = doc.internal.pageSize.getHeight();
        
        // Calcula a proporção ideal para a foto caber na página A4 respeitando as margens
        const ratio = Math.min((pW - margin*2)/img.width, (pH - margin*2)/img.height);
        
        // Centraliza e insere a imagem no documento PDF
        doc.addImage(pdfList[i].blobUrl, 'JPEG', (pW - img.width*ratio)/2, (pH - img.height*ratio)/2, img.width*ratio, img.height*ratio);
    }
    
    doc.save('pdf_gerado.pdf'); // Faz o download automático do arquivo
    convertBtn.disabled = false;
};

// --- FUNÇÃO: LIMPAR TUDO NO PASSO 2 ---
clearBtn.onclick = () => { 
    pdfList = []; 
    pdfPreview.innerHTML = ''; 
    updateUI(); 
};

// --- FUNÇÃO: ATUALIZAR INTERFACE (CONTADOR E BOTÕES) ---
function updateUI() { 
    counterText.innerText = `Fotos prontas: ${pdfList.length}`; 
    convertBtn.disabled = pdfList.length === 0; 
}