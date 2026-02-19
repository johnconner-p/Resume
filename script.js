document.addEventListener('DOMContentLoaded', () => {
    fetch('resume.json')
        .then(response => response.json())
        .then(data => {
            renderResume(data);
            if (data.settings && data.settings.fontScale) {
                applyFontScale(data.settings.fontScale);
            }
        })
        .catch(error => console.error('Error loading resume data:', error));
});

function applyFontScale(scale) {
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
}

function renderResume(data) {
    // 1. Render Header
    renderHeader(data.profile);

    // 2. Render Left Column Sections
    const leftCol = document.getElementById('col-left');
    data.settings.layout.left.forEach(sectionKey => {
        renderSection(sectionKey, data, leftCol);
    });

    // 3. Render Right Column Sections
    const rightCol = document.getElementById('col-right');
    data.settings.layout.right.forEach(sectionKey => {
        renderSection(sectionKey, data, rightCol);
    });
}

function renderSection(key, data, container) {
    const sectionData = data[key];
    const sectionTitle = data.settings.titles[key] || key;
    
    // Create Section Container
    const section = document.createElement('section');
    section.className = 'section';
    section.innerHTML = `<h3 class="section-title">${sectionTitle}</h3>`;
    
    const contentDiv = document.createElement('div');
    contentDiv.id = `${key}-list`;
    section.appendChild(contentDiv);
    container.appendChild(section);

    // Delegate to specific renderers
    if (key === 'summary') renderSummary(sectionData, contentDiv);
    else if (key === 'experience') renderExperience(sectionData, contentDiv);
    else if (key === 'education') renderEducation(sectionData, contentDiv);
    else if (key === 'skills') renderSkills(sectionData, contentDiv);
    else if (key === 'projects') renderProjects(sectionData, contentDiv);
    else if (key === 'engagements') renderEngagements(sectionData, contentDiv);
}

function renderHeader(profile) {
    document.getElementById('name').innerHTML = profile.name;
    document.getElementById('title').innerHTML = profile.title;
    
    // Updated Layout: Side-by-side contact info, icons first
    const contactHtml = `
        <div class="contact-row" style="display: flex; align-items: center; gap: 6px;">
            <i class="fas fa-phone-alt" style="font-size: 0.9em;"></i>
            <span>${profile.phone}</span> 
        </div>
        <div class="contact-row" style="display: flex; align-items: center; gap: 6px;">
            <i class="fas fa-envelope" style="font-size: 0.9em;"></i>
            <span>${profile.email}</span> 
        </div>
        <div class="contact-row" style="display: flex; align-items: center; gap: 6px;">
            <i class="fab fa-linkedin" style="font-size: 0.9em;"></i>
            <span>${profile.linkedin}</span> 
        </div>
    `;
    
    const contactDiv = document.getElementById('contact');
    contactDiv.innerHTML = contactHtml;

    // Apply the structural fix (Move contact info below name/title)
    const headerLeft = document.querySelector('.header-left');
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
}

function renderSummary(summary, container) {
    container.innerHTML = `<p class="summary-text">${summary}</p>`;
}

function renderExperience(experience, container) {
    experience.forEach(job => {
        const item = document.createElement('div');
        item.className = 'exp-item';
        const bullets = job.bullets.map(b => `<li>${b}</li>`).join('');
        item.innerHTML = `
            <div class="exp-header">
                <span>${job.role}</span>
                <span>${job.duration}</span>
            </div>
            <div class="exp-sub">
                <span>${job.company}</span>
                <span>${job.location}</span>
            </div>
            ${job.description ? `<div class="exp-desc">${job.description}</div>` : ''}
            <ul class="exp-bullets">${bullets}</ul>
        `;
        container.appendChild(item);
    });
}

function renderEducation(education, container) {
    education.forEach(edu => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.innerHTML = `
            <div class="sidebar-title">${edu.degree}</div>
            <div class="sidebar-sub"><span>${edu.institution}</span></div>
             <div class="sidebar-sub sidebar-italic"><span>${edu.location}</span><span>${edu.year}</span></div>
            <div class="sidebar-sub"><span>${edu.details}</span></div>
        `;
        container.appendChild(item);
    });
}

function renderSkills(skills, container) {
    skills.forEach(skill => {
        const item = document.createElement('div');
        item.className = 'skill-group';
        item.innerHTML = `
            <div class="skill-cat">${skill.category}</div>
            <div class="skill-list">${skill.items}</div>
        `;
        container.appendChild(item);
    });
}

function renderProjects(projects, container) {
    projects.forEach(proj => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        const bullets = proj.bullets ? `<ul class="sidebar-bullets">${proj.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : '';
        item.innerHTML = `
            <div class="sidebar-title">${proj.title}</div>
            <div class="sidebar-sub sidebar-italic"><span>${proj.subtitle}</span><span>${proj.duration}</span></div>
            <div class="sidebar-desc">${proj.description}</div>
            ${bullets}
        `;
        container.appendChild(item);
    });
}

function renderEngagements(engagements, container) {
    engagements.forEach(eng => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        const desc = eng.description.replace(/\n/g, '<br>');
        item.innerHTML = `
            <div class="sidebar-title"><i class="fas fa-check-circle" style="font-size: 0.8em; margin-right: 4px;"></i> ${eng.title}</div>
            <div class="sidebar-desc" style="margin-top:2px;">${desc}</div>
        `;
        container.appendChild(item);
    });
}