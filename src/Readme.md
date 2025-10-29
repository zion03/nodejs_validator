# API CURL Examples

```bash
# ----------------------------
# 1️⃣ Create Account
# ----------------------------
curl -X POST http://localhost:3001/api/v1/accounts \
-H "Content-Type: application/json" \
-d '{
  "name": "MyAccount",
  "scope": "account"
}'

# ----------------------------
# 2️⃣ Update Account
# ----------------------------
curl -X PUT http://localhost:3001/api/v1/accounts/<account_id> \
-H "Content-Type: application/json" \
-d '{
  "name": "UpdatedName",
  "scope": "prospect"
}'

# ----------------------------
# 3️⃣ Get Stats
# ----------------------------
curl http://localhost:3001/api/v1/accounts/stats
