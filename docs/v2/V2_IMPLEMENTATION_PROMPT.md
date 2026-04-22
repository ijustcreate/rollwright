# V2 Implementation Prompt

Use this as the build prompt when starting the V2 desktop scaffold.

```text
Build Rollwright Desktop as a local-first Tauri application.

Goal:
Create a desktop flooring takeoff and roll optimization app with a bundled local AI runtime. The app should use Gemma through a local llama.cpp server sidecar. The AI is used for plan analysis, product extraction, missing scope detection, chatbot explanations, and estimator/installer summaries. The AI must not perform final measurement math or roll optimization.

Stack:
- Tauri v2
- Vite
- React
- TypeScript
- Tailwind
- shadcn/ui
- Rust backend commands
- SQLite for local persistence
- llama.cpp llama-server as sidecar
- Local OpenAI-compatible API endpoint at http://127.0.0.1:8088/v1

Architecture:
- Frontend handles UI.
- Tauri/Rust starts and stops the llama-server sidecar.
- Model files are stored in the user's app data directory.
- The app should include a model manager screen.
- The app should support local-only operation.
- Do not require Ollama to be installed.

Create these folders:
src/components/ai-chat
src/components/model-manager
src/components/plan-analyzer
src/components/material-catalog
src/lib/ai
src/lib/documents
src/lib/storage
src/lib/optimizer
src/lib/fieldsense
src/lib/patterns
src/lib/stairs
src/types
src-tauri/src/commands
src-tauri/binaries

Implement:
1. A Tauri command called start_local_ai that launches llama-server as a sidecar.
2. A Tauri command called stop_local_ai.
3. A frontend AI client that calls http://127.0.0.1:8088/v1/chat/completions.
4. A model manager UI showing:
   - AI server status
   - model path
   - start/stop buttons
   - test prompt button
5. A plan analyzer UI where the user can paste plan text and run AI extraction.
6. A product extraction schema using Zod.
7. A material catalog screen that shows AI-extracted draft products.
8. A review flow where users approve, edit, or reject extracted products.
9. Store approved products in SQLite.
10. Add strict warnings:
   - AI extracted data is unverified until approved
   - missing roll width blocks roll optimization
   - missing pattern repeat creates field verify warning
   - missing stair install method creates stair warning

AI behavior:
- Use a system prompt:
  "You are a flooring estimator assistant. Extract only grounded information from the provided project documents. Never invent measurements, products, vendors, or specs. Return missing information as null and add warnings. Distinguish verified data from inferred data."
- For extraction, require JSON only.
- Validate AI output with Zod.
- If validation fails, show an error and allow re-analysis.

Important:
- The deterministic optimizer is separate from AI.
- Do not let AI decide final measurements.
- Do not let AI generate final cut dimensions.
- Do not let AI silently modify approved catalog data.
- User corrections should persist and override future AI guesses.

Deliver first:
A working local desktop app skeleton that can launch the local AI sidecar, test Gemma, paste plan text, extract draft flooring products, validate JSON, and save approved products locally.
```
