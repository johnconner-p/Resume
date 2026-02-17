document.addEventListener('DOMContentLoaded', () => {
    fetch('resume.json')
        .then(response => response.json())
        .then(data => {
            renderResume(data);
        })
        .catch(error => console.error('Error loading resume data:', error));
});

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
    document.getElementById('name').textContent = profile.name;
    document.getElementById('title').textContent = profile.title;
    
    const contactHtml = `
        <div class="contact-row">
            <span>${profile.phone}</span>
            <i class="fas fa-phone-alt"></i>
        </div>
        <div class="contact-row">
            <a href="mailto:${profile.email}">${profile.email}</a>
            <i class="fas fa-envelope"></i>
        </div>
        <div class="contact-row">
            <a href="${profile.linkedin}" target="_blank">linkedin.com/in/piyush07rai</a>
            <i class="fab fa-linkedin"></i>
        </div>
    `;
    document.getElementById('contact').innerHTML = contactHtml;
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