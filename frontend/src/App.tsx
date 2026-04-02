import { useState, useEffect } from 'react'
import './App.css'
import api from './api'

type HealthStatus = 'loading' | 'ok' | 'error'

function App() {
  const [status, setStatus] = useState<HealthStatus>('loading')
  const [detail, setDetail] = useState('')

  useEffect(() => {
    api.health()
      .then(data => {
        setStatus('ok')
        setDetail(JSON.stringify(data))
      })
      .catch((err: Error) => {
        setStatus('error')
        setDetail(err.message)
      })
  }, [])

  return (
    <main className="app">
      <h1>INTEX App</h1>
      <section className="health-check">
        <h2>Backend Health</h2>
        {status === 'loading' && <p className="status loading">Checking backend...</p>}
        {status === 'ok'      && <p className="status ok">Connected — {detail}</p>}
        {status === 'error'   && <p className="status error">Error: {detail}</p>}
      </section>
    </main>
  )
}

export default App
