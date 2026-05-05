// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    
    // Update active button
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Update visible content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = 'none';
    });
    document.getElementById(tabName).style.display = 'block';
  });
});

// File upload handling
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('dragover');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    fileInput.files = files;
    analyzeFile();
  }
});

fileInput.addEventListener('change', analyzeFile);

async function analyzeFile() {
  const file = fileInput.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  showLoading();
  try {
    const response = await fetch('/api/resume/analyze', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const result = await response.json();
    displayResults(result);
  } catch (error) {
    hideLoading();
    alert('Error: ' + error.message);
  }
}

async function analyzeText() {
  const text = document.getElementById('resumeText').value;
  if (!text.trim()) {
    alert('Please paste your resume text');
    return;
  }

  showLoading();
  try {
    const response = await fetch('/api/resume/analyze-text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Analysis failed');
    }

    const result = await response.json();
    displayResults(result);
  } catch (error) {
    hideLoading();
    alert('Error: ' + error.message);
  }
}

function showLoading() {
  document.querySelector('.upload-section').style.display = 'none';
  document.getElementById('results').style.display = 'none';
  document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

function displayResults(analysis) {
  hideLoading();
  
  // Display score
  const score = analysis.score;
  document.getElementById('scoreNumber').textContent = score;
  
  const scoreCircle = document.getElementById('scoreCircle');
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  scoreCircle.style.strokeDashoffset = offset;

  // Score message
  let message = '';
  if (score >= 80) message = 'Excellent! Your resume is well-structured and comprehensive.';
  else if (score >= 60) message = 'Good! Your resume has solid foundation. Follow recommendations to improve.';
  else if (score >= 40) message = 'Fair. Add more content and structure to improve your resume.';
  else message = 'Needs work. Add essential sections and content as recommended.';
  
  document.getElementById('scoreMessage').textContent = message;

  // Basic info
  document.getElementById('emailDisplay').textContent = analysis.basicInfo.email;
  document.getElementById('phoneDisplay').textContent = analysis.basicInfo.phone;
  document.getElementById('linkedinDisplay').textContent = analysis.basicInfo.linkedin;
  document.getElementById('jobTitleDisplay').textContent = analysis.suggestedJobTitle;

  // Skills
  const skillsContainer = document.getElementById('skillsContainer');
  skillsContainer.innerHTML = analysis.skills
    .map(skill => `<span class="skill-tag">${skill}</span>`)
    .join('');

  // Sections
  const sectionsContainer = document.getElementById('sectionsContainer');
  const sections = [
    { name: 'Experience', key: 'hasExperience' },
    { name: 'Education', key: 'hasEducation' },
    { name: 'Skills', key: 'hasSkills' },
    { name: 'Certifications', key: 'hasCertifications' }
  ];

  sectionsContainer.innerHTML = sections
    .map(section => {
      const present = analysis.sections[section.key];
      return `
        <div class="section-item ${present ? 'present' : 'missing'}">
          <div class="status-icon">${present ? '✓' : '✗'}</div>
          <h4>${section.name}</h4>
          <p>${present ? 'Present' : 'Missing'}</p>
        </div>
      `;
    })
    .join('');

  // Checks
  const checksContainer = document.getElementById('checksContainer');
  checksContainer.innerHTML = analysis.checks
    .map((check, i) => {
      const isPositive = check.status.includes('Present') || 
                        check.status.includes('Complete') || 
                        check.status.includes('Good') ||\n                        check.status.includes('Appropriate') ||\n                        check.status.includes('found') ||\n                        check.status.includes('Text-based');
      return `
        <div class="check-item">
          <div class="check-icon">${isPositive ? '✓' : '⚠'}</div>
          <div class="check-content">
            <h5>${check.category}</h5>
            <p>${check.status}</p>
          </div>
        </div>
      `;
    })
    .join('');

  // Recommendations
  const recommendationsContainer = document.getElementById('recommendationsContainer');
  recommendationsContainer.innerHTML = analysis.recommendations
    .map(rec => `<li>${rec}</li>`)
    .join('');

  // Show results
  document.querySelector('.upload-section').style.display = 'none';
  document.getElementById('results').style.display = 'block';
}

function resetAnalysis() {
  document.getElementById('resumeText').value = '';
  fileInput.value = '';
  document.querySelector('.upload-section').style.display = 'block';
  document.getElementById('results').style.display = 'none';
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    if (i === 0) btn.classList.add('active');
    else btn.classList.remove('active');
  });
  document.getElementById('upload').style.display = 'block';
  document.getElementById('text').style.display = 'none';
}
