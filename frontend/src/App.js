import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

// Import logo - Place your logo.png file in src/asset/ folder
let logo;
try {
  logo = require('./asset/logo.png');
} catch (e) {
  logo = null;
}

function App() {
  const [step, setStep] = useState(1);
  const [jobDetails, setJobDetails] = useState({
    jobRole: '',
    experience: '',
    company: '',
    jobDescription: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setJobDetails({
      ...jobDetails,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleNextStep = () => {
    if (!jobDetails.jobRole || !jobDetails.experience) {
      setError('Please fill in all required fields');
      return;
    }
    setStep(2);
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['application/pdf', 'application/msword', 
                           'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                           'text/plain'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF, DOC, DOCX, or TXT file');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a resume file');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('resume', selectedFile);
    formData.append('jobDetails', JSON.stringify(jobDetails));

    try {
      const response = await axios.post('http://localhost:5000/api/analyze-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResults(response.data);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.error || 'Error analyzing resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setJobDetails({
      jobRole: '',
      experience: '',
      company: '',
      jobDescription: ''
    });
    setSelectedFile(null);
    setResults(null);
    setError('');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // orange
    return '#ef4444'; // red
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Fair';
    return 'Needs Improvement';
  };

  const feedbackSummary = results?.feedback?.find((item) => item.startsWith('SUMMARY: '));
  const feedbackSummaryText = feedbackSummary
    ? feedbackSummary.replace('SUMMARY: ', '')
    : '';

  const rightItems = results?.feedback
    ? results.feedback
        .filter((item) => item.startsWith('RIGHT: '))
        .map((item) => item.replace('RIGHT: ', ''))
    : [];

  const wrongItems = results?.feedback
    ? results.feedback
        .filter((item) => item.startsWith('WRONG: '))
        .map((item) => item.replace('WRONG: ', ''))
    : [];

  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <div className="header-title">
            <h1>CVInspector</h1>
            {logo && (
              <img src={logo} alt="CVInspector Logo" className="logo header-logo" />
            )}
          </div>
          <p>Analyze your resume and get instant feedback to improve your chances</p>
        </header>

        {/* Step 1: Job Details Form */}
        {step === 1 && (
          <div className="form-container">
            <h2>Step 1: Job Details</h2>
            <p className="subtitle">Tell us about the position you're applying for</p>
            
            <div className="form-group">
              <label>Job Role / Position *</label>
              <input
                type="text"
                name="jobRole"
                value={jobDetails.jobRole}
                onChange={handleInputChange}
                placeholder="e.g., Software Engineer, Product Manager"
                required
              />
            </div>

            <div className="form-group">
              <label>Required Experience Level *</label>
              <select
                name="experience"
                value={jobDetails.experience}
                onChange={handleInputChange}
                required
              >
                <option value="">Select experience level</option>
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior Level (6-10 years)</option>
                <option value="lead">Lead/Principal (10+ years)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Company Name (Optional)</label>
              <input
                type="text"
                name="company"
                value={jobDetails.company}
                onChange={handleInputChange}
                placeholder="e.g., Google, Microsoft"
              />
            </div>

            <div className="form-group">
              <label>Key Skills/Requirements (Optional)</label>
              <textarea
                name="jobDescription"
                value={jobDetails.jobDescription}
                onChange={handleInputChange}
                placeholder="e.g., React, Node.js, Python, Leadership skills..."
                rows="4"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button className="btn btn-primary" onClick={handleNextStep}>
              Next: Upload Resume →
            </button>
          </div>
        )}

        {/* Step 2: File Upload */}
        {step === 2 && !loading && (
          <div className="form-container">
            <h2>Step 2: Upload Your Resume</h2>
            <p className="subtitle">We accept PDF, DOC, DOCX, and TXT files</p>

            <div className="job-summary">
              <h3>Job Details:</h3>
              <p><strong>Role:</strong> {jobDetails.jobRole}</p>
              <p><strong>Experience:</strong> {jobDetails.experience}</p>
              {jobDetails.company && <p><strong>Company:</strong> {jobDetails.company}</p>}
            </div>

            <div className="file-upload-container">
              <label htmlFor="file-upload" className="file-upload-label">
                <div className="file-upload-icon">📄</div>
                <div className="file-upload-text">
                  {selectedFile ? (
                    <>
                      <strong>{selectedFile.name}</strong>
                      <span className="file-size">
                        ({(selectedFile.size / 1024).toFixed(2)} KB)
                      </span>
                    </>
                  ) : (
                    <>
                      <strong>Click to upload</strong> or drag and drop
                      <span>PDF, DOC, DOCX, or TXT (Max 10MB)</span>
                    </>
                  )}
                </div>
              </label>
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.txt"
                hidden
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="button-group">
              <button className="btn btn-secondary" onClick={() => setStep(1)}>
                ← Back
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleSubmit}
                disabled={!selectedFile}
              >
                Analyze Resume →
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
            <h2>Analyzing Your Resume...</h2>
            <p className="loading-text">
              Extracting text from document<br />
              Checking ATS compatibility<br />
              Analyzing keywords and format<br />
              Generating feedback...
            </p>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && results && (
          <div className="results-container">
            <h2>Your ATS Score</h2>
            
            <div className="score-display">
              <div 
                className="score-circle"
                style={{ borderColor: getScoreColor(results.atsScore) }}
              >
                <div className="score-number">{results.atsScore}</div>
                <div className="score-label">{getScoreLabel(results.atsScore)}</div>
              </div>
              <div className="score-description">
                <h3>Resume Analysis Complete</h3>
                <p>Your resume scored <strong>{results.atsScore}/100</strong> for the 
                   <strong> {results.jobRole}</strong> position.</p>
                {results.wordCount && (
                  <p className="word-count">Word Count: {results.wordCount}</p>
                )}
              </div>
            </div>

            <div className="feedback-section">
              <h3>Detailed Feedback</h3>
              {feedbackSummaryText && (
                <p className="feedback-summary">{feedbackSummaryText}</p>
              )}
              <div className="feedback-columns">
                <div className="feedback-column">
                  <h4 className="feedback-title">Right</h4>
                  <ul className="feedback-list">
                    {rightItems.length > 0 ? (
                      rightItems.map((item, index) => (
                        <li key={`right-${index}`} className="feedback-item">
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="feedback-item">No items</li>
                    )}
                  </ul>
                </div>
                <div className="feedback-column">
                  <h4 className="feedback-title">Wrong</h4>
                  <ul className="feedback-list">
                    {wrongItems.length > 0 ? (
                      wrongItems.map((item, index) => (
                        <li key={`wrong-${index}`} className="feedback-item">
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className="feedback-item">No items</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            <div className="recommendations-section">
              <h3>Pro Tips</h3>
              <ul className="tips-list">
                <li>Use specific keywords from the job description</li>
                <li>Quantify your achievements with numbers and percentages</li>
                <li>Keep formatting simple and ATS-friendly</li>
                <li>Use standard section headings (Experience, Education, Skills)</li>
                <li>Save your resume as a PDF to preserve formatting</li>
              </ul>
            </div>

            <button className="btn btn-primary" onClick={handleReset}>
              Check Another Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
