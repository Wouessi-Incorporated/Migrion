# Curl examples
## Login
curl -s -X POST http://localhost:4000/v1/auth/login -H 'Content-Type: application/json' -d '{"email":"candidate@migrion.local","password":"ChangeMeNow123!"}'