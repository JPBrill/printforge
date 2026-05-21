# Goal.md

## Primary Goal
Build a free, minimal web application that converts any uploaded image into a downloadable STL file suitable for 3D printing — either as a stamp (lines recessed) or embossed relief (lines raised).

## User Journey
1. User lands on the page
2. User uploads any image (PNG, JPG, WEBP)
3. User selects mode: Stamp or Emboss
4. User adjusts: size (mm), base thickness (mm), indent depth (mm)
5. User clicks Generate
6. Animated loading screen shows live progress steps
7. Guardrail agent validates STL against original image
8. User downloads the STL file

## Success Criteria
- STL file is watertight
- STL visually matches uploaded image
- Generation completes under 30 seconds
- Guardrail catches mismatches before delivery
- Zero authentication required
