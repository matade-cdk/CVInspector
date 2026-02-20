const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname || mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed!'));
    }
  }
});

// Extract text from different file types
async function extractTextFromFile(filePath, mimetype) {
  try {
    if (mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
               mimetype === 'application/msword') {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (mimetype === 'text/plain') {
      return fs.readFileSync(filePath, 'utf8');
    }
    return '';
  } catch (error) {
    console.error('Error extracting text:', error);
    return '';
  }
}

// ATS Scoring Algorithm
function calculateATSScore(resumeText, jobDetails) {
  const text = resumeText.toLowerCase();
  let score = 0;
  const feedback = [];
  const maxScore = 110;

  // 1. Check for contact information (20 points total: 10 email + 10 GitHub)
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const githubRegex = /github\.com\/[a-zA-Z0-9_-]+|github\s*:|git\s*hub\s*profile/i;
  
  if (emailRegex.test(text)) {
    score += 10;
    feedback.push('RIGHT: Professional email address found');
  } else {
    feedback.push('WRONG: Add a professional email address');
  }
  
  if (githubRegex.test(text)) {
    score += 10;
    feedback.push('RIGHT: GitHub account/profile found');
  } else {
    feedback.push('WRONG: Include your GitHub profile link');
  }

  // 2. Check for relevant skillset based on job role (30 points)
  const jobRole = jobDetails.jobRole.toLowerCase();
  let relevantKeywords = [];
  
  if (jobRole.includes('developer') || jobRole.includes('engineer') || jobRole.includes('software')) {
    relevantKeywords = ['javascript', 'python', 'java', 'react', 'node', 'angular', 'vue', 'git', 'api', 'database', 'sql', 'mongodb', 'express', 'html', 'css', 'typescript', 'restful', 'docker', 'aws', 'testing', 'agile'];
  } else if (jobRole.includes('designer')) {
    relevantKeywords = ['figma', 'sketch', 'adobe', 'ui', 'ux', 'design', 'photoshop', 'illustrator', 'prototype', 'wireframe', 'user research'];
  } else if (jobRole.includes('manager')) {
    relevantKeywords = ['leadership', 'management', 'strategy', 'team', 'project', 'budget', 'stakeholder', 'agile', 'scrum'];
  } else if (jobRole.includes('marketing')) {
    relevantKeywords = ['seo', 'social media', 'campaign', 'analytics', 'content', 'brand', 'digital marketing', 'google analytics'];
  } else if (jobRole.includes('data')) {
    relevantKeywords = ['python', 'sql', 'tableau', 'analytics', 'statistics', 'machine learning', 'visualization', 'pandas', 'numpy'];
  } else {
    relevantKeywords = ['professional', 'communication', 'team', 'project', 'experience', 'problem solving'];
  }

  let keywordCount = 0;
  const foundSkills = [];
  relevantKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      keywordCount++;
      foundSkills.push(keyword);
    }
  });
  
  const keywordScore = Math.min(30, (keywordCount / relevantKeywords.length) * 30);
  score += keywordScore;
  
  if (keywordCount === 0) {
    feedback.push(`WRONG: Add more relevant technical skills for ${jobDetails.jobRole} position (found ${keywordCount}/${relevantKeywords.length})`);
  } else {
    feedback.push(`RIGHT: Excellent skillset match for ${jobDetails.jobRole} (found ${keywordCount}/${relevantKeywords.length} skills)`);
  }

  // 3. Check for relevant domain experience (25 points)
  const experienceKeywords = ['experience', 'work history', 'employment', 'worked at', 'working as'];
  let hasExperience = experienceKeywords.some(keyword => text.includes(keyword));
  
  // Check for domain-specific experience
  const domainExperienceScore = hasExperience ? 15 : 0;
  score += domainExperienceScore;
  
  if (hasExperience) {
    // Check if experience is relevant to the job role
    const roleKeywords = jobRole.split(' ');
    let relevantExperience = false;
    roleKeywords.forEach(keyword => {
      if (keyword.length > 3 && text.includes(keyword)) {
        relevantExperience = true;
      }
    });
    
    if (relevantExperience) {
      score += 10;
      feedback.push(`RIGHT: Relevant experience found for ${jobDetails.jobRole} domain`);
    } else {
      score += 5;
      feedback.push(`WRONG: Add more specific experience related to ${jobDetails.jobRole}`);
    }
  } else {
    feedback.push('WRONG: Add a clear Experience/Work History section with domain-specific roles');
  }

  // 4. Check for required education (BCA, BE, BTech) (20 points)
  const educationKeywords = ['education', 'qualification', 'academic'];
  const requiredDegrees = ['bca', 'b.c.a', 'bachelor of computer application', 
                           'be', 'b.e', 'bachelor of engineering',
                           'btech', 'b.tech', 'b tech', 'bachelor of technology'];
  
  let hasEducationSection = educationKeywords.some(keyword => text.includes(keyword));
  let hasRequiredDegree = requiredDegrees.some(degree => text.includes(degree));
  
  if (hasEducationSection && hasRequiredDegree) {
    score += 20;
    // feedback.push('RIGHT: Required education qualification found (BCA/BE/BTech)');
  } else if (hasEducationSection) {
    score += 10;
    // feedback.push('WRONG: Education section found but missing BCA/BE/BTech degree');
  } else if (hasRequiredDegree) {
    score += 15;
    // feedback.push('WRONG: Required degree found, but add a clear Education section heading');
  } else {
    // feedback.push('WRONG: Add Education section with BCA/BE/BTech degree');
  }

  // 5. Check for dedicated skills section (5 points)
  const skillsKeywords = ['skills', 'technical skills', 'competencies', 'expertise', 'technologies'];
  let hasSkills = skillsKeywords.some(keyword => text.includes(keyword));
  
  if (hasSkills) {
    score += 5;
    feedback.push('RIGHT: Dedicated Skills section found');
  } else {
    feedback.push('WRONG: Add a clear "Skills" or "Technical Skills" section heading');
  }

  // 6. Check for quantifiable achievements (bonus points not counted in base 100)
  const numberRegex = /\d+%|\d+\+|\$\d+|increased|decreased|improved|reduced/gi;
  const achievements = text.match(numberRegex);
  
  if (achievements && achievements.length >= 3) {
    feedback.push('RIGHT: Good use of quantifiable achievements');
  } else if (achievements && achievements.length >= 1) {
    feedback.push('WRONG: Add more quantifiable achievements (numbers, percentages, metrics)');
  } else {
    feedback.push('WRONG: Include quantifiable achievements with numbers and metrics');
  }

  // 7. Resume length check
  const wordCount = text.split(/\s+/).length;
  if (wordCount < 200) {
    feedback.push('WRONG: Resume is too short - aim for 400-800 words');
  } else if (wordCount > 1200) {
    feedback.push('WRONG: Resume might be too long - consider condensing to 1-2 pages');
  } else {
    feedback.push('RIGHT: Good resume length');
  }

  // 8. Check for action verbs
  const actionVerbs = ['developed', 'managed', 'created', 'led', 'designed', 'implemented', 'achieved', 'improved', 'initiated'];
  let actionVerbCount = 0;
  actionVerbs.forEach(verb => {
    if (text.includes(verb)) {
      actionVerbCount++;
    }
  });
  
  if (actionVerbCount >= 5) {
    feedback.push('RIGHT: Good use of action verbs');
  } else {
    feedback.push('WRONG: Use more action verbs (developed, managed, led, created, etc.)');
  }

  // 9. Check for certifications (5 points)
  const certificationKeywords = ['certification', 'certified', 'certificate', 'certification:', 'certifications:'];
  const commonCerts = ['aws', 'azure', 'google cloud', 'gcp', 'oracle', 'cisco', 'comptia', 'pmp', 'scrum master', 'csm', 'microsoft', 'java certified', 'python certified', 'ccna', 'ccnp', 'kubernetes', 'ckad', 'cka'];
  
  let hasCertificationSection = certificationKeywords.some(keyword => text.includes(keyword));
  let hasRecognizedCert = commonCerts.some(cert => text.includes(cert));
  
  if (hasCertificationSection || hasRecognizedCert) {
    score += 5;
    feedback.push('RIGHT: Certifications found - adds credibility');
  } else {
    feedback.push('WRONG: Add relevant certifications (AWS, Azure, Scrum, etc.) if you have any');
  }

  // 10. Check for hobbies/interests section (5 points)
  const hobbiesKeywords = ['hobbies', 'interests', 'hobbies:', 'interests:', 'personal interests', 'hobbies and interests'];
  let hasHobbies = hobbiesKeywords.some(keyword => text.includes(keyword));
  
  if (hasHobbies) {
    score += 5;
    feedback.push('RIGHT: Hobbies/Interests section found - shows personality');
  } else {
    feedback.push('WRONG: Consider adding a Hobbies/Interests section to show personality');
  }

  // Additional feedback based on score
  if (score >= 99) {
    feedback.unshift('SUMMARY: EXCELLENT - Your resume meets all requirements and is highly optimized');
  } else if (score >= 83) {
    feedback.unshift('SUMMARY: GOOD - Resume with required qualifications, minor improvements suggested');
  } else if (score >= 66) {
    feedback.unshift('SUMMARY: FAIR - Resume needs improvements, check education and skillset requirements');
  } else {
    feedback.unshift('SUMMARY: NEEDS WORK - Major improvements needed, missing critical requirements');
  }

  return {
    score: Math.round(score),
    feedback: feedback,
    wordCount: wordCount
  };
}

// API Routes
app.post('/api/analyze-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check for professional file name (no digits allowed)
    const fileName = req.file.originalname;
    const fileNameWithoutExt = path.parse(fileName).name;
    const hasDigits = /\d/.test(fileNameWithoutExt);
    
    if (hasDigits) {
      fs.unlinkSync(req.file.path); // Clean up
      return res.status(400).json({ 
        error: 'Unprofessional file name detected',
        message: 'Resume file name should not contain digits. Use format like "JohnDoe_Resume.pdf" or "FirstName_LastName_Resume.pdf"'
      });
    }

    const jobDetails = JSON.parse(req.body.jobDetails);
    
    // Extract text from resume
    const resumeText = await extractTextFromFile(req.file.path, req.file.mimetype);
    
    if (!resumeText) {
      fs.unlinkSync(req.file.path); // Clean up
      return res.status(400).json({ error: 'Could not extract text from resume' });
    }

    // Calculate ATS score
    const result = calculateATSScore(resumeText, jobDetails);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    // Simulate processing delay
    setTimeout(() => {
      res.json({
        success: true,
        atsScore: result.score,
        feedback: result.feedback,
        wordCount: result.wordCount,
        jobRole: jobDetails.jobRole,
        experience: jobDetails.experience
      });
    }, 2000); // 2 second delay to show loading state

  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Error analyzing resume' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'CVInspector API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
