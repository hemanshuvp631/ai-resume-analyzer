function extractBasicInfo(text) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/;
  const phoneRegex = /(\+?1?\s*\(?([0-9]{3})\)?[-.\\s]?([0-9]{3})[-.\\s]?([0-9]{4}))/;
  const linkedinRegex = /linkedin\.com\/in\/([a-zA-Z0-9\-]+)/i;

  const email = text.match(emailRegex)?.[0] || 'Not found';
  const phone = text.match(phoneRegex)?.[0] || 'Not found';
  const linkedin = text.match(linkedinRegex)?.[1] || 'Not found';

  return { email, phone, linkedin };
}

function extractSections(text) {
  const sections = { experience: [], education: [], skills: [], certifications: [] };
  const lines = text.split('\n');
  let currentSection = null;
  let sectionContent = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase().trim();

    if (lowerLine.includes('experience') || lowerLine.includes('professional')) {
      if (currentSection) sections[currentSection] = sectionContent.join('\n');
      currentSection = 'experience';
      sectionContent = [];
    } else if (lowerLine.includes('education')) {
      if (currentSection) sections[currentSection] = sectionContent.join('\n');
      currentSection = 'education';
      sectionContent = [];
    } else if (lowerLine.includes('skill')) {
      if (currentSection) sections[currentSection] = sectionContent.join('\n');
      currentSection = 'skills';
      sectionContent = [];
    } else if (lowerLine.includes('certification') || lowerLine.includes('license')) {
      if (currentSection) sections[currentSection] = sectionContent.join('\n');
      currentSection = 'certifications';
      sectionContent = [];
    } else if (currentSection) {
      sectionContent.push(line);
    }
  }

  if (currentSection) sections[currentSection] = sectionContent.join('\n');
  return sections;
}

function calculateScore(text, sections) {
  let score = 0;
  const checks = [];

  if (text.includes('@') && text.includes('.')) {
    score += 10;
    checks.push({ category: 'Contact Info', status: 'Complete' });
  } else {
    checks.push({ category: 'Contact Info', status: 'Missing email' });
  }

  if (sections.experience && sections.experience.trim().length > 20) {
    score += 20;
    checks.push({ category: 'Experience', status: 'Present' });
  } else {
    checks.push({ category: 'Experience', status: 'Missing or minimal' });
  }

  if (sections.education && sections.education.trim().length > 20) {
    score += 15;
    checks.push({ category: 'Education', status: 'Present' });
  } else {
    checks.push({ category: 'Education', status: 'Missing' });
  }

  if (sections.skills && sections.skills.trim().length > 20) {
    score += 20;
    checks.push({ category: 'Skills', status: 'Present' });
  } else {
    checks.push({ category: 'Skills', status: 'Missing' });
  }

  const keywords = ['javascript', 'python', 'java', 'react', 'nodejs', 'sql', 'api', 'cloud'];
  const keywordCount = keywords.filter(k => text.toLowerCase().includes(k)).length;
  score += Math.min(keywordCount * 2, 15);
  checks.push({ category: 'Technical Keywords', status: `${keywordCount} found` });

  if (!text.includes('image') && !text.includes('graphic')) {
    score += 10;
    checks.push({ category: 'ATS Compatibility', status: 'Text-based (Good)' });
  } else {
    checks.push({ category: 'ATS Compatibility', status: 'May contain graphics' });
  }

  if (text.length > 500 && text.length < 5000) {
    score += 10;
    checks.push({ category: 'Length', status: 'Appropriate' });
  } else if (text.length > 5000) {
    checks.push({ category: 'Length', status: 'Consider shortening' });
  } else {
    checks.push({ category: 'Length', status: 'Too short' });
  }

  return { score: Math.min(score, 100), checks };
}

function generateRecommendations(score, sections, skills) {
  const recommendations = [];

  if (score < 50) {
    recommendations.push('Add more content to your resume. Include work experience and education details.');
  }

  if (!sections.experience || sections.experience.trim().length < 20) {
    recommendations.push('Include a detailed experience section with your job titles, companies, and accomplishments.');
  }

  if (!sections.education || sections.education.trim().length < 20) {
    recommendations.push('Add your educational background including degrees and institutions.');
  }

  if (skills.length < 5) {
    recommendations.push('Expand your skills section. Include technical and soft skills relevant to your target role.');
  }

  if (score > 75) {
    recommendations.push('Great resume! Consider adding metrics and specific achievements to stand out further.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Your resume looks well-structured. Keep it updated with recent achievements.');
  }

  return recommendations;
}

export async function analyzeResume(resumeText) {
  try {
    const basicInfo = extractBasicInfo(resumeText);
    const sections = extractSections(resumeText);
    const { score, checks } = calculateScore(resumeText, sections);

    const skillsText = sections.skills || '';
    const skillsArray = skillsText
      .split(/[,\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 2 && s.length < 50)
      .slice(0, 15);

    const jobTitleMatch = resumeText.match(/(Software Engineer|Developer|Manager|Analyst|Designer|Data Scientist|Product Manager)/i);
    const suggestedJobTitle = jobTitleMatch ? jobTitleMatch[0] : 'Professional';

    return {
      success: true,
      score,
      basicInfo,
      sections: {
        hasExperience: sections.experience?.trim().length > 20,
        hasEducation: sections.education?.trim().length > 20,
        hasSkills: sections.skills?.trim().length > 20,
        hasCertifications: sections.certifications?.trim().length > 20
      },
      skills: skillsArray,
      suggestedJobTitle,
      recommendations: generateRecommendations(score, sections, skillsArray),
      checks,
      analysis: {
        wordCount: resumeText.split(/\s+/).length,
        uniqueSkills: skillsArray.length
      }
    };
  } catch (error) {
    console.error('Resume analysis error:', error);
    throw error;
  }
}
