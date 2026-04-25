import { useState } from 'react'
import axios from 'axios'
import { AlertTriangle, CheckCircle, RefreshCw, Send, Brain, Scale, Activity, ShieldCheck, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [formData, setFormData] = useState({
    region: 'North District',
    population: 5,
    damage: 8,
    income: 3
  })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [chatQuestion, setChatQuestion] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [chatLoading, setChatLoading] = useState(false)

  const handleAnalyze = async (e) => {
    e?.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:3001/analyze', formData)
      setResult(res.data)
      setChatHistory([])
    } catch (err) {
      console.error(err)
      alert('Error analyzing data. Is the backend running?')
    }
    setLoading(false)
  }

  const handleFixBias = async () => {
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:3001/fix-bias', formData)
      setResult(res.data)
    } catch (err) {
      console.error(err)
      alert('Error fixing bias.')
    }
    setLoading(false)
  }

  const handleAsk = async (e) => {
    e.preventDefault()
    if (!chatQuestion) return
    
    const newHistory = [...chatHistory, { role: 'user', content: chatQuestion }]
    setChatHistory(newHistory)
    setChatQuestion('')
    setChatLoading(true)
    
    try {
      const res = await axios.post('http://localhost:3001/ask', {
        question: newHistory[newHistory.length - 1].content,
        context_data: { formData, result }
      })
      setChatHistory([...newHistory, { role: 'ai', content: res.data.answer }])
    } catch (err) {
      console.error(err)
      alert('Error asking question.')
    }
    setChatLoading(false)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  }

  const getFairnessColor = (score) => {
    if (score > 70) return { border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-400' }
    if (score >= 40) return { border: 'border-amber-500/30', bg: 'bg-amber-500/10', text: 'text-amber-400' }
    return { border: 'border-rose-500/30', bg: 'bg-rose-500/10', text: 'text-rose-400' }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto flex flex-col xl:flex-row gap-8 font-sans text-slate-100 overflow-hidden relative">
      
      {/* Abstract Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Column: Input Form */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full xl:w-1/3 flex flex-col space-y-6 z-10"
      >
        <div className="glass p-8 rounded-3xl relative overflow-hidden border border-white/10 group shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-violet-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
          
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10 glow-effect">
              <Brain className="text-cyan-400 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight gradient-text">FairSight AI</h1>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2 mt-1">
                <Zap className="w-3 h-3 text-amber-400" /> Powered by Gemma 4
              </p>
            </div>
          </div>
          
          <div className="h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent my-6" />
          
          <motion.form 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            onSubmit={handleAnalyze} 
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-semibold text-slate-300 mb-2 uppercase tracking-wider text-xs">Region Target</label>
              <input 
                type="text" 
                value={formData.region}
                onChange={e => setFormData({...formData, region: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder-slate-500 shadow-inner"
                placeholder="e.g. North District"
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider text-xs">Total Population</label>
              </div>
              <input 
                type="number" min="1"
                value={formData.population}
                onChange={e => setFormData({...formData, population: Number(e.target.value) || ''})}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder-slate-500 shadow-inner"
                placeholder="e.g. 50000"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider text-xs">Damage Assessment</label>
                <span className="text-rose-400 font-mono bg-rose-400/10 px-2 py-1 rounded text-xs">{formData.damage}/10</span>
              </div>
              <input 
                type="range" min="1" max="10" 
                value={formData.damage}
                onChange={e => setFormData({...formData, damage: Number(e.target.value)})}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-end mb-2">
                <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider text-xs">Socio-Economic Index</label>
                <span className="text-emerald-400 font-mono bg-emerald-400/10 px-2 py-1 rounded text-xs">{formData.income}/10</span>
              </div>
              <input 
                type="range" min="1" max="10" 
                value={formData.income}
                onChange={e => setFormData({...formData, income: Number(e.target.value)})}
              />
            </motion.div>

            <motion.div variants={itemVariants} className="pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full relative overflow-hidden group bg-white/5 border border-white/10 hover:border-cyan-500/50 text-white font-bold py-4 rounded-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-violet-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center gap-2">
                  {loading ? <RefreshCw className="animate-spin w-5 h-5 text-cyan-400" /> : <Activity className="w-5 h-5 text-cyan-400" />}
                  <span className="tracking-wide">{loading ? 'Running AI Audit...' : 'Execute Fairness Audit'}</span>
                </div>
              </button>
            </motion.div>
          </motion.form>
        </div>
      </motion.div>

      {/* Right Column: Results & Interaction */}
      <div className="w-full xl:w-2/3 flex flex-col gap-6 z-10 relative h-full min-h-[600px]">
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col gap-6 h-full"
            >
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
                  className="glass p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl"
                >
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl" />
                  <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">Raw Priority Score</p>
                  <div className="flex items-baseline gap-1">
                    <h2 className="text-6xl font-black text-white tracking-tighter">{result.score}</h2>
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}
                  className={`glass p-8 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden border shadow-xl ${getFairnessColor(result.fairness_score).border}`}
                >
                  <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl ${getFairnessColor(result.fairness_score).bg}`} />
                  <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-2">AI Fairness Index</p>
                  <div className="flex items-baseline gap-1">
                    <h2 className={`text-6xl font-black tracking-tighter ${getFairnessColor(result.fairness_score).text}`}>
                      {result.fairness_score}
                    </h2>
                    <span className="text-slate-500 font-medium">/100</span>
                  </div>
                </motion.div>
              </div>

              {/* AI Analysis */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="glass p-8 rounded-3xl flex flex-col flex-grow relative overflow-hidden shadow-xl"
              >
                <div className="flex items-start gap-5 mb-8">
                  {result.bias_detected ? (
                    <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400 border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)] shrink-0">
                      <AlertTriangle className="w-8 h-8" />
                    </div>
                  ) : (
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)] shrink-0">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">Audit Report</h3>
                    <p className="text-slate-300 leading-relaxed text-lg">{result.explanation}</p>
                  </div>
                </div>
                
                <div className="border-t border-white/5 pt-6 mt-auto">
                  <h4 className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-wider">Recommended Action</h4>
                  <p className="text-slate-300 leading-relaxed mb-6">{result.suggestion}</p>
                  
                  {result.bias_detected && (
                      <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleFixBias}
                      disabled={loading}
                      className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-violet-500/25 transition-all flex items-center justify-center gap-3 border border-violet-400/30"
                    >
                      {loading ? <RefreshCw className="animate-spin w-5 h-5" /> : <Scale className="w-5 h-5" />}
                      <span>Fix Bias</span>
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Ask AI Feature */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="glass p-6 md:p-8 rounded-3xl flex flex-col shadow-xl"
              >
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                  <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400"><Brain className="w-5 h-5" /></div>
                  Deep Dive Analysis
                </h3>
                
                {chatHistory.length > 0 && (
                  <div className="mb-6 space-y-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
                    <AnimatePresence>
                      {chatHistory.map((msg, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[85%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-cyan-600 text-white rounded-tr-sm' : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-sm shadow-inner'}`}>
                            {msg.content}
                          </div>
                        </motion.div>
                      ))}
                      {chatLoading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm flex gap-2 items-center shadow-inner">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <form onSubmit={handleAsk} className="flex gap-3 relative mt-auto">
                  <input 
                    type="text" 
                    value={chatQuestion}
                    onChange={e => setChatQuestion(e.target.value)}
                    placeholder="Ask a specific question about these results..."
                    className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-4 pl-5 pr-16 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all placeholder-slate-500 shadow-inner"
                  />
                  <button 
                    type="submit" 
                    disabled={chatLoading || !chatQuestion.trim()}
                    className="absolute right-2 top-2 bottom-2 aspect-square bg-white/10 hover:bg-white/20 text-cyan-400 rounded-xl transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed border border-white/5"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass h-full rounded-3xl flex flex-col items-center justify-center p-12 text-center border-dashed border border-white/10 min-h-[600px] shadow-2xl"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full" />
                <Brain className="w-24 h-24 mb-6 text-white/20 relative z-10" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Awaiting Parameters</h2>
              <p className="text-slate-400 max-w-sm">Adjust the sliders on the left and execute the audit to visualize the fairness report.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default App
