import assert from 'node:assert/strict'
import { DataWorker } from './src/worker-client.ts'

class FakeWorker {
  static current
  messages = []
  constructor() { FakeWorker.current = this }
  postMessage(message) {
    if (this.throwOnSend) throw new Error('Cannot clone request')
    this.messages.push(message)
  }
  terminate() { this.terminated = true }
}
const originalWorker = globalThis.Worker
globalThis.Worker = FakeWorker
try {
  const client = new DataWorker()
  const worker = FakeWorker.current
  const first = client.setGames([])
  worker.onmessage({ data: { id: worker.messages[0].id, result: true } })
  assert.equal(await first, true)

  worker.throwOnSend = true
  await assert.rejects(client.setGames([]), /Cannot clone/)
  assert.equal(client.pending.size, 0)
  worker.throwOnSend = false

  const pending = client.setGames([])
  const rejected = assert.rejects(pending, /processing failed/)
  worker.onerror()
  await rejected
  await assert.rejects(client.setGames([]), /processing failed/)
  assert.equal(worker.terminated, true)
  assert.equal(client.pending.size, 0)

  const stopped = new DataWorker()
  stopped.terminate()
  await assert.rejects(stopped.setGames([]), /Cancelled/)

  const unreadable = new DataWorker()
  const request = unreadable.setGames([])
  const unreadableRejected = assert.rejects(request, /Could not read/)
  FakeWorker.current.onmessageerror()
  await unreadableRejected
  await assert.rejects(unreadable.setGames([]), /Could not read/)
  console.log('PASS: worker replies, clone failures, fatal errors, message errors and requests after termination.')
} finally {
  globalThis.Worker = originalWorker
}
