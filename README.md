<h1><b>SlideSage</b></h1>
<h3>An AI-Powered Educational Transformation Platform for Instant Teaching Content & Animated Explainer Videos</h3>

<p>
Teaching complex concepts is hard — creating engaging, multi-format content is even harder.<br>
SlideSage introduces a modern, AI-driven pipeline that transforms dense lecture notes into <b>analogies</b>, <b>step-by-step diagrams</b>, <b>one-liners</b>, and <b>30-60 second animated explainer videos</b> — all from a single text input.
</p>

<p>
  <img src="https://img.shields.io/badge/Status-Completed-brightgreen?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge"/>
</p>

---

## Overview

SlideSage answers a crucial educational question:

> **"How can educators instantly create engaging, multi-format teaching content without spending hours on design and video production?"**

Using the power of **Groq's LLaMA 3.3-70B** and **client-side video synthesis**, this platform:

- Transforms complex text into **4 teaching formats** (Analogy, Diagram, One-Liner, Video Script)
- Generates **AI-powered explainer videos** with dialogue between Student & Sage characters
- Leverages **Web Speech API** for natural text-to-speech narration
- Fetches **dynamic visual backgrounds** from Pexels for professional video quality
- Renders videos **entirely in-browser** using Canvas API — no server upload required
- Provides a **glass-morphism UI** with smooth animations and responsive design

This project is **production-ready**, **type-safe**, and aligned with modern educational technology standards.

---

## Key Features

| Category               | Description                                                     |
| ---------------------- | --------------------------------------------------------------- |
| **Multi-Format Output**  | Analogy, Step-by-Step Diagram, One-Liner Summary, Video Script |
| **AI Content Generation** | Groq LLaMA 3.3-70B with structured JSON output & validation |
| **Video Synthesis**      | Client-side Canvas rendering with TTS narration & Pexels media |
| **File Processing**      | TXT, PDF, DOC, DOCX support with drag-and-drop interface       |
| **Smart Rate Limiting**  | 10 requests/hour per IP to prevent API abuse                   |
| **Export Capabilities**  | Download videos as WebM, copy text to clipboard                |
| **Modern UI/UX**         | Glass-morphism design, dark theme, Radix UI components         |

---

## Content Generation Pipeline

<table>
<tr>
<td width="50%" valign="top">

### **1. Input Processing**
- File Upload (TXT, PDF, DOC, DOCX)
- Drag-and-Drop Interface
- Direct Text Paste (10,000 char limit)
- Sample Text Demo

</td>
<td width="50%" valign="top">

### **2. AI Generation**
- Groq LLaMA 3.3-70B (Fast Inference)
- Structured JSON Schema Validation
- Automatic Retry Logic
- Rate Limiting (10 req/hour/IP)

</td>
</tr>

<tr>
<td width="50%" valign="top">

### **3. Teaching Formats**
- **Analogy** - Relatable comparison (50-200 words)
- **Diagram** - 3-6 step breakdown
- **One-Liner** - Memorable summary (10-50 words)
- **Video Script** - 3-5 scene dialogue (30-60 sec)

</td>
<td width="50%" valign="top">

### **4. Video Synthesis**
- Canvas Rendering (1920×1080)
- Pexels Background Media
- Web Speech API (TTS)
- MediaRecorder Export (WebM)
- Character-Based Dialogue (Student & Sage)

</td>
</tr>
</table>

---

## Performance Metrics

### **Content Generation Speed**

| Operation | Time | Details |
|-----------|------|---------|
| **AI Generation** | ~3-8 seconds | Groq LLaMA 3.3-70B inference |
| **Media Fetching** | ~1-2 seconds/scene | Pexels API video/image search |
| **TTS Synthesis** | Real-time | Browser Web Speech API |
| **Video Rendering** | ~30-60 seconds | Canvas frame-by-frame rendering |
| **Total Pipeline** | ~60-90 seconds | From text input to downloadable video |

### **Quality Metrics**

| Metric | Value | Details |
|--------|-------|---------|
| **Resolution** | 1920×1080 | Full HD video output |
| **Frame Rate** | 30 FPS | Smooth playback |
| **Video Codec** | VP9/WebM | Modern browser support |
| **TTS Quality** | Native Browser | Natural voice synthesis |
| **Background Media** | HD/SD | Pexels professional stock content |

---

## Tech Stack

<p>
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nextjs/nextjs-original.svg" height="45" />
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" height="45" />
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" height="45" />
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/tailwindcss/tailwindcss-original.svg" height="45" />
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg" height="45" />
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg" height="45" />
</p>

### **Frontend & Framework**
- **Next.js 14** - Full-stack React framework with App Router
- **React 18** - Component-based UI with hooks
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first styling

### **UI Components**
- **Radix UI** - 20+ headless accessible components
- **Geist UI** - Polished design system
- **Lucide React** - Icon library
- **Vaul** - Drawer components
- **Sonner** - Toast notifications

### **State Management**
- **Zustand** - Lightweight global state
- **Immer** - Immutable state updates
- **React Hook Form** - Form validation

### **AI & APIs**
- **Groq** - Fast LLM inference (LLaMA 3.3-70B)
- **Pexels** - Stock video/image search
- **OpenAI** (Optional) - File processing & TTS

### **Media Processing**
- **Canvas API** - Video frame rendering
- **MediaRecorder API** - WebM video capture
- **Web Speech API** - Text-to-speech synthesis
- **pdfjs-dist** - PDF file parsing

### **Validation & Utilities**
- **Zod** - Schema validation
- **date-fns** - Date manipulation
- **clsx** - Conditional class composition

---

## Installation & Setup

### **Prerequisites**
- Node.js 18+ (recommended: 20+)
- pnpm (preferred package manager)
- Groq API Key ([Get one here](https://console.groq.com/keys))
- Pexels API Key (Optional: for custom media)

### **Environment Variables**

Create a `.env.local` file in the root directory:

```env
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional
```

### **Installation Steps**

```bash
# Clone the repository
git clone https://github.com/yourusername/slidesage-v3.git
cd slidesage-v3

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build
pnpm start
```

**Access the app:** Open [http://localhost:3000](http://localhost:3000)

---

## Usage Guide

### **1. Input Your Content**

Choose from three input methods:
- **File Upload**: Drag-and-drop or select TXT/PDF/DOC/DOCX (max 10MB)
- **Paste Text**: Direct input (10-10,000 characters)
- **Try Sample**: Pre-filled eigenvectors example

### **2. Generate Teaching Content**

Click **"Generate Teaching Pack"** to:
- Process text through Groq AI
- Generate 4 teaching formats
- Create video script with scenes
- Navigate to Teaching Studio

### **3. Explore Results**

**Studio Tabs:**
- **Analogy** - Everyday comparison for understanding
- **Step-by-Step** - Structured breakdown with 3-6 steps
- **One-Liner** - Memorable single-sentence summary
- **Video** - Animated explainer with TTS narration

### **4. Video Controls**

- **Play/Pause** - Control video playback
- **Reset** - Restart from beginning
- **Record & Download** - Export as WebM file

**Copy to Clipboard:** Available for all text-based content

---

## Project Structure

```
SlideSage-v3/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # Main content generation endpoint
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Home page (input interface)
│   ├── studio/
│   │   └── page.tsx              # Results display & video studio
│   └── globals.css               # Glass-morphism styles
│
├── components/
│   ├── InputCard.tsx             # File upload & text input
│   ├── ResultTabs.tsx            # Tab navigation for results
│   ├── TeachingBlocks.tsx        # Analogy/Diagram/One-Liner display
│   ├── ExplainerVideo.tsx        # Video player & recorder
│   └── ui/                       # Radix UI components
│
├── lib/
│   ├── groq.ts                   # Groq API client
│   ├── pexels.ts                 # Pexels media fetching
│   ├── schema.ts                 # Zod validation schemas
│   ├── store.ts                  # Zustand state management
│   └── video/
│       └── sceneEngine.ts        # Video rendering engine
│
├── public/
│   └── images/
│       ├── sage-logo.png         # App logo
│       ├── sage.png              # Sage character
│       └── student-owl.png       # Student character
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

---

## API Reference

### **POST /api/generate**

Generate teaching content from input text.

**Request Body:**
```json
{
  "text": "Your lecture content here (10-10,000 chars)",
  "topicHint": "Optional context for better generation"
}
```

**Response:**
```json
{
  "topic": "Main Topic Extracted",
  "analogy": "Relatable comparison...",
  "diagramSteps": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "oneLiner": "Concise summary in one sentence",
  "script": {
    "title": "Video Title",
    "scenes": [
      {
        "speaker": "Student",
        "dialogue": "Question or statement",
        "visualHint": "Description for background",
        "visualSearchQuery": "pexels search term",
        "durationSec": 8
      }
    ],
    "closing": "Concluding message",
    "ttsVoiceHints": {
      "student": "curious, questioning",
      "sage": "wise, explanatory"
    }
  }
}
```

**Error Responses:**
- `400` - Invalid input (too short/long)
- `429` - Rate limit exceeded (10 req/hour)
- `500` - Processing error

---

## Advanced Features

### **Rate Limiting**
- **10 requests per hour per IP address**
- In-memory tracking with 1-hour reset window
- Prevents API abuse and cost overruns
- Returns `429 Too Many Requests` when exceeded

### **Type Safety**
- Full TypeScript implementation
- Zod schema validation for AI responses
- Compile-time error checking
- IntelliSense support throughout

### **Video Rendering Engine**
- **1920×1080 resolution** for professional quality
- **Scene-based architecture** with configurable duration
- **Automatic media fallback** (video → image → placeholder)
- **Caption rendering** with speaker labels
- **Smooth transitions** between scenes

### **Browser Compatibility**
- **Chrome/Edge**: Full support (recommended)
- **Firefox**: TTS voice selection limited
- **Safari**: WebM export not supported (use Chrome)
- **Mobile**: Responsive UI, limited recording support

---

## Research Directions

- **Multi-Language Support** - Generate content in 10+ languages
- **Custom Voice Cloning** - ElevenLabs/OpenAI TTS integration
- **Advanced Animations** - Motion graphics with Remotion
- **Interactive Quizzes** - Auto-generate assessment questions
- **LMS Integration** - Export to Canvas, Moodle, Blackboard
- **Neural TTS** - Higher-quality voice synthesis
- **Video Templates** - Customizable scene layouts
- **Collaborative Editing** - Real-time multi-user studios
- **Analytics Dashboard** - Track content performance
- **PDF Export** - Printable study guides

---

## Known Limitations

### **Current Constraints**
- **Rate Limiting**: 10 requests/hour per IP (in-memory, resets on restart)
- **Video Format**: WebM only (Chrome/Edge recommended)
- **TTS Quality**: Varies by browser implementation
- **File Size**: 10MB max upload
- **Text Length**: 10-10,000 characters
- **Video Length**: 30-60 seconds (3-5 scenes)

### **Planned Improvements**
- Persistent rate limiting with Redis
- MP4 video export (ffmpeg.wasm)
- Custom voice integration (ElevenLabs)
- Larger file support (chunking)
- Extended video duration option

---

## Deployment

### **Vercel Deployment** (Recommended)

```bash
# Deploy to Vercel
vercel

# Or connect your GitHub repository
# 1. Push to GitHub
# 2. Import project in Vercel
# 3. Set environment variables in Vercel dashboard
```

**Environment Variables in Vercel:**
- Go to Project Settings → Environment Variables
- Add `GROQ_API_KEY`
- Add `OPENAI_API_KEY` (optional)

### **Self-Hosting**

```bash
# Build the project
pnpm build

# Start production server
pnpm start
```

**Server Requirements:**
- Node.js 18+
- 512MB RAM minimum
- HTTPS recommended for WebM recording

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

**Development Standards:**
- TypeScript strict mode
- ESLint compliance
- Component-level documentation
- Zod schema validation for new endpoints

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgements

**AI Models:**
- **Groq** - Fast LLM inference with LLaMA 3.3-70B
- **OpenAI** (Optional) - File processing & TTS capabilities

**Media & Assets:**
- **Pexels** - Stock video and image content
- **Radix UI** - Accessible component primitives
- **Lucide** - Icon library

**Inspiration:**
Created to democratize educational content creation and empower educators to produce high-quality teaching materials in minutes, not hours.

---
