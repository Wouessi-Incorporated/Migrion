# Acceptance Criteria (must pass before launch)
## Phase enforcement
- Attempt Phase 1 service without Phase 1 payment -> 403 PHASE_NOT_PAID
- Attempt Phase 2 without Phase 1 completion -> 403 PHASE_NOT_COMPLETED
- Attempt Phase 3 execute without escrow funded -> 403 ESCROW_NOT_FUNDED

## Employer revenue model
- Employer cannot schedule interview without paid purchase -> 403 INTERVIEW_NOT_PAID
- Candidate must have phase1Done + phase2Paid to be eligible -> 403 CANDIDATE_NOT_ELIGIBLE_FOR_INTERVIEW

## Audit
- Every critical action emits AuditLog row; export returns last 1000 entries

## Escrow milestones
- Webhook updates milestone status; logs event; does not require candidate token