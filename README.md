# PrintForge 🖨️

Convert any image to a 3D-printable STL file in seconds.

**Stamp mode** — logo recessed into surface (press into clay/dough/wax)
**Emboss mode** — logo raised above surface

## Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS → Vercel
- **Backend**: FastAPI, Python 3.11, NumPy, Pillow → Railway

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

## Deploy
- **Backend** → Railway (connect `/backend` folder)
- **Frontend** → Vercel (connect `/frontend` folder)
