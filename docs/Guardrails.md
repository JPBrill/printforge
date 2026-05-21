# Guardrails.md

## Visual SSIM Check

After every STL generation, the guardrail agent compares the input heightmap
against the heightmap used to generate the STL using SSIM.

| Score     | Result  | Action                      |
|-----------|---------|-----------------------------|
| >= 0.55   | PASS    | Return STL to user          |
| 0.40-0.54 | WARNING | Return STL + warn in header |
| < 0.40    | FAIL    | Return 422, block download  |

## What It Catches
- Blank/empty output
- Completely inverted output
- Processing pipeline failures
