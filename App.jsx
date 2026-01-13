
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Play, 
  Trash2, 
  History, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Code2, 
  Lightbulb,
  Copy,
  Zap,
  Terminal,
  Cpu,
  Sparkles,
  ArrowRight,
  Plus,
  Share2,
  Rocket,
  Github,
  Globe,
  ExternalLink,
  X
} from 'lucide-react';
import { Button } from './components/Button';
import { fixPythonCode } from './services/gemini';
import { FixResult, HistoryItem } from './types';

declare const Prism: any;

const App: React.FC = () => {
  const [inputCode, setInputCode] = useState<string>("def calculate_sum(a, b)\n    # Erreur de syntaxe : il manque les deux-points\n    result = a + b\nreturn result\n\n# Erreur potentielle de type\nprint(calculate_sum(10, '20'))");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<FixResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showDeployGuide, setShowDeployGuide] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('ai_code_fixer_history_v2');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_code_fixer_history_v2', JSON.stringify(history));
  }, [history]);

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleFixCode = async () => {
    if (!inputCode.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await fixPythonCode(inputCode);
      setCurrentResult(result);
      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        originalCode: inputCode,
        result: result
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
    } catch (error) {
      console.error(error);
      alert("L'analyse a échoué. Vérifiez votre connexion.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus('idle'), 2000);
  };

  const highlightCode = useCallback((code: string) => {
    if (typeof Prism !== 'undefined') {
      return Prism.highlight(code, Prism.languages.python, 'python');
    }
    return code;
  }, []);

  const LineNumbers = ({ count }: { count: number }) => (
    <div className="flex flex-col text-right pr-4 text-slate-600 select-none border-r border-slate-800/50 mr-4 font-mono text-sm leading-6">
      {Array.from({ length: Math.max(count, 1) }).map((_, i) => (
        <span key={i}>{i + 1}</span>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col text-slate-200">
      {/* Background Decor */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-white/5 bg-slate-950/40 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-lg opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-2xl shadow-xl">
                <Cpu className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                FIXER <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-lg text-xs tracking-widest font-black border border-blue-500/20">PRO</span>
              </h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Neural Debugging Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden lg:flex border border-blue-500/20 text-blue-400 hover:bg-blue-500/10" onClick={() => setShowDeployGuide(true)}>
              <Rocket className="w-4 h-4" />
              Mettre en ligne
            </Button>
            <Button variant="ghost" className="hidden sm:flex" onClick={() => setShowHistory(true)}>
              <History className="w-4 h-4" />
              Historique
            </Button>
            <Button variant="primary" onClick={handleFixCode} isLoading={isAnalyzing} className="px-8 glow-on-hover">
              <Zap className="w-4 h-4 fill-current" />
              Analyser le Code
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-screen-2xl mx-auto w-full p-6 grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Editor Zone */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-blue-400" />
              <h2 className="font-bold text-slate-300 uppercase tracking-widest text-xs">Script Source</h2>
            </div>
            <Button variant="ghost" className="h-8 px-2 text-[10px]" onClick={() => setInputCode("")}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Effacer
            </Button>
          </div>

          <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col transition-all duration-500 ring-1 ring-white/10 hover:ring-blue-500/30">
            <div className="bg-slate-900/80 px-4 py-2 flex items-center gap-2 border-b border-white/5">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
              </div>
              <span className="ml-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">main.py</span>
            </div>
            
            <div className="relative flex-1 flex min-h-[500px]">
              <div className="bg-slate-950/30 py-4">
                <LineNumbers count={inputCode.split('\n').length} />
              </div>
              <div className="relative flex-1 p-4 overflow-hidden">
                <pre 
                  ref={highlightRef}
                  className="absolute inset-0 p-4 m-0 overflow-hidden pointer-events-none code-font whitespace-pre-wrap break-words leading-6"
                  dangerouslySetInnerHTML={{ __html: highlightCode(inputCode) + "\n" }}
                />
                <textarea
                  ref={textareaRef}
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  onScroll={handleScroll}
                  spellCheck={false}
                  className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-blue-400 resize-none outline-none code-font whitespace-pre-wrap break-words z-10 leading-6"
                  placeholder="Collez votre code Python ici..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results Zone */}
        <div className="xl:col-span-5 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h2 className="font-bold text-slate-300 uppercase tracking-widest text-xs">Correction IA</h2>
            </div>
            {currentResult && (
              <Button variant="success" className="h-8 px-3 text-[10px]" onClick={() => handleCopy(currentResult.correctedCode)}>
                <Copy className={`w-3.5 h-3.5 mr-1 ${copyStatus === 'copied' ? 'text-white' : ''}`} />
                {copyStatus === 'copied' ? 'Copié' : 'Copier Code'}
              </Button>
            )}
          </div>

          <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col ring-1 ring-white/10 relative">
            {!currentResult && !isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 float-animation border border-blue-500/20">
                  <Cpu className="w-10 h-10 text-blue-500/60" />
                </div>
                <h3 className="text-xl font-extrabold text-white mb-3">Moteur en attente</h3>
                <p className="text-slate-500 text-sm max-w-[280px] leading-relaxed">
                  Entrez votre script pour lancer l'analyse neuronale et la correction structurelle.
                </p>
              </div>
            ) : isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12">
                <div className="relative w-24 h-24 mb-8">
                  <div className="absolute inset-0 rounded-full border-2 border-blue-500/10"></div>
                  <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
                  <Cpu className="absolute inset-0 m-auto w-8 h-8 text-blue-400 animate-pulse" />
                </div>
                <h3 className="text-xl font-extrabold text-white mb-2">Analyse en cours...</h3>
                <p className="text-slate-500 text-xs font-mono tracking-widest uppercase text-center">Recherche d'erreurs logiques...</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="p-6 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-2 text-blue-400 mb-3">
                    <Lightbulb className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Explication</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed font-medium">
                    {currentResult?.explanation}
                  </p>
                </div>
                
                <div className="p-6 space-y-8">
                   <div>
                      <div className="flex items-center gap-2 text-emerald-400 mb-4">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Code Corrigé</span>
                      </div>
                      <div className="bg-slate-950/80 rounded-2xl p-5 border border-white/5 shadow-inner">
                        <pre className="text-sm code-font overflow-x-auto leading-6">
                          <code dangerouslySetInnerHTML={{ __html: highlightCode(currentResult?.correctedCode || "") }} />
                        </pre>
                      </div>
                   </div>

                   {currentResult?.errors && currentResult.errors.length > 0 && (
                     <div>
                        <div className="flex items-center gap-2 text-rose-400 mb-4">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Erreurs Trouvées</span>
                        </div>
                        <div className="grid gap-3">
                          {currentResult.errors.map((err, idx) => (
                            <div key={idx} className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-4 flex gap-4">
                              <div className="h-fit bg-rose-500/20 text-rose-400 text-[10px] font-black px-2 py-1 rounded-md mt-0.5">L{err.line}</div>
                              <div>
                                <h4 className="text-sm font-bold text-rose-200 mb-1">{err.type}</h4>
                                <p className="text-xs text-slate-400 leading-relaxed">{err.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                     </div>
                   )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Guide de Déploiement */}
      {showDeployGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowDeployGuide(false)} />
          <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Assistant de Déploiement</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Mettez votre app en ligne en 3 étapes</p>
                </div>
              </div>
              <button onClick={() => setShowDeployGuide(false)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Etape 1 */}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-blue-400 group-hover:scale-110 transition-transform">
                    <Github className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white mb-2">1. GitHub</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Créez un dépôt sur GitHub et envoyez vos fichiers dessus. C'est votre coffre-fort de code.
                  </p>
                </div>
                {/* Etape 2 */}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-110 transition-transform">
                    <Globe className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white mb-2">2. Vercel</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Liez votre compte GitHub à Vercel.com. Choisissez votre projet et cliquez sur "Deploy".
                  </p>
                </div>
                {/* Etape 3 */}
                <div className="bg-white/5 p-6 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group">
                  <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center mb-4 text-amber-400 group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-white mb-2">3. Clé API</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Dans Vercel, ajoutez la variable d'environnement <b>API_KEY</b> avec votre clé Gemini.
                  </p>
                </div>
              </div>

              <div className="bg-blue-500/10 p-6 rounded-[32px] border border-blue-500/20">
                <h4 className="text-sm font-bold text-blue-300 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Astuce d'expert
                </h4>
                <p className="text-xs text-blue-200/70 leading-relaxed">
                  Pas besoin de serveur ! Cette application est dite "Serverless", ce qui signifie qu'elle est gratuite à héberger sur Vercel tant que vous n'avez pas des millions d'utilisateurs.
                </p>
              </div>

              <div className="flex gap-4">
                <Button className="flex-1 py-4 text-sm" variant="primary" onClick={() => window.open('https://vercel.com/new', '_blank')}>
                  Ouvrir Vercel <ExternalLink className="w-4 h-4" />
                </Button>
                <Button className="flex-1 py-4 text-sm" variant="secondary" onClick={() => setShowDeployGuide(false)}>
                  J'ai compris
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modern Sidebar History */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setShowHistory(false)} />
          <aside className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl border-l border-white/5 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-500">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white">HISTORIQUE</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Vos dernières analyses</p>
              </div>
              <Button variant="ghost" className="rounded-full w-12 h-12 p-0" onClick={() => setShowHistory(false)}>
                <Plus className="w-6 h-6 rotate-45" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-30 text-center">
                  <History className="w-16 h-16 mb-4" />
                  <p className="font-bold text-sm">AUCUN ENREGISTREMENT</p>
                </div>
              ) : (
                history.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => { setInputCode(item.originalCode); setCurrentResult(item.result); setShowHistory(false); }}
                    className="group relative bg-white/5 hover:bg-white/10 border border-white/5 rounded-3xl p-5 cursor-pointer transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-400 mb-1">{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setHistory(h => h.filter(i => i.id !== item.id)); }}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-rose-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <pre className="text-[10px] text-slate-400 truncate font-mono bg-slate-950/50 p-3 rounded-xl">
                      {item.originalCode.split('\n')[0]}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 px-10 border-t border-white/5 bg-slate-950/50 flex justify-between items-center text-slate-500 text-[10px] font-bold tracking-widest uppercase">
        <div className="flex gap-6">
          <span className="hover:text-blue-400 cursor-pointer transition-colors">Core 2.5.0</span>
          <span className="hover:text-blue-400 cursor-pointer transition-colors">Neural-Net-Active</span>
        </div>
        <p className="flex items-center gap-1.5">
          <span>&copy; 2025 AI FIXER PRO</span>
          <span className="text-slate-700">|</span>
          <span className="text-blue-400/80 flex items-center gap-1">
            <Zap className="w-3 h-3" /> 
            powered by <span className="text-blue-400 font-black">the y1hya_x</span>
          </span>
        </p>
      </footer>
    </div>
  );
};

export default App;
