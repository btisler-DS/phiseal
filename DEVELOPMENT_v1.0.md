# PhiSeal Development README — v1.0

## Implemented States
- DRIFT → INTERRUPT
- UNCERTAINTY → NO ACTION
- OTHER → NO ACTION

## Precedence Rules
- DRIFT overrides all other states.

## Explicit Non-Scope
- Any advice, suggestions, or generation
- PDF/DOCX/HTML ingestion (not yet)

## Determinism
Identical inputs must produce identical outputs.

## Acceptance Tests
- Drift interruption test passes.
- Declarative uncertainty test passes.
- Drift overrides uncertainty test passes.
- Background narrative does not interrupt.

## Version Lock
This document applies only to v1.0.
Any behavioral change requires a new version and a new DEVELOPMENT README.
