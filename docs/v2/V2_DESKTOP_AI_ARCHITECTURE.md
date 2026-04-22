# Rollwright V2 Desktop And Local AI Architecture

Status: planned architecture

Date researched: 2026-04-22

## Verified External Direction

Primary sources checked:

- [Google DeepMind Gemma 4](https://deepmind.google/models/gemma/gemma-4/)
- [Google Gemma 4 announcement](https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/)
- [Google AI for Developers Gemma docs](https://ai.google.dev/gemma/docs/core)
- [Tauri sidecar docs](https://tauri.app/develop/sidecar/)
- [llama.cpp server README](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md)

Current conclusion:

- Gemma 4 is the target local model family.
- Use E2B/E4B for normal machines first.
- Keep 26B/31B as workstation options.
- Use Tauri sidecars for a packaged desktop runtime.
- Use llama.cpp `llama-server` as the local OpenAI-compatible API server where model/runtime support is confirmed during implementation.

## Architecture Summary

```text
Rollwright Desktop
  React/TypeScript UI
    |
    | Tauri commands
    v
Rust backend
  starts/stops sidecars
  stores projects in SQLite
  reads local files
  coordinates document jobs
    |
    | local HTTP
    v
llama-server sidecar
  Gemma local inference
  OpenAI-compatible /v1 endpoints
    |
    v
Local model files
  stored under user app data
```

## Stack

Frontend:

- Vite
- React
- TypeScript
- Tailwind
- shadcn/ui or a Rollwright-specific component layer

Desktop shell:

- Tauri v2

Backend:

- Rust Tauri commands
- SQLite
- local file storage
- background job queue

Local AI:

- llama.cpp `llama-server` sidecar
- Gemma 4 model manager
- local endpoint on `http://127.0.0.1:8088/v1`

Optimizer:

- deterministic TypeScript or Rust geometry modules
- integer measurement units
- no AI-owned final math

## Why Tauri

Tauri supports bundled external binaries called sidecars. That lets Rollwright package `llama-server` without requiring the user to install Ollama or a Python stack.

Tauri sidecar packaging requires target-specific binary names. For example, an `externalBin` entry of `binaries/llama-server` expects files like:

```text
src-tauri/binaries/llama-server-x86_64-pc-windows-msvc.exe
src-tauri/binaries/llama-server-aarch64-apple-darwin
src-tauri/binaries/llama-server-x86_64-apple-darwin
src-tauri/binaries/llama-server-x86_64-unknown-linux-gnu
```

## Why llama.cpp For Packaged Runtime

Ollama is useful for development, but a packaged desktop app should not require a separate installed service. `llama-server` can be bundled as a sidecar and exposed through a local HTTP API.

Implementation note:

- Prefer a model manager that downloads/validates model files after install.
- Do not put `.gguf` weights in the frontend bundle.
- Do not commit model files to Git.

## Model Strategy

Default recommendation:

| Machine | Target model |
| --- | --- |
| Low-end laptop | Gemma 4 E2B |
| Normal estimator laptop | Gemma 4 E4B |
| Strong workstation | Gemma 4 26B |
| High-end local AI box | Gemma 4 31B |

Implementation should not hard-code one exact model filename. It should support a model registry with:

- display name
- provider
- download URL
- license URL
- expected file size
- checksum
- recommended RAM/VRAM
- local file path
- status

## AI Responsibilities

AI may:

- summarize plan text
- classify plan pages
- extract material codes and specs
- flag missing scope
- draft estimator notes
- answer questions about project documents
- explain optimizer tradeoffs
- produce customer-facing summaries

AI may not:

- finalize room dimensions
- finalize cut dimensions
- decide roll placement
- validate pattern phase
- override user corrections
- silently change approved material data
- produce final bid math without deterministic verification

Rule:

```text
AI reads, explains, extracts, and asks.
Code measures, validates, cuts, and prices.
```

## Suggested Desktop Folder Structure

```text
rollwright/
  src/
    components/
      ai-chat/
      command-ribbon/
      floor-plan/
      inspector/
      material-catalog/
      model-manager/
      plan-analyzer/
      roll-map/
      stairs/
    lib/
      ai/
        gemmaClient.ts
        prompts.ts
        schemas.ts
        toolRouter.ts
      documents/
        ocrSearch.ts
        pageClassifier.ts
        pdfRenderer.ts
        productExtractor.ts
        scopeExtractor.ts
      fieldsense/
      geometry/
      material-space/
      optimizer/
      patterns/
      stairs/
      storage/
        db.ts
        projectRepository.ts
    types/
  src-tauri/
    src/
      main.rs
      commands/
        ai.rs
        documents.rs
        optimizer.rs
        storage.rs
    binaries/
      .gitkeep
    tauri.conf.json
```

## Tauri Sidecar Configuration Sketch

```json
{
  "bundle": {
    "externalBin": [
      "binaries/llama-server"
    ]
  }
}
```

## Rust Command Sketch

```rust
#[tauri::command]
async fn start_local_ai(app: tauri::AppHandle, model_path: String) -> Result<String, String> {
    let port = "8088";

    let sidecar = app
        .shell()
        .sidecar("llama-server")
        .map_err(|e| format!("Failed to create llama-server sidecar: {e}"))?;

    let (_rx, _child) = sidecar
        .args([
            "-m",
            &model_path,
            "--host",
            "127.0.0.1",
            "--port",
            port,
            "--ctx-size",
            "32768",
        ])
        .spawn()
        .map_err(|e| format!("Failed to start llama-server: {e}"))?;

    Ok(format!("http://127.0.0.1:{port}/v1"))
}
```

The real implementation needs lifecycle management so the child process can be stopped, restarted, health-checked, and cleaned up when the app exits.

## TypeScript Client Sketch

```ts
export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function askLocalGemma(messages: ChatMessage[]) {
  const res = await fetch("http://127.0.0.1:8088/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma-local",
      messages,
      temperature: 0.1,
      max_tokens: 2048
    })
  });

  if (!res.ok) {
    throw new Error(`Local Gemma failed: ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
```

## Extraction Schema

```ts
import { z } from "zod";

export const ExtractedProductSchema = z.object({
  code: z.string(),
  productType: z.string().nullable(),
  manufacturer: z.string().nullable(),
  style: z.string().nullable(),
  color: z.string().nullable(),
  rollWidth: z.string().nullable(),
  patternRepeat: z.string().nullable(),
  matchType: z.string().nullable(),
  vendor: z.string().nullable(),
  contact: z.string().nullable(),
  sourcePage: z.string(),
  sourceExcerpt: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  missingCriticalData: z.array(z.string())
});

export const ProductExtractionResultSchema = z.object({
  products: z.array(ExtractedProductSchema),
  missingScopeItems: z.array(z.string()),
  warnings: z.array(z.string())
});
```

## AI Prompt Contract

```text
You are a flooring estimator assistant.
Extract only grounded information from the provided project documents.
Never invent measurements, products, vendors, or specs.
Return missing information as null and add warnings.
Distinguish verified data from inferred data.
Return only valid JSON matching the provided schema.
```

## First Desktop Milestone

Build:

- Tauri shell.
- React UI shell.
- SQLite project storage.
- model manager screen.
- sidecar start/stop command.
- Gemma health check.
- AI chat panel.
- plan-text paste analyzer.
- product extraction to schema-validated draft catalog.
- approve/edit/reject flow.
- approved products saved locally.

Defer:

- full PDF vector takeoff.
- full OCR heatmap.
- vision-based room tracing.
- multi-user sync.
- cloud auth.
