import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  // Static values for temperature and top_k
  const temperature = 0.3;
  const top_k = 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setAnswer("");
    setDocs([]);
    try {
      const response = await axios.post('http://localhost:8000/ask', {
        question,
        temperature,
        top_k
      });
      setAnswer(response.data.answer);
      setDocs(response.data.docs);
      setHistory(prev => [{ question, answer: response.data.answer }, ...prev]);
    } catch (err) {
      setError("Error fetching answer. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="App" style={{
      minHeight: '100vh',
      fontFamily: 'Segoe UI, Arial, sans-serif',
      background: 'url(https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80) center/cover no-repeat',
      position: 'relative',
      padding: 0,
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.92)',
        minHeight: '100vh',
        width: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
      }}></div>
      <header className="App-header" style={{ background: 'rgba(45,55,72,0.95)', color: '#fff', padding: '2em 0', marginBottom: '2em', position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <h1 style={{ fontWeight: 700, fontSize: '2.5em', marginBottom: '0.2em', textAlign: 'center' }}>Legal Assistant</h1>
        <p style={{ fontSize: '1.1em', color: '#cbd5e1', marginBottom: '0.5em', textAlign: 'center' }}>Ask legal questions and get AI-powered answers instantly.</p>
      </header>
      <main style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          maxWidth: '600px',
          width: '100%',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
          padding: '2em',
          marginBottom: '2em',
        }}>
          <form onSubmit={handleSubmit} style={{ marginBottom: '2em', textAlign: 'center' }}>
            <label htmlFor="question" style={{ fontWeight: 500, fontSize: '1.1em' }}>Enter your legal question:</label>
            <textarea
              id="question"
              value={question}
              onChange={e => setQuestion(e.target.value)}
              required
              rows={3}
              style={{ width: '100%', padding: '0.7em', fontSize: '1em', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '0.5em', marginBottom: '1em', resize: 'vertical' }}
              placeholder="e.g. What are the requirements for a valid contract?"
            />
            <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.7em 2em', fontSize: '1.1em', fontWeight: 600, cursor: 'pointer', boxShadow: '0 1px 4px rgba(37,99,235,0.12)' }}>
              {loading ? "Loading..." : "Ask"}
            </button>
          </form>
          {error && <div style={{ color: '#e53e3e', marginBottom: '1em' }}>{error}</div>}
          {answer && (
            <section style={{ marginBottom: '2em' }}>
              <h2 style={{ fontSize: '1.3em', color: '#2563eb', marginBottom: '0.5em' }}>Answer</h2>
              <div style={{ background: '#f1f5f9', padding: '1em', borderRadius: '8px', fontSize: '1.1em', marginBottom: '1em', whiteSpace: 'pre-line' }}>
                {answer.split(/\n\d+\. |\n- /).length > 1 ? (
                  <ol style={{ paddingLeft: '1.2em' }}>
                    {answer.split(/\n\d+\. |\n- /).map((step, idx) => step.trim() && <li key={idx} style={{ marginBottom: '0.7em' }}>{step.trim()}</li>)}
                  </ol>
                ) : (
                  <span>{answer}</span>
                )}
              </div>
            </section>
          )}
          {docs.length > 0 && (
            <section>
              <h3 style={{ fontSize: '1.1em', color: '#334155', marginBottom: '0.5em' }}>Relevant Documents</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1em' }}>
                {docs.map((doc, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1em', fontSize: '0.98em', color: '#475569', whiteSpace: 'pre-line' }}>
                    {doc.page_content ? doc.page_content : <span style={{ color: '#64748b' }}>No content available</span>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
        {history.length > 0 && (
          <div style={{
            maxWidth: '600px',
            width: '100%',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            padding: '1.5em',
            marginBottom: '2em',
          }}>
            <h3 style={{ color: '#2563eb', marginBottom: '1em' }}>Past Queries</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {history.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '1.2em', borderBottom: '1px solid #e2e8f0', paddingBottom: '1em' }}>
                  <div style={{ fontWeight: 500, color: '#334155', marginBottom: '0.3em' }}>Q: {item.question}</div>
                  <div style={{ color: '#475569', background: '#f1f5f9', borderRadius: '6px', padding: '0.7em', fontSize: '0.98em', whiteSpace: 'pre-line' }}>
                    {item.answer.split(/\n\d+\. |\n- /).length > 1 ? (
                      <ol style={{ paddingLeft: '1.2em' }}>
                        {item.answer.split(/\n\d+\. |\n- /).map((step, idx2) => step.trim() && <li key={idx2} style={{ marginBottom: '0.7em' }}>{step.trim()}</li>)}
                      </ol>
                    ) : (
                      <span>{item.answer}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
      <footer style={{ textAlign: 'center', marginTop: '2em', color: '#64748b', fontSize: '0.95em', position: 'relative', zIndex: 2, background: 'rgba(255,255,255,0.85)', padding: '1em 0', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ marginBottom: '0.5em' }}>
          <img src="https://img.icons8.com/ios-filled/50/2563eb/law.png" alt="Law Icon" style={{ width: '40px', verticalAlign: 'middle', marginRight: '0.5em' }} />
          <img src="https://img.icons8.com/ios-filled/50/2563eb/artificial-intelligence.png" alt="AI Icon" style={{ width: '40px', verticalAlign: 'middle', marginRight: '0.5em' }} />
        </div>
        &copy; {new Date().getFullYear()} Legal Assistant. Powered by FastAPI &amp; React.
      </footer>
      {/* Background overlay for law books image */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        background: 'url(https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80) center/cover no-repeat',
        opacity: 0.18,
        pointerEvents: 'none',
      }}></div>
    </div>
  );
}

export default App;
