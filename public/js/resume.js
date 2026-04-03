document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('resume-form');
  const skillsContainer = document.getElementById('skills-tags');
  const skillInput = document.getElementById('skill-input');
  const addSkillBtn = document.getElementById('add-skill-btn');
  const addProjectBtn = document.getElementById('add-project-btn');
  const projectsList = document.getElementById('projects-list');
  const addEducationBtn = document.getElementById('add-education-btn');
  const educationList = document.getElementById('education-list');
  const downloadBtn = document.getElementById('download-btn');

  let skills = ['JavaScript', 'HTML', 'CSS', 'Node.js', 'React']; // Default skills for demo

  // Initialize skills
  const renderSkills = () => {
    skillsContainer.innerHTML = '';
    const prevSkillsList = document.getElementById('prev-skills-list');
    prevSkillsList.innerHTML = '';

    skills.forEach((skill, index) => {
      // Form tags
      const tag = document.createElement('div');
      tag.className = 'skill-tag';
      tag.innerHTML = `${skill} <i class="fas fa-times" data-index="${index}"></i>`;
      skillsContainer.appendChild(tag);

      // Preview tags
      const previewTag = document.createElement('span');
      previewTag.className = 'resume-skill-item';
      previewTag.textContent = skill;
      prevSkillsList.appendChild(previewTag);
    });
  };

  renderSkills();

  // Add Skill
  const addSkill = () => {
    const value = skillInput.value.trim();
    if (value && !skills.includes(value)) {
      skills.push(value);
      skillInput.value = '';
      renderSkills();
    }
  };

  addSkillBtn.addEventListener('click', addSkill);
  skillInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  });

  // Remove Skill
  skillsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('fa-times')) {
      const index = e.target.getAttribute('data-index');
      skills.splice(index, 1);
      renderSkills();
    }
  });

  // Add Project
  addProjectBtn.addEventListener('click', () => {
    const projectItem = document.createElement('div');
    projectItem.className = 'project-item mb-4 pb-3 border-bottom position-relative';
    projectItem.innerHTML = `
      <i class="fas fa-trash-alt remove-project" title="Remove Project"></i>
      <div class="row g-3">
        <div class="col-md-7">
          <label class="form-label">Project Title</label>
          <input type="text" name="projectTitle[]" class="form-control project-title" placeholder="Project Name">
        </div>
        <div class="col-md-5">
          <label class="form-label">Tech Stack</label>
          <input type="text" name="techStack[]" class="form-control tech-stack" placeholder="React, Node.js">
        </div>
        <div class="col-md-12">
          <label class="form-label">Description</label>
          <textarea name="projectDesc[]" class="form-control project-desc" rows="2" placeholder="Describe your project..."></textarea>
        </div>
      </div>
    `;
    projectsList.appendChild(projectItem);
    updatePreview(); // Update preview to include new project structure
  });

  // Remove Project
  projectsList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-project')) {
      e.target.closest('.project-item').remove();
      updatePreview();
    }
  });

  // Add Education
  addEducationBtn.addEventListener('click', () => {
    const eduItem = document.createElement('div');
    eduItem.className = 'education-item mb-4 pb-3 border-bottom position-relative';
    eduItem.innerHTML = `
      <i class="fas fa-trash-alt remove-edu" title="Remove Education"></i>
      <div class="row g-3">
        <div class="col-md-8">
          <label class="form-label">Degree</label>
          <input type="text" name="degree[]" class="form-control edu-degree" placeholder="Degree Name">
        </div>
        <div class="col-md-4">
          <label class="form-label">Year of Passing</label>
          <input type="text" name="year[]" class="form-control edu-year" placeholder="Year">
        </div>
        <div class="col-md-8">
          <label class="form-label">College/University</label>
          <input type="text" name="college[]" class="form-control edu-college" placeholder="College Name">
        </div>
        <div class="col-md-4">
          <label class="form-label">CGPA / %</label>
          <input type="text" name="cgpa[]" class="form-control edu-cgpa" placeholder="CGPA">
        </div>
      </div>
    `;
    educationList.appendChild(eduItem);
    updatePreview();
  });

  // Remove Education
  educationList.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-edu')) {
      e.target.closest('.education-item').remove();
      updatePreview();
    }
  });

  // Live Preview Update
  const updatePreview = () => {
    const formData = new FormData(form);
    
    // Personal Info
    document.getElementById('prev-name').textContent = formData.get('fullName') || 'YOUR NAME';
    document.getElementById('prev-email').textContent = formData.get('email') || 'email@example.com';
    document.getElementById('prev-phone').textContent = formData.get('phone') || '+1 234 567 890';
    document.getElementById('prev-linkedin').textContent = formData.get('linkedin') || 'linkedin.com/in/username';
    document.getElementById('prev-github').textContent = formData.get('github') || 'github.com/username';

    // Summary
    document.getElementById('prev-summary').textContent = formData.get('summary') || 'A brief professional summary...';

    // Education
    const eduDegrees = document.querySelectorAll('.edu-degree');
    const eduYears = document.querySelectorAll('.edu-year');
    const eduColleges = document.querySelectorAll('.edu-college');
    const eduCgpas = document.querySelectorAll('.edu-cgpa');
    const prevEducationList = document.getElementById('prev-education-list');

    prevEducationList.innerHTML = '';
    eduDegrees.forEach((degreeInput, index) => {
      const degree = degreeInput.value || 'Degree Name';
      const year = eduYears[index].value || 'Year';
      const college = eduColleges[index].value || 'College/University Name';
      const cgpa = eduCgpas[index].value || '0.0';

      const item = document.createElement('div');
      item.className = 'resume-item';
      item.innerHTML = `
        <div class="resume-item-header">
          <span>${degree}</span>
          <span>${year}</span>
        </div>
        <div class="resume-item-sub">
          <span>${college}</span>
          <span>CGPA: ${cgpa}</span>
        </div>
      `;
      prevEducationList.appendChild(item);
    });

    // Experience/Projects
    const projectTitles = document.querySelectorAll('.project-title');
    const techStacks = document.querySelectorAll('.tech-stack');
    const projectDescs = document.querySelectorAll('.project-desc');
    const prevProjectsList = document.getElementById('prev-projects-list');
    
    prevProjectsList.innerHTML = '';
    projectTitles.forEach((titleInput, index) => {
      const title = titleInput.value || 'Project Title';
      const stack = techStacks[index].value || 'Tech Stack';
      const desc = projectDescs[index].value || 'Description...';

      const item = document.createElement('div');
      item.className = 'resume-item';
      item.innerHTML = `
        <div class="resume-item-header">
          <span>${title}</span>
          <span>${stack}</span>
        </div>
        <div class="resume-item-desc">${desc}</div>
      `;
      prevProjectsList.appendChild(item);
    });

    // Achievements
    const achievements = formData.get('achievements');
    const achievementsSection = document.getElementById('prev-achievements-section');
    if (achievements) {
      achievementsSection.style.display = 'block';
      document.getElementById('prev-achievements').textContent = achievements;
    } else {
      achievementsSection.style.display = 'none';
    }
  };

  // Listen for all input changes
  form.addEventListener('input', updatePreview);

  // PDF Download
  downloadBtn.addEventListener('click', async () => {
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Generating...';

    try {
      // Get the full HTML including styles for the PDF generator
      const resumeHtml = document.getElementById('resume-document').outerHTML;
      const styles = Array.from(document.styleSheets)
        .map(styleSheet => {
          try {
            return Array.from(styleSheet.cssRules)
              .map(rule => rule.cssText)
              .join('');
          } catch (e) {
            console.log('Skipping stylesheet', styleSheet.href);
            return '';
          }
        })
        .join('\n');

      const fullHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Resume</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            ${styles}
            .resume-paper { width: 100% !important; margin: 0 !important; box-shadow: none !important; }
            body { margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
          </style>
        </head>
        <body>
          ${resumeHtml}
        </body>
        </html>
      `;

      const response = await fetch('/download-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ htmlContent: fullHtml })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to generate PDF. Please try again.');
      }
    } catch (error) {
      console.error('Download Error:', error);
      alert('An error occurred while generating the PDF.');
    } finally {
      downloadBtn.disabled = false;
      downloadBtn.innerHTML = '<i class="fas fa-download me-1"></i> Download PDF';
    }
  });
});
