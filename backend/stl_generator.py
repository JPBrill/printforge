import struct
import numpy as np
from PIL import Image, ImageFilter
import io
from typing import Tuple


def generate_stl(
    image_bytes: bytes,
    mode: str = "stamp",
    size_mm: float = 80.0,
    base_mm: float = 3.0,
    depth_mm: float = 1.2,
    resolution: int = 200,
) -> Tuple[bytes, np.ndarray, np.ndarray]:
    """
    Convert image bytes to binary STL.
    Returns (stl_bytes, input_heightmap, output_heightmap)
    """
    # Load and preprocess image
    img = Image.open(io.BytesIO(image_bytes)).convert("L")
    img = img.resize((resolution, resolution), Image.LANCZOS)
    arr = np.array(img, dtype=np.float32)

    # Smooth to reduce pixelation
    img_smooth = Image.fromarray(arr.astype(np.uint8))
    img_smooth = img_smooth.filter(ImageFilter.GaussianBlur(radius=0.8))
    arr = np.array(img_smooth, dtype=np.float32)

    # Build heightmap
    # stamp:  white=high (solid surface), black=low (recessed lines)
    # emboss: black=high (raised lines),  white=low (flat surface)
    if mode == "stamp":
        height_map = arr / 255.0          # white=1.0, black=0.0
    else:
        height_map = (255.0 - arr) / 255.0  # black=1.0, white=0.0

    input_heightmap = height_map.copy()

    # Z values: base_mm at minimum, base_mm + depth_mm at maximum
    z_surface = base_mm + height_map * depth_mm
    output_heightmap = z_surface.copy()

    W, H = resolution, resolution
    scale = size_mm / W

    # Vectorised mesh generation
    xs = np.arange(W - 1) * scale
    ys = np.arange(H - 1) * scale
    XX, YY = np.meshgrid(xs, ys)
    x0 = XX.flatten(); y0 = YY.flatten()
    x1 = x0 + scale;   y1 = y0 + scale

    z00 = z_surface[:-1, :-1].flatten()
    z10 = z_surface[:-1, 1:].flatten()
    z01 = z_surface[1:,  :-1].flatten()
    z11 = z_surface[1:,  1:].flatten()

    v00 = np.stack([x0, y0, z00], axis=1)
    v10 = np.stack([x1, y0, z10], axis=1)
    v01 = np.stack([x0, y1, z01], axis=1)
    v11 = np.stack([x1, y1, z11], axis=1)

    top_A = np.stack([v00, v10, v11], axis=1)
    top_B = np.stack([v00, v11, v01], axis=1)
    top_tris = np.concatenate([top_A, top_B], axis=0)

    # Bottom face (flat at z=0)
    z_b = np.zeros_like(x0)
    b00 = np.stack([x0, y0, z_b], axis=1)
    b10 = np.stack([x1, y0, z_b], axis=1)
    b01 = np.stack([x0, y1, z_b], axis=1)
    b11 = np.stack([x1, y1, z_b], axis=1)
    bot_A = np.stack([b00, b11, b10], axis=1)
    bot_B = np.stack([b00, b01, b11], axis=1)
    bot_tris = np.concatenate([bot_A, bot_B], axis=0)

    # Side walls
    side_list = []
    for x in range(W - 1):
        x0s = x * scale; x1s = (x + 1) * scale
        zt0 = z_surface[0, x]; zt1 = z_surface[0, x + 1]
        side_list += [
            ((x0s,0,0),(x1s,0,0),(x1s,0,zt1)),
            ((x0s,0,0),(x1s,0,zt1),(x0s,0,zt0)),
        ]
        yr = (H - 1) * scale
        zt0 = z_surface[H-1, x]; zt1 = z_surface[H-1, x+1]
        side_list += [
            ((x0s,yr,zt0),(x1s,yr,zt1),(x1s,yr,0)),
            ((x0s,yr,zt0),(x1s,yr,0),(x0s,yr,0)),
        ]
    for y in range(H - 1):
        y0s = y * scale; y1s = (y + 1) * scale
        zt0 = z_surface[y, 0]; zt1 = z_surface[y+1, 0]
        side_list += [
            ((0,y0s,0),(0,y0s,zt0),(0,y1s,zt1)),
            ((0,y0s,0),(0,y1s,zt1),(0,y1s,0)),
        ]
        xr = (W - 1) * scale
        zt0 = z_surface[y, W-1]; zt1 = z_surface[y+1, W-1]
        side_list += [
            ((xr,y0s,0),(xr,y1s,zt1),(xr,y0s,zt0)),
            ((xr,y0s,0),(xr,y1s,0),(xr,y1s,zt1)),
        ]

    side_arr = np.array(side_list, dtype=np.float32)
    all_tris = np.concatenate([top_tris, bot_tris, side_arr], axis=0).astype(np.float32)

    # Compute normals
    v0, v1, v2 = all_tris[:, 0], all_tris[:, 1], all_tris[:, 2]
    normals = np.cross(v1 - v0, v2 - v0).astype(np.float32)
    norms = np.linalg.norm(normals, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1, norms)
    normals = normals / norms

    # Write binary STL
    n_tris = len(all_tris)
    buf = bytearray(80 + 4 + n_tris * 50)
    header = b"PrintForge STL" + b"\x00" * 66
    buf[:80] = header
    struct.pack_into("<I", buf, 80, n_tris)
    offset = 84
    for i in range(n_tris):
        struct.pack_into("<3f", buf, offset, *normals[i]); offset += 12
        struct.pack_into("<3f", buf, offset, *all_tris[i, 0]); offset += 12
        struct.pack_into("<3f", buf, offset, *all_tris[i, 1]); offset += 12
        struct.pack_into("<3f", buf, offset, *all_tris[i, 2]); offset += 12
        struct.pack_into("<H",  buf, offset, 0); offset += 2

    return bytes(buf), input_heightmap, output_heightmap
