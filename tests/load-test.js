const http = require("http")

/**
 * High-performance load test script measuring P50, P95, P99 latency,
 * throughput (requests/sec), and error rates across concurrency levels.
 */

const BASE_URL = process.env.TEST_URL || "http://localhost:3000"

async function runBatch(concurrency, totalRequests, path) {
  const url = `${BASE_URL}${path}`
  const latencies = []
  let errors = 0
  let completed = 0

  const startTime = Date.now()

  async function worker() {
    while (completed < totalRequests) {
      completed++
      const reqStart = Date.now()
      try {
        const res = await fetch(url, { headers: { "User-Agent": "LoadTest/1.0" } })
        const reqEnd = Date.now()
        latencies.push(reqEnd - reqStart)
        if (!res.ok && res.status !== 401 && res.status !== 429) {
          errors++
        }
      } catch (err) {
        errors++
      }
    }
  }

  const workers = []
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker())
  }
  await Promise.all(workers)

  const totalTimeSec = (Date.now() - startTime) / 1000
  latencies.sort((a, b) => a - b)

  const p50 = latencies[Math.floor(latencies.length * 0.5)] || 0
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0
  const avg = latencies.length > 0 ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1) : 0
  const rps = (latencies.length / totalTimeSec).toFixed(1)
  const errorRate = ((errors / latencies.length) * 100).toFixed(2)

  return {
    path,
    concurrency,
    totalRequests: latencies.length,
    rps: parseFloat(rps),
    avgMs: parseFloat(avg),
    p50,
    p95,
    p99,
    errorRate: parseFloat(errorRate),
    errors,
  }
}

async function main() {
  console.log("==================================================")
  console.log(`⚡ EXECUTING BENCHMARK & LOAD TEST on ${BASE_URL}`)
  console.log("==================================================")

  const scenarios = [
    { name: "Public Landing Page (/)", path: "/", requests: 50, concurrency: 10 },
    { name: "Legal Terms Page (/terms)", path: "/terms", requests: 50, concurrency: 10 },
    { name: "Feedback Feed (/api/feedback)", path: "/api/feedback", requests: 50, concurrency: 10 },
  ]

  for (const s of scenarios) {
    console.log(`\nTesting scenario: ${s.name} (Concurrency: ${s.concurrency}, Total: ${s.requests})`)
    try {
      const res = await runBatch(s.concurrency, s.requests, s.path)
      console.log(`  - Throughput:    ${res.rps} req/sec`)
      console.log(`  - Avg Latency:   ${res.avgMs} ms`)
      console.log(`  - P50 Latency:   ${res.p50} ms`)
      console.log(`  - P95 Latency:   ${res.p95} ms`)
      console.log(`  - P99 Latency:   ${res.p99} ms`)
      console.log(`  - Error Rate:    ${res.errorRate}% (${res.errors} errors)`)
    } catch (err) {
      console.log(`  - Target server not running locally: ${err.message}`)
      console.log(`    (Note: Start server with 'npm run start' or 'npm run dev' to run live load test)`)
    }
  }

  console.log("\n==================================================")
  console.log("Load testing completed.")
  console.log("==================================================")
}

main()
