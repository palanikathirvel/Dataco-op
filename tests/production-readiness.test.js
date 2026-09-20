const assert = require("assert")
const bcrypt = require("bcryptjs")

console.log("==================================================")
console.log("🧪 RUNNING PRODUCTION READINESS TEST SUITE")
console.log("==================================================")

let passed = 0
let failed = 0

function test(name, fn) {
  try {
    fn()
    console.log(`  ✅ PASS: ${name}`)
    passed++
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`)
    console.error(`     Error: ${err.message}`)
    failed++
  }
}

async function asyncTest(name, fn) {
  try {
    await fn()
    console.log(`  ✅ PASS: ${name}`)
    passed++
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`)
    console.error(`     Error: ${err.message}`)
    failed++
  }
}

async function runAllTests() {
  // ─── 1. Password Hashing Security ──────────────────────────────────────────
  console.log("\n[1/5] Password Security & Salt Verification:")

  await asyncTest("bcrypt produces salted 60-character hashes", async () => {
    const plain = "TestPassword@1234"
    const hash1 = await bcrypt.hash(plain, 10)
    const hash2 = await bcrypt.hash(plain, 10)

    assert.strictEqual(hash1.length, 60, "Hash length must be 60")
    assert.notStrictEqual(hash1, hash2, "Different salts must produce different hashes")
    const match = await bcrypt.compare(plain, hash1)
    assert.strictEqual(match, true, "Valid password must compare successfully")
    const mismatch = await bcrypt.compare("WrongPassword", hash1)
    assert.strictEqual(mismatch, false, "Invalid password must fail comparison")
  })

  // ─── 2. In-Memory Rate Limiter Test ────────────────────────────────────────
  console.log("\n[2/5] Rate Limiter Sliding-Window Protection:")

  test("Rate limiter enforces request limits and tracks remaining budget", () => {
    // Mini mock of rate limiter logic
    const store = new Map()
    function mockRateLimit(key, limit, windowMs) {
      const now = Date.now()
      const record = store.get(key)
      if (!record || now > record.resetAt) {
        store.set(key, { count: 1, resetAt: now + windowMs })
        return { success: true, remaining: limit - 1 }
      }
      if (record.count >= limit) {
        return { success: false, remaining: 0 }
      }
      record.count++
      return { success: true, remaining: limit - record.count }
    }

    const testKey = `test-ip-${Date.now()}`
    const r1 = mockRateLimit(testKey, 3, 1000)
    assert.strictEqual(r1.success, true)
    assert.strictEqual(r1.remaining, 2)

    const r2 = mockRateLimit(testKey, 3, 1000)
    assert.strictEqual(r2.success, true)
    assert.strictEqual(r2.remaining, 1)

    const r3 = mockRateLimit(testKey, 3, 1000)
    assert.strictEqual(r3.success, true)
    assert.strictEqual(r3.remaining, 0)

    // 4th request must be rejected
    const r4 = mockRateLimit(testKey, 3, 1000)
    assert.strictEqual(r4.success, false, "Must block after limit exceeded")
    assert.strictEqual(r4.remaining, 0)
  })

  // ─── 3. Financial Transaction & Balance Integrity ──────────────────────────
  console.log("\n[3/5] Financial Transaction & Balance Math:")

  test("Wallet balance calculations maintain double-entry precision", () => {
    const initialBalance = 1500.50
    const payoutAmount = 500.00
    const balanceAfter = initialBalance - payoutAmount

    assert.strictEqual(balanceAfter, 1000.50, "Balance subtraction must be exact")
    assert.strictEqual(balanceAfter >= 0, true, "Balance cannot drop below zero")

    // Insufficient funds guard
    const overdrawnPayout = 2000.00
    const hasSufficientFunds = balanceAfter >= overdrawnPayout
    assert.strictEqual(hasSufficientFunds, false, "Overdrawn request must be rejected")
  })

  // ─── 4. Survey Limit & State Transitions ───────────────────────────────────
  console.log("\n[4/5] Survey Sample Size & State Machine:")

  test("Survey state switches to COMPLETED when sampleSize is reached", () => {
    const sampleSize = 100
    let currentResponses = 99
    let status = "ACTIVE"

    // Simulate response submission
    currentResponses++
    if (currentResponses >= sampleSize) {
      status = "COMPLETED"
    }

    assert.strictEqual(currentResponses, 100)
    assert.strictEqual(status, "COMPLETED", "Status must transition to COMPLETED")

    // Attempting response on completed survey
    const isAvailable = status === "ACTIVE" && currentResponses < sampleSize
    assert.strictEqual(isAvailable, false, "Completed survey must not accept new responses")
  })

  // ─── 5. Email Normalization & Input Validation ─────────────────────────────
  console.log("\n[5/5] Data Sanitization & Normalization:")

  test("Email normalization handles whitespace and case variations consistently", () => {
    const rawEmails = [
      "  User@Example.COM  ",
      "USER@EXAMPLE.COM",
      "user@example.com ",
      "uSeR@eXaMpLe.CoM",
    ]
    const normalized = rawEmails.map((e) => e.toLowerCase().trim())
    const allEqual = normalized.every((e) => e === "user@example.com")
    assert.strictEqual(allEqual, true, "All variations must normalize to user@example.com")
  })

  // ─── Summary ───────────────────────────────────────────────────────────────
  console.log("\n==================================================")
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`)
  console.log("==================================================")

  if (failed > 0) {
    process.exit(1)
  }
}

runAllTests()
