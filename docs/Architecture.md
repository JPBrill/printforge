# Architecture.md

## System Overview

```
Browser (Vercel)
     |
     | HTTPS multipart/form-data POST
     v
FastAPI Backend (Railway)
     |
     |-- ImageProcessor (Pillow)
     |      - Resize to 200x200
     |      - Convert to greyscale
     |      - Gaussian blur (0.5px)
     |      - Normalize heightmap
     |
     |-- STLGenerator (NumPy + struct)
     |      - Build top surface mesh
     |      - Build bottom face
     |      - Build 4 side walls
     |      - Write binary STL
     |
     |-- GuardrailAgent
     |      - Compare input vs output heightmap via SSIM
     |      - Reject if similarity < threshold (0.55)
     |
     v
     Binary STL returned as file download
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-app.railway.app
```

### Backend (Railway)
```
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
MAX_IMAGE_SIZE_MB=10
GUARDRAIL_THRESHOLD=0.55
```
