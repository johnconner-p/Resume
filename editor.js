let globalData = {};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Data
    fetch('resume.json')
        .then(response => response.json())
        .then(data => {
            globalData = data;
            initEditor(data);
        })
        .catch(error => console.error('Error loading resume data:', error));
});

function initEditor(data) {
    renderSortableLists(data.settings.layout);
    renderResumeEditable(data);
    initFontSizeControl();
    initPdfControl(); 
    
    if (data.settings.fontScale) {
        updateFontScale(data.settings.fontScale);
        const slider = document.querySelector('input[type="range"]');
        if (slider) slider.value = data.settings.fontScale;
    }

    window.addBullet = function(key, index) {
        if (globalData[key] && globalData[key][index]) {
            if (!globalData[key][index].bullets) globalData[key][index].bullets = [];
            globalData[key][index].bullets.push("New bullet");
            renderResumeEditable(globalData);
        }
    };
}

// --- PDF Control Logic (Optimized for Microsoft Print to PDF) ---
function initPdfControl() {
    const sidebar = document.querySelector('.editor-sidebar');
    if (!sidebar) return;

    const group = document.createElement('div');
    group.className = 'control-group';
    group.style.borderTop = '1px solid #4a6fa5';
    group.style.marginTop = '15px';
    group.style.paddingTop = '15px';

    group.innerHTML = `
        <span class="control-label">Export</span>
        <button onclick="window.print()" class="btn btn-danger">
            <i class="fas fa-file-pdf"></i> Save as PDF
        </button>
        <div style="font-size: 10px; opacity: 0.7; margin-top: 5px;">
            <strong>Microsoft Print to PDF:</strong><br>
            • Paper Size: A4 (Important)<br>
            • Margins: None<br>
            • Scale: 100 (Code handles fit)<br>
            • Graphics: Check "Background graphics"
        </div>
    `;
    sidebar.appendChild(group);

    // Inject Print Styles to CLEAN UP the interface for PDF
    const style = document.createElement('style');
    style.innerHTML = `
        @media print {
            @page { 
                size: A4; 
                margin: 0mm;
            }
            
            html, body { 
                width: 210mm;
                height: 297mm;
                margin: 0 !important; 
                padding: 0 !important; 
                background: white !important; 
                -webkit-print-color-adjust: exact !important; 
                print-color-adjust: exact !important;
                overflow: hidden !important; /* Prevents 2nd page spillover */
            }

            /* Hide all Editor UI */
            .editor-sidebar, .control-group, button { display: none !important; }
            
            /* Remove visuals used for editing */
            [contenteditable] { 
                border: none !important; 
                outline: none !important; 
                background: transparent !important; 
                box-shadow: none !important;
                padding: 0 !important;
            }
            #name, #title { border-bottom: none !important; }

            /* Strict A4 Geometry - Balanced for Print */
            .page {
                width: 210mm !important;
                height: 296mm !important; /* 1mm safety buffer */
                margin: 0 !important;
                /* Equal top/bottom (6mm) and squeezed sides (5mm) */
                padding: 6mm 5mm 6mm 5mm !important; 
                border: none !important;
                box-shadow: none !important;
                overflow: hidden !important;
                position: relative;
            }

            /* Optimize Spacing to Squeeze Horizontally */
            .cols {
                gap: 15px !important; /* Reduced column gap */
            }

            /* Layout Optimization */
            .resume-content {
                width: 100%;
                /* 0.92 zoom allows standard font sizes to fit perfectly on A4 */
                zoom: 0.92; 
            }

            /* Refined Spacing for Density */
            .resume-header { margin-bottom: 12px !important; }
            .section { margin-bottom: 10px !important; }
            .exp-item, .sidebar-item { margin-bottom: 6px !important; } /* Tighter item spacing */
            
            /* Text Flow Optimization */
            p, li, .exp-desc, .sidebar-desc { 
                line-height: 1.35 !important; 
            }
            ul.exp-bullets, ul.sidebar-bullets {
                margin-bottom: 2px !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// --- Font Size Control ---
function initFontSizeControl() {
    const sidebar = document.querySelector('.editor-sidebar');
    if (!sidebar) return;

    const globalGroup = document.createElement('div');
    globalGroup.className = 'control-group';
    globalGroup.style.borderTop = '1px solid #4a6fa5';
    globalGroup.style.marginTop = '15px';
    globalGroup.style.paddingTop = '15px';
    
    globalGroup.innerHTML = `
        <span class="control-label">Global Font Scale</span>
        <input type="range" min="0.8" max="1.3" step="0.05" value="1" 
               oninput="updateFontScale(this.value)" 
               style="width: 100%; cursor: pointer;">
        <div style="font-size: 10px; opacity: 0.7; margin-top: 5px; text-align: right;">(80% - 130%)</div>
    `;
    sidebar.appendChild(globalGroup);

    const selectionGroup = document.createElement('div');
    selectionGroup.className = 'control-group';
    selectionGroup.style.borderTop = '1px solid #4a6fa5';
    selectionGroup.style.marginTop = '15px';
    selectionGroup.style.paddingTop = '15px';

    selectionGroup.innerHTML = `
        <span class="control-label">Selected Text Size (pt)</span>
        <div style="display:flex; gap:5px; align-items: center;">
            <input type="number" id="fontSizeInput" value="11" style="width: 60px; padding: 5px; border-radius: 4px; border: 1px solid #ccc;">
            <button onclick="applySelectionFontSize()" class="btn btn-primary" style="margin:0; padding: 5px 10px; font-size: 12px; flex: 1;">Apply</button>
        </div>
        <div style="font-size: 10px; opacity: 0.7; margin-top: 5px;">Highlight text, set size, click Apply.</div>
    `;
    sidebar.appendChild(selectionGroup);
}

window.updateFontScale = function(scale) {
    if (globalData && globalData.settings) {
        globalData.settings.fontScale = scale;
    }

    const styleId = 'dynamic-font-scale';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = styleId;
        document.head.appendChild(styleTag);
    }

    styleTag.innerHTML = `
        body { font-size: ${10.5 * scale}pt !important; }
        .resume-header h1 { font-size: ${24 * scale}pt !important; }
        .resume-header h2 { font-size: ${10 * scale}pt !important; }
        .section-title { font-size: ${11 * scale}pt !important; }
        .exp-header { font-size: ${10.5 * scale}pt !important; }
        .sidebar-title { font-size: ${10.5 * scale}pt !important; }
        .exp-desc, .sidebar-desc, .skill-list, li { font-size: ${10 * scale}pt !important; }
        .exp-sub, .sidebar-sub { font-size: ${10 * scale}pt !important; }
        .contact-row { font-size: ${9 * scale}pt !important; }
        .contact-row i { font-size: ${10 * scale}pt !important; }
    `;
};

window.applySelectionFontSize = function() {
    const sizeInput = document.getElementById('fontSizeInput');
    const size = sizeInput.value;
    if (!size) return;

    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        if (!document.getElementById('resume-container').contains(range.commonAncestorContainer)) {
             alert('Please select text inside the resume.');
             return;
        }

        const span = document.createElement('span');
        span.style.fontSize = size + 'pt';
        
        try {
            const content = range.extractContents();
            span.appendChild(content);
            range.insertNode(span);
            
            let el = span.closest('[data-path]');
            if (el) {
                const path = el.dataset.path.split('.');
                const value = el.innerHTML;
                let ref = globalData;
                for (let i = 0; i < path.length - 1; i++) {
                    ref = ref[path[i]];
                }
                ref[path[path.length - 1]] = value;
                console.log('Updated style for:', path.join('.'));
            }
            selection.removeAllRanges();
        } catch (e) {
            console.error("Could not apply font size", e);
            alert("Could not apply style.");
        }
    } else {
        alert('Please select some text first.');
    }
};

/* --- RENDERERS --- */
function renderResumeEditable(data) {
    const nameEl = document.getElementById('name');
    nameEl.innerHTML = data.profile.name; 
    nameEl.setAttribute('contenteditable', true);
    nameEl.setAttribute('data-path', 'profile.name');
    nameEl.style.borderBottom = '1px dashed #ccc';

    const titleEl = document.getElementById('title');
    titleEl.innerHTML = data.profile.title;
    titleEl.setAttribute('contenteditable', true);
    titleEl.setAttribute('data-path', 'profile.title');
    titleEl.style.borderBottom = '1px dashed #ccc'; 

    const headerLeft = document.querySelector('.header-left');
    const contactDiv = document.getElementById('contact');
    
    if (headerLeft && contactDiv && contactDiv.parentElement !== headerLeft) {
        headerLeft.appendChild(contactDiv);
        contactDiv.style.textAlign = 'left';
        contactDiv.style.marginTop = '8px';
        contactDiv.style.display = 'flex';
        contactDiv.style.flexWrap = 'wrap';
        contactDiv.style.gap = '15px';
        contactDiv.style.alignItems = 'center';
        contactDiv.classList.remove('header-right');
    }

    renderHeaderContacts(data.profile);

    const leftCol = document.getElementById('col-left');
    const rightCol = document.getElementById('col-right');
    leftCol.innerHTML = '';
    rightCol.innerHTML = '';

    data.settings.layout.left.forEach(key => renderSectionEditable(key, data, leftCol));
    data.settings.layout.right.forEach(key => renderSectionEditable(key, data, rightCol));

    attachLiveUpdaters();
}

function renderSectionEditable(key, data, container) {
    const sectionData = data[key];
    const sectionTitle = data.settings.titles[key] || key;
    
    const section = document.createElement('section');
    section.className = 'section';
    section.dataset.key = key; 

    section.innerHTML = `
        <h3 class="section-title" contenteditable="true" onblur="updateTitle('${key}', this.innerText)">${sectionTitle}</h3>
    `;
    
    const contentDiv = document.createElement('div');
    section.appendChild(contentDiv);
    container.appendChild(section);

    if (key === 'summary') {
        contentDiv.innerHTML = `<p class="summary-text" contenteditable="true" data-path="summary">${sectionData}</p>`;
    } else if (Array.isArray(sectionData)) {
        if (key === 'experience') renderExperienceEditable(sectionData, contentDiv, key);
        else if (key === 'education') renderEducationEditable(sectionData, contentDiv, key);
        else if (key === 'skills') renderSkillsEditable(sectionData, contentDiv, key);
        else if (key === 'projects') renderProjectsEditable(sectionData, contentDiv, key);
        else if (key === 'engagements') renderEngagementsEditable(sectionData, contentDiv, key);
    }
}

function renderExperienceEditable(items, container, key) {
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'exp-item';
        // Added calendar icon for duration and map marker for location
        div.innerHTML = `
            <div class="exp-header">
                <span contenteditable="true" data-path="${key}.${index}.role">${item.role}</span>
                <span style="display:flex; align-items:center;">
                    <i class="fas fa-calendar-alt" style="margin-right: 4px; font-size: 0.85em;"></i>
                    <span contenteditable="true" data-path="${key}.${index}.duration">${item.duration}</span>
                </span>
            </div>
            <div class="exp-sub">
                <span contenteditable="true" data-path="${key}.${index}.company">${item.company}</span>
                <span style="display:flex; align-items:center;">
                    <i class="fas fa-map-marker-alt" style="margin-right: 4px; font-size: 0.85em;"></i>
                    <span contenteditable="true" data-path="${key}.${index}.location">${item.location}</span>
                </span>
            </div>
            <div class="exp-desc" contenteditable="true" data-path="${key}.${index}.description">${item.description || ''}</div>
            <ul class="exp-bullets">
                ${item.bullets.map((b, bIndex) => `<li contenteditable="true" data-path="${key}.${index}.bullets.${bIndex}">${b}</li>`).join('')}
            </ul>
            <button onclick="addBullet('${key}', ${index})" style="background:none; border:none; color:blue; font-size:10px; cursor:pointer; margin-left:15px;">+ Add Bullet</button>
        `;
        container.appendChild(div);
    });
}

function renderEducationEditable(items, container, key) {
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'sidebar-item';
        // Added icons to location and year
        div.innerHTML = `
            <div class="sidebar-title" contenteditable="true" data-path="${key}.${index}.degree">${item.degree}</div>
            <div class="sidebar-sub"><span contenteditable="true" data-path="${key}.${index}.institution">${item.institution}</span></div>
            <div class="sidebar-sub sidebar-italic">
                <span style="display:flex; align-items:center;">
                    <i class="fas fa-map-marker-alt" style="margin-right: 4px; font-size: 0.85em;"></i>
                    <span contenteditable="true" data-path="${key}.${index}.location">${item.location}</span>
                </span>
                <span style="display:flex; align-items:center;">
                    <i class="fas fa-calendar-alt" style="margin-right: 4px; font-size: 0.85em;"></i>
                    <span contenteditable="true" data-path="${key}.${index}.year">${item.year}</span>
                </span>
            </div>
            <div class="sidebar-sub"><span contenteditable="true" data-path="${key}.${index}.details">${item.details}</span></div>
        `;
        container.appendChild(div);
    });
}

function renderSkillsEditable(items, container, key) {
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'skill-group';
        div.innerHTML = `
            <div class="skill-cat" contenteditable="true" data-path="${key}.${index}.category">${item.category}</div>
            <div class="skill-list" contenteditable="true" data-path="${key}.${index}.items">${item.items}</div>
        `;
        container.appendChild(div);
    });
}

function renderProjectsEditable(items, container, key) {
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'sidebar-item';
        // Added calendar icon for duration
        div.innerHTML = `
            <div class="sidebar-title" contenteditable="true" data-path="${key}.${index}.title">${item.title}</div>
            <div class="sidebar-sub sidebar-italic">
                <span contenteditable="true" data-path="${key}.${index}.subtitle">${item.subtitle}</span>
                <span style="display:flex; align-items:center;">
                    <i class="fas fa-calendar-alt" style="margin-right: 4px; font-size: 0.85em;"></i>
                    <span contenteditable="true" data-path="${key}.${index}.duration">${item.duration}</span>
                </span>
            </div>
            <div class="sidebar-desc" contenteditable="true" data-path="${key}.${index}.description">${item.description}</div>
            ${item.bullets ? `<ul class="sidebar-bullets">${item.bullets.map((b, bi) => `<li contenteditable="true" data-path="${key}.${index}.bullets.${bi}">${b}</li>`).join('')}</ul>` : ''}
            <button onclick="addBullet('${key}', ${index})" style="background:none; border:none; color:blue; font-size:10px; cursor:pointer; margin-left:12px;">+ Add Bullet</button>
        `;
        container.appendChild(div);
    });
}

function renderEngagementsEditable(items, container, key) {
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'sidebar-item';
        div.innerHTML = `
            <div class="sidebar-title"><i class="fas fa-check-circle"></i> <span contenteditable="true" data-path="${key}.${index}.title">${item.title}</span></div>
            <div class="sidebar-desc" contenteditable="true" data-path="${key}.${index}.description">${item.description}</div>
        `;
        container.appendChild(div);
    });
}

function renderHeaderContacts(profile) {
    const contactHtml = `
        <div class="contact-row" style="display: flex; align-items: center; gap: 6px;">
            <i class="fas fa-phone-alt" style="font-size: 0.9em;"></i>
            <span contenteditable="true" data-path="profile.phone" style="min-width: 50px; cursor: text;">${profile.phone}</span> 
        </div>
        <div class="contact-row" style="display: flex; align-items: center; gap: 6px;">
            <i class="fas fa-envelope" style="font-size: 0.9em;"></i>
            <span contenteditable="true" data-path="profile.email" style="min-width: 50px; cursor: text;">${profile.email}</span> 
        </div>
        <div class="contact-row" style="display: flex; align-items: center; gap: 6px;">
            <i class="fab fa-linkedin" style="font-size: 0.9em;"></i>
            <span contenteditable="true" data-path="profile.linkedin" style="min-width: 50px; cursor: text;">${profile.linkedin}</span> 
        </div>
    `;
    document.getElementById('contact').innerHTML = contactHtml;
}

function attachLiveUpdaters() {
    document.querySelectorAll('[data-path]').forEach(el => {
        el.addEventListener('blur', (e) => {
            const path = e.target.dataset.path.split('.');
            const value = e.target.innerHTML; 
            
            let ref = globalData;
            for (let i = 0; i < path.length - 1; i++) {
                ref = ref[path[i]];
            }
            ref[path[path.length - 1]] = value;
        });
    });
}

function updateTitle(key, newTitle) {
    globalData.settings.titles[key] = newTitle;
}

function updateSummary(newText) {
    globalData.summary = newText;
}

function renderSortableLists(layout) {
    const listLeft = document.getElementById('list-left');
    const listRight = document.getElementById('list-right');
    listLeft.innerHTML = '';
    listRight.innerHTML = '';

    const createLi = (id) => {
        const li = document.createElement('li');
        li.className = 'sortable-item';
        li.dataset.id = id;
        li.innerText = globalData.settings.titles[id] || id.toUpperCase();
        return li;
    };

    layout.left.forEach(id => listLeft.appendChild(createLi(id)));
    layout.right.forEach(id => listRight.appendChild(createLi(id)));

    new Sortable(listLeft, { group: 'sections', animation: 150 });
    new Sortable(listRight, { group: 'sections', animation: 150 });
}

function updateLayoutFromSidebar() {
    const leftItems = Array.from(document.getElementById('list-left').children).map(li => li.dataset.id);
    const rightItems = Array.from(document.getElementById('list-right').children).map(li => li.dataset.id);

    globalData.settings.layout.left = leftItems;
    globalData.settings.layout.right = rightItems;

    renderResumeEditable(globalData);
}

function downloadJson() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(globalData, null, 4));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "resume.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}