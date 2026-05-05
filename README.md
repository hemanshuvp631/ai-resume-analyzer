# AI Resume Analyzer

A production-ready web application that uses AI to analyze and provide feedback on resumes. Get instant insights into your resume's strengths and areas for improvement.

## ✨ Key Features

- 📄 Upload PDF or TXT resume files
- 📝 Paste resume text directly
- 🤖 AI-powered analysis and scoring
- 👁️ Extract contact information (email, phone, LinkedIn)
- 🎯 Detect skills and job titles
- ✅ Comprehensive quality checks
- 💡 Personalized recommendations
- 📊 Detailed section analysis
- 📱 Responsive design
- 🎨 Modern UI with gradient styling

## 🛠️ Tech Stack

**Backend:**
- Node.js with Express.js
- Multer for file uploads
- PDF-parse for PDF processing
- CORS for cross-origin requests

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive grid layouts
- SVG circular progress indicator
- Smooth animations and transitions

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hemanshuvp631/ai-resume-analyzer.git
   cd ai-resume-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5000
   ```

## 📖 Usage

### Upload Resume
1. Click the upload area or drag and drop your resume (PDF or TXT)
2. Wait for analysis to complete
3. Review your score and recommendations

### Paste Text
1. Switch to "Paste Text" tab
2. Paste your resume content
3. Click "Analyze Resume"
4. View detailed analysis

## 🔌 API Endpoints

### POST /api/resume/analyze
Upload and analyze a resume file.

### POST /api/resume/analyze-text
Analyze resume from text input.

## 📊 Scoring Criteria

- Contact information: 10 pts
- Experience section: 20 pts
- Education section: 15 pts
- Skills section: 20 pts
- Technical keywords: 15 pts
- ATS compatibility: 10 pts
- Appropriate length: 10 pts

Total: 100 points

## 📁 File Structure

```
ai-resume-analyzer/
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
├── routes/
│   └── resume.js
├── services/
│   └── analyzer.js
├── server.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 📝 License

MIT License

## 👨‍💻 Author

Created with ❤️ by AI Resume Analyzer Team
