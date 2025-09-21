

````markdown
# 📚 SlideSage

Turn dense concepts into **engaging explainer videos** powered by AI.  
Give SlideSage a topic, and it generates a **30-second explainer video** with visuals, narration, and interactive quizzes to make learning stick.

🔗 **Live App:** [slidesageai.vercel.app](https://slidesageai.vercel.app)  
🔗 **GitHub Repo:** [VishalLakshmiNarayanan/SlideSage-v3](https://github.com/VishalLakshmiNarayanan/SlideSage-v3)

---

## ✨ Features

- 🎬 **AI Explainer Videos** – Enter a topic and get an instant video that simplifies it in under 30 seconds.
- 🔄 **Adaptive Feedback** – Don’t get it? SlideSage will regenerate a simpler explanation until you do.
- 📝 **Interactive Quizzes** – Test your understanding with auto-generated MCQs and view results.
- 📊 **Learning Roadmap** – Concepts are broken into subtopics with progress tracking.
- 🎨 **Modern UI** – Dark, glass-morphic theme with smooth components.
- 🌐 **Free Resources** – Powered by **Groq API** + **Pexels API** for AI + free stock visuals.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), [TailwindCSS](https://tailwindcss.com/)  
- **Backend / API Routes**: Next.js App Router (`/app/api`)  
- **AI**: [Groq LLM API](https://groq.com/)  
- **Media**: [Pexels API](https://www.pexels.com/api/) for free stock images & videos  
- **Database**: Supabase (for storing quiz results & user data)  
- **Deployment**: [Vercel](https://vercel.com/)

---

## 📂 Project Structure

```bash
SlideSage-v3-main/
├── app/                # Next.js App Router
│   ├── api/            # API routes (generate, quiz, evaluate)
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Landing page
│   └── studio/         # Studio mode
├── components/         # Reusable UI & feature components
│   └── ui/             # ShadCN UI components
├── lib/                # API clients (groq, pexels, supabase)
├── public/             # Static assets
└── utils/              # Helpers (formatting, video helpers)
````

---

## 🚀 Getting Started (Local Setup)

1. **Clone the repo**

   ```bash
   git clone https://github.com/VishalLakshmiNarayanan/SlideSage-v3.git
   cd SlideSage-v3
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

   (or use `npm install` / `yarn install`)

3. **Set up environment variables**
   Create a `.env.local` file with:

   ```bash
   GROQ_API_KEY=your_groq_key
   PEXELS_API_KEY=your_pexels_key
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   ```

4. **Run the dev server**

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) 🚀

---


## 🤝 Contributing

Pull requests are welcome! If you have feature ideas, feel free to open an issue.

---

## 📜 License

 [Vishal Lakshmi Narayanan](https://github.com/VishalLakshmiNarayanan)

---

> *“Learning doesn’t have to be boring. With SlideSage, knowledge comes alive.”*
