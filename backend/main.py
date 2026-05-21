from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import os

from stl_generator import generate_stl
from guardrail import check_guardrail

app = FastAPI(title="PrintForge API", version="1.0.0")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:3001"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Guardrail-Score", "X-Guardrail-Pass"],
)

MAX_MB = float(os.getenv("MAX_IMAGE_SIZE_MB", "10"))
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}


@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.0"}


@app.post("/generate")
async def generate(
    file: UploadFile = File(...),
    mode: str = Form("stamp"),
    size_mm: float = Form(80.0),
    base_mm: float = Form(3.0),
    depth_mm: float = Form(1.2),
):
    # Validate file type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, detail={"error": "invalid_input", "message": "Use JPG, PNG or WEBP."})

    # Validate file size
    contents = await file.read()
    if len(contents) > MAX_MB * 1024 * 1024:
        raise HTTPException(400, detail={"error": "file_too_large", "message": f"Max {MAX_MB}MB."})

    # Validate mode
    if mode not in ("stamp", "emboss"):
        raise HTTPException(400, detail={"error": "invalid_mode", "message": "Mode must be stamp or emboss."})

    # Validate dimensions
    if not (10 <= size_mm <= 300):
        raise HTTPException(400, detail={"error": "invalid_size", "message": "size_mm must be 10-300."})
    if not (0.5 <= base_mm <= 20):
        raise HTTPException(400, detail={"error": "invalid_base", "message": "base_mm must be 0.5-20."})
    if not (0.2 <= depth_mm <= 10):
        raise HTTPException(400, detail={"error": "invalid_depth", "message": "depth_mm must be 0.2-10."})

    # Generate STL
    stl_bytes, input_hmap, output_hmap = generate_stl(
        image_bytes=contents,
        mode=mode,
        size_mm=size_mm,
        base_mm=base_mm,
        depth_mm=depth_mm,
    )

    # Guardrail check
    score, passed = check_guardrail(input_hmap, output_hmap)
    threshold = float(os.getenv("GUARDRAIL_THRESHOLD", "0.55"))

    if score < 0.40:
        raise HTTPException(
            422,
            detail={
                "error": "guardrail_fail",
                "message": f"Output does not match input (similarity: {score:.2f}). Try a higher contrast image.",
                "score": round(score, 3),
            },
        )

    headers = {
        "X-Guardrail-Score": str(round(score, 3)),
        "X-Guardrail-Pass": str(passed).lower(),
        "Content-Disposition": "attachment; filename=printforge-output.stl",
    }

    return Response(
        content=stl_bytes,
        media_type="application/octet-stream",
        headers=headers,
    )
