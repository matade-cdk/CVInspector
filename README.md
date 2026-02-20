# CVInspector 🔍

An ATS resume checker with a beautiful purple/pink glassmorphism UI that analyzes your resume and provides instant feedback with a score out of 100.

## Features

- Beautiful purple/pink gradient UI with glassmorphism effects
- Multi-step form with progress tracking
- File upload support (PDF, DOC, DOCX, TXT)
- ATS score calculation (0-100)
- Detailed feedback with RIGHT/WRONG columns
- Fully responsive design

## Scoring Criteria

- **Email Address** (10 pts) - Must have professional email
- **GitHub Profile** (10 pts) - Link to GitHub profile
- **Skillset Match** (30 pts) - Relevant keywords for the job role
- **Domain Experience** (25 pts) - Work experience section
- **Education** (20 pts) - BCA, BE, or BTech degree required
- **Skills Section** (5 pts) - Dedicated skills heading

## Quick Start

### Backend
```bash
cd backend
npm install
npm start
```
Backend runs on `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm start
```
Frontend runs on `http://localhost:3000`

### Quick Launch
Run both servers with one command:
- Windows: `start.bat`
- Linux/Mac: `./start.sh`

## Tech Stack

**Frontend:** React, CSS3 with glassmorphism  
**Backend:** Node.js, Express, Multer, pdf-parse, mammoth

## How It Works

1. Enter job details (role, experience level)
2. Upload your resume
3. Get instant ATS score with detailed feedback
4. Review RIGHT (what's good) and WRONG (what needs fixing)

---

Made with 💜 for job seekers
