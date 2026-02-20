# CVInspector

A stunning full-stack web application with a purple/pink gradient glassmorphism UI that analyzes resumes and provides ATS (Applicant Tracking System) scores with detailed feedback to help job seekers improve their resumes.

## Features

- Beautiful Modern UI - Purple/pink gradient with glassmorphism effects and glowing animations
- Job details form (role, experience level, company)
- File upload support (PDF, DOC, DOCX, TXT)
- Real-time resume analysis with animated loading state
- ATS score calculation (0-100)
- Detailed feedback and improvement suggestions
- Fully responsive design

## Updated Scoring Criteria

### Contact Information (20 points)
- Email Address (10 pts) - Required
- GitHub Profile (10 pts) - Required

### Skillset Match (30 points)
- Comprehensive keyword matching based on job role
- Shows skills found vs. total required
- Enhanced skill lists for various roles

### Domain Experience (25 points)
- Experience section: 15 points
- Domain-relevant experience: +10 bonus points

### Education (20 points)  
- **Required Degrees**: BCA, BE, or BTech
- Full credit for both section and degree
- Partial credit if one is present

### Skills Section (5 points)
- Dedicated "Skills" or "Technical Skills" heading

## Tech Stack

### Frontend
- React.js
- Axios for API calls
- CSS3 with animations

### Backend
- Node.js
- Express.js
- Multer (file upload)
- pdf-parse (PDF text extraction)
- mammoth (Word document parsing)

## Project Structure

```
Resume_checker/
├── backend/
│   ├── server.js          # Express server with ATS logic
│   ├── package.json       # Backend dependencies
│   └── .gitignore
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.js         # Main React component
    │   ├── App.css        # Styling
    │   ├── index.js       # React entry point
    │   └── index.css      # Global styles
    ├── package.json       # Frontend dependencies
    └── .gitignore
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The backend server will run on `http://localhost:5000`

For development with auto-reload:
```bash
npm run dev
```

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## How It Works

### User Flow

1. **Job Details Form**
   - User enters job role/position
   - Selects experience level
   - Optionally adds company name and key requirements

2. **Resume Upload**
   - User uploads their resume (PDF, DOC, DOCX, or TXT)
   - System validates file type and size

3. **Analysis**
   - Loading screen shows "Analyzing Resume..."
   - Backend extracts text from the document
   - ATS algorithm calculates score based on multiple factors

4. **Results**
   - Displays ATS score (0-100) with visual indicator
   - Shows detailed feedback list
   - Provides pro tips for improvement
   - Option to check another resume

### ATS Scoring Algorithm

The system evaluates resumes based on:

- **Contact Information** (15 points)
  - Email address

- **Relevant Keywords** (25 points)
  - Job-specific technical skills
  - Industry-relevant terms

- **Experience Section** (20 points)
  - Presence of work history

- **Education Section** (15 points)
  - Academic background

- **Skills Section** (15 points)
  - Dedicated skills listing

- **Quantifiable Achievements** (10 points)
  - Numbers, percentages, metrics

- **Additional Factors**
  - Resume length (word count)
  - Use of action verbs
  - Overall formatting

## API Endpoints

### POST `/api/analyze-resume`

Analyzes uploaded resume and returns ATS score with feedback.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body:
  - `resume`: File (PDF, DOC, DOCX, TXT)
  - `jobDetails`: JSON string with job information

**Response:**
```json
{
  "success": true,
  "atsScore": 85,
  "feedback": [
    "✅ Excellent! Your resume is well-optimized",
    "✅ Experience section found",
    "⚠️ Add more quantifiable achievements"
  ],
  "wordCount": 650,
  "jobRole": "Software Engineer",
  "experience": "mid"
}
```

## Features in Detail

### Score Interpretation

- **85-100**: Excellent - Well-optimized for ATS
- **70-84**: Good - Minor improvements needed
- **50-69**: Fair - Significant improvements needed
- **0-49**: Needs Work - Major improvements required

### Feedback Types

- ✅ **Green Check** - Element present and good
- ⚠️ **Warning** - Element needs improvement
- ❌ **Red X** - Element missing or critical issue

## Customization

### Adding New Keywords

Edit the `calculateATSScore` function in [backend/server.js](backend/server.js) to add keywords for different job roles:

```javascript
if (jobRole.includes('your-role')) {
  relevantKeywords = ['keyword1', 'keyword2', 'keyword3'];
}
```

### Adjusting Score Weights

Modify the point values in the scoring algorithm to change how different factors are weighted.

### Styling

Update [frontend/src/App.css](frontend/src/App.css) to customize colors, fonts, and layout.

## Troubleshooting

### Common Issues

**Port already in use:**
- Change the port in `backend/server.js` (line 8)
- Or kill the process using the port

**CORS errors:**
- Ensure backend is running on port 5000
- Check proxy setting in `frontend/package.json`

**File upload fails:**
- Check file size (should be under 10MB)
- Verify file type is supported
- Ensure uploads directory has write permissions

## Future Enhancements

- [ ] Support for more file formats
- [ ] Machine learning-based scoring
- [ ] Resume template library
- [ ] Comparison with successful resumes
- [ ] Export detailed report as PDF
- [ ] User accounts and history
- [ ] Integration with job boards
- [ ] Industry-specific analysis

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue on the GitHub repository.

---

Made with ❤️ for job seekers everywhere
