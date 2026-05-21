# API.md

## Endpoints

### POST /generate

**Request** `multipart/form-data`
```
file       required  Image (JPG/PNG/WEBP, max 10MB)
mode       required  "stamp" | "emboss"
size_mm    optional  float default 80.0
base_mm    optional  float default 3.0
depth_mm   optional  float default 1.2
```

**Success (200)**
```
Content-Type: application/octet-stream
X-Guardrail-Score: 0.87
X-Guardrail-Pass: true
<binary STL>
```

**Guardrail Fail (422)**
```json
{ "error": "guardrail_fail", "score": 0.41 }
```

### GET /health
```json
{ "status": "ok", "version": "1.0.0" }
```
