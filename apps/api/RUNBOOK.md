# API Runbook
## Critical invariants
- Never deliver service before phase payment
- Never allow phase skip
- Never allow execution without escrow funded
- Log all actions to AuditLog

## Incident response
- Export audit log: /v1/admin/audit/export