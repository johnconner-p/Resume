document.addEventListener('DOMContentLoaded', () => {
    fetch('resume.json')
        .then(response => response.json())
        .then(data => {
            renderProfile(data.profile);
            renderSummary(data.summary);
            renderExperience(data.experience);
            renderEducation(data.education);
            renderSkills(data.skills);
            renderProjects(data.projects);
            renderEngagements(data.engagements);
        })
        .catch(error => console.error('Error loading resume data:', error));
});

function renderProfile(profile) {
    document.getElementById('name').textContent = profile.name;
    document.getElementById('title').textContent = profile.title;
    
    const contactHtml = `
        <span>${profile.phone}</span> | 
        <span><a href="mailto:${profile.email}">${profile.email}</a></span> | 
        <span><a href="${profile.linkedin}">${profile.linkedin}</a></span>
    `;
    document.getElementById('contact').innerHTML = contactHtml;
}

function renderSummary(summary) {
    document.getElementById('summary').textContent = summary;
}

function renderExperience(experience) {
    const container = document.getElementById('experience-list');
    experience.forEach(job => {
        const item = document.createElement('div');
        item.className = 'exp-item';
        
        // Bullet points
        const bullets = job.bullets.map(b => `<li>${b}</li>`).join('');

        item.innerHTML = `
            <div class="exp-header">
                <span class="exp-role">${job.role}</span>
                <span>${job.duration}</span>
            </div>
            <div class="exp-company-row">
                <span>${job.company}</span>
                <span class="exp-location">${job.location}</span>
            </div>
            ${job.description ? `<div class="exp-description">${job.description}</div>` : ''}
            <ul class="exp-bullets">
                ${bullets}
            </ul>
        `;
        container.appendChild(item);
    });
}

function renderEducation(education) {
    const container = document.getElementById('education-list');
    education.forEach(edu => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        item.innerHTML = `
            <div class="sidebar-header">${edu.degree}</div>
            <div class="sidebar-sub">
                <span>${edu.institution}</span>
            </div>
            <div class="sidebar-sub">
                <span>${edu.year}</span>
                <span>${edu.details}</span>
            </div>
            <div class="sidebar-sub">
                <span>${edu.location}</span>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderSkills(skills) {
    const container = document.getElementById('skills-list');
    skills.forEach(skill => {
        const item = document.createElement('div');
        item.className = 'skills-category';
        item.innerHTML = `
            <div class="skills-title">${skill.category}</div>
            <div class="skills-text">${skill.items}</div>
        `;
        container.appendChild(item);
    });
}

function renderProjects(projects) {
    const container = document.getElementById('projects-list');
    projects.forEach(proj => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        
        // Bullet points (optional for projects in sidebar, but checking content)
        const bullets = proj.bullets ? `<ul class="exp-bullets" style="margin-left: 12px;">${proj.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : '';

        item.innerHTML = `
            <div class="sidebar-header">${proj.title}</div>
            <div class="sidebar-sub">
                <span>${proj.duration}</span>
                <span>${proj.subtitle}</span>
            </div>
            <div class="sidebar-desc">${proj.description}</div>
            ${bullets}
        `;
        container.appendChild(item);
    });
}

function renderEngagements(engagements) {
    const container = document.getElementById('engagements-list');
    engagements.forEach(eng => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        
        // Handle pre-formatted text (newlines)
        const desc = eng.description.replace(/\n/g, '<br>');

        item.innerHTML = `
            <div class="sidebar-header">✔ ${eng.title}</div>
            <div class="sidebar-desc" style="margin-top:2px;">${desc}</div>
        `;
        container.appendChild(item);
    });
}