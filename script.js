document.addEventListener('DOMContentLoaded', () => {
    fetch('resume.json')
        .then(response => response.json())
        .then(data => {
            renderHeader(data.profile);
            renderSummary(data.summary);
            renderExperience(data.experience);
            renderEducation(data.education);
            renderSkills(data.skills);
            renderProjects(data.projects);
            renderEngagements(data.engagements);
        })
        .catch(error => console.error('Error loading resume data:', error));
});

function renderHeader(profile) {
    document.getElementById('name').textContent = profile.name;
    document.getElementById('title').textContent = profile.title;
    
    // Using FontAwesome Icons for strict visual match
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

function renderSummary(summary) {
    document.getElementById('summary').textContent = summary;
}

function renderExperience(experience) {
    const container = document.getElementById('experience-list');
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
            <div class="sidebar-title">${edu.degree}</div>
            <div class="sidebar-sub">
                <span>${edu.institution}</span>
            </div>
             <div class="sidebar-sub sidebar-italic">
                <span>${edu.location}</span>
                <span>${edu.year}</span>
            </div>
            <div class="sidebar-sub">
                <span>${edu.details}</span>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderSkills(skills) {
    const container = document.getElementById('skills-list');
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

function renderProjects(projects) {
    const container = document.getElementById('projects-list');
    projects.forEach(proj => {
        const item = document.createElement('div');
        item.className = 'sidebar-item';
        
        const bullets = proj.bullets ? 
            `<ul class="sidebar-bullets">${proj.bullets.map(b => `<li>${b}</li>`).join('')}</ul>` : '';

        item.innerHTML = `
            <div class="sidebar-title">${proj.title}</div>
            <div class="sidebar-sub sidebar-italic">
                <span>${proj.subtitle}</span>
                <span>${proj.duration}</span>
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
        
        // Handle newline characters in description for list effect
        const desc = eng.description.replace(/\n/g, '<br>');

        item.innerHTML = `
            <div class="sidebar-title"><i class="fas fa-check-circle" style="font-size: 0.8em; margin-right: 4px;"></i> ${eng.title}</div>
            <div class="sidebar-desc" style="margin-top:2px;">${desc}</div>
        `;
        container.appendChild(item);
    });
}