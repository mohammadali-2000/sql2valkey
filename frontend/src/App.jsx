import { useState } from 'react';

function App() {
  const [query, setQuery] = useState('SELECT * FROM users WHERE id = 1;');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleTranslate = async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming backend runs on port 3001
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (!response.ok) {
        throw new Error('Translation failed');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || 'An error occurred connecting to the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-valkey-accent/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>

      <header className="mb-10 text-center relative z-10">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
          SQL2Valkey
        </h1>
        <p className="text-slate-400 text-lg">
          Instantly map PostgreSQL queries to Valkey data structures
        </p>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        {/* Left Side: Input */}
        <section className="glass-panel p-6 flex flex-col">
          <label htmlFor="sql-input" className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            PostgreSQL Query
          </label>
          <textarea
            id="sql-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-sky-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all resize-none shadow-inner"
            placeholder="Enter your SQL query here..."
          />
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleTranslate}
              disabled={loading || !query.trim()}
              className="bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold py-3 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Translating...
                </>
              ) : 'Translate'}
            </button>
          </div>
        </section>

        {/* Right Side: Output */}
        <section className="glass-panel p-6 flex flex-col">
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-6">
            Valkey Equivalent
          </h2>

          <div className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
                {error}
              </div>
            )}

            {!result && !error && !loading && (
              <div className="flex-1 flex items-center justify-center text-slate-500">
                <p>Enter a query and click translate to see the result.</p>
              </div>
            )}

            {result && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-400 uppercase">Data Structure</h3>
                    {result.cached && (
                      <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                        Cache Hit
                      </span>
                    )}
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                    <span className="inline-block bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-md font-mono text-sm">
                      {result.dataStructure || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase">Valkey Command</h3>
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 relative group">
                    <code className="text-emerald-400 font-mono text-sm block whitespace-pre-wrap">
                      {result.valkeyCommand || 'N/A'}
                    </code>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase">Explanation</h3>
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 text-slate-300 leading-relaxed text-sm">
                    {result.explanation || 'No explanation provided.'}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;
