let globalData = {};

document.addEventListener('DOMContentLoaded', () => {
    fetch('resume.json')
        .then(response => response.json())
        .then(data => {
            globalData = data;
            initEditor(data);
        })
        .catch(error => console.error('Error loading resume data:', error));
});

function initEditor(data) {
    // 1. Render sidebar lists for reordering
    renderSortableLists(data.settings.layout);

    // 2. Render the Visual Resume
    renderResumeEditable(data);

    // 3. Expose helper functions for buttons
    window.addBullet = function(key, index) {
        if (globalData[key] && globalData[key][index]) {
            if (!globalData[key][index].bullets) globalData[key][index].bullets = [];
            globalData[key][index].bullets.push("New bullet");
            renderResumeEditable(globalData); // Re-render to show new bullet
        }
    };
}

/* --- RENDERERS (With ContentEditable) --- */
function renderResumeEditable(data) {
    // Header - Make Name and Title Editable
    const nameEl = document.getElementById('name');
    nameEl.textContent = data.profile.name;
    nameEl.setAttribute('contenteditable', true);
    nameEl.setAttribute('data-path', 'profile.name');
    nameEl.style.borderBottom = '1px dashed #ccc'; // Visual cue

    const titleEl = document.getElementById('title');
    titleEl.textContent = data.profile.title;
    titleEl.setAttribute('contenteditable', true);
    titleEl.setAttribute('data-path', 'profile.title');
    titleEl.style.borderBottom = '1px dashed #ccc'; // Visual cue

    renderHeaderContacts(data.profile);

    // Clear Columns
    const leftCol = document.getElementById('col-left');
    const rightCol = document.getElementById('col-right');
    leftCol.innerHTML = '';
    rightCol.innerHTML = '';

    // Render Left
    data.settings.layout.left.forEach(key => renderSectionEditable(key, data, leftCol));
    // Render Right
    data.settings.layout.right.forEach(key => renderSectionEditable(key, data, rightCol));

    // Attach Input Listeners to update Global Data on change
    attachLiveUpdaters();
}

function renderSectionEditable(key, data, container) {
    const sectionData = data[key];
    const sectionTitle = data.settings.titles[key] || key;
    
    const section = document.createElement('section');
    section.className = 'section';
    section.dataset.key = key; 

    // Editable Title
    section.innerHTML = `
        <h3 class="section-title" contenteditable="true" onblur="updateTitle('${key}', this.innerText)">${sectionTitle}</h3>
    `;
    
    const contentDiv = document.createElement('div');
    section.appendChild(contentDiv);
    container.appendChild(section);

    // Render Content based on type
    if (key === 'summary') {
        contentDiv.innerHTML = `<p class="summary-text" contenteditable="true" onblur="updateSummary(this.innerText)">${sectionData}</p>`;
    } else if (Array.isArray(sectionData)) {
        if (key === 'experience') renderExperienceEditable(sectionData, contentDiv, key);
        else if (key === 'education') renderEducationEditable(sectionData, contentDiv, key);
        else if (key === 'skills') renderSkillsEditable(sectionData, contentDiv, key);
        else if (key === 'projects') renderProjectsEditable(sectionData, contentDiv, key);
        else if (key === 'engagements') renderEngagementsEditable(sectionData, contentDiv, key);
    }
}

// --- Specific Renderers for Editable Lists ---

function renderExperienceEditable(items, container, key) {
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'exp-item';
        div.innerHTML = `
            <div class="exp-header">
                <span contenteditable="true" data-path="${key}.${index}.role">${item.role}</span>
                <span contenteditable="true" data-path="${key}.${index}.duration">${item.duration}</span>
            </div>
            <div class="exp-sub">
                <span contenteditable="true" data-path="${key}.${index}.company">${item.company}</span>
                <span contenteditable="true" data-path="${key}.${index}.location">${item.location}</span>
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
        div.innerHTML = `
            <div class="sidebar-title" contenteditable="true" data-path="${key}.${index}.degree">${item.degree}</div>
            <div class="sidebar-sub"><span contenteditable="true" data-path="${key}.${index}.institution">${item.institution}</span></div>
            <div class="sidebar-sub sidebar-italic"><span contenteditable="true" data-path="${key}.${index}.location">${item.location}</span><span contenteditable="true" data-path="${key}.${index}.year">${item.year}</span></div>
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
        div.innerHTML = `
            <div class="sidebar-title" contenteditable="true" data-path="${key}.${index}.title">${item.title}</div>
            <div class="sidebar-sub sidebar-italic">
                <span contenteditable="true" data-path="${key}.${index}.subtitle">${item.subtitle}</span>
                <span contenteditable="true" data-path="${key}.${index}.duration">${item.duration}</span>
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
    // Enable editing for contact details with better click targets
    const contactHtml = `
        <div class="contact-row">
            <span contenteditable="true" data-path="profile.phone" style="min-width: 50px; display: inline-block; cursor: text;">${profile.phone}</span> 
            <i class="fas fa-phone-alt"></i>
        </div>
        <div class="contact-row">
            <span contenteditable="true" data-path="profile.email" style="min-width: 50px; display: inline-block; cursor: text;">${profile.email}</span> 
            <i class="fas fa-envelope"></i>
        </div>
        <div class="contact-row">
            <span contenteditable="true" data-path="profile.linkedin" style="min-width: 50px; display: inline-block; cursor: text;">${profile.linkedin}</span> 
            <i class="fab fa-linkedin"></i>
        </div>
    `;
    document.getElementById('contact').innerHTML = contactHtml;
}

/* --- LOGIC: Updates & Drag-Drop --- */

function attachLiveUpdaters() {
    document.querySelectorAll('[data-path]').forEach(el => {
        el.addEventListener('blur', (e) => {
            const path = e.target.dataset.path.split('.');
            const value = e.target.innerText;
            
            let ref = globalData;
            for (let i = 0; i < path.length - 1; i++) {
                ref = ref[path[i]];
            }
            ref[path[path.length - 1]] = value;
            console.log('Updated:', path.join('.'), value);
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
    
    // Clear lists before re-rendering
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