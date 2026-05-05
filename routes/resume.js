import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeResume } from '../services/analyzer.js';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.includes('text')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and text files are allowed'), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let resumeText = '';

    if (req.file.mimetype === 'application/pdf') {
      const fileData = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(fileData);
      resumeText = pdfData.text;
    } else {
      resumeText = fs.readFileSync(req.file.path, 'utf-8');
    }

    fs.unlinkSync(req.file.path);

    if (!resumeText.trim()) {
      return res.status(400).json({ error: 'Could not extract text from file' });
    }

    const analysis = await analyzeResume(resumeText);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {}
    }
    res.status(500).json({ error: 'Error analyzing resume', message: error.message });
  }
});

router.post('/analyze-text', express.json(), async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'No resume text provided' });
    }

    const analysis = await analyzeResume(text);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    res.status(500).json({ error: 'Error analyzing resume', message: error.message });
  }
});

export default router;
