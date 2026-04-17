"use client"
import { useState, useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { MapPin, Search, AlertCircle, CheckCircle, UploadCloud, Trash2, Target } from 'lucide-react'
import LandingPage from './LandingPage'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export default function Dashboard() {
  const { isSignedIn, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState<'upload' | 'matches'>('upload')

  if (!isLoaded) return <div className="flex justify-center py-40 animate-pulse text-muted-foreground font-bold tracking-widest uppercase text-sm">Initializing Radar Network...</div>
  if (!isSignedIn) return <LandingPage />

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-12 flex flex-col items-center gap-10">
       <div className="flex gap-2 p-1.5 bg-secondary/30 rounded-[1.25rem] w-fit mx-auto border border-border shadow-sm backdrop-blur-md">
         <button onClick={() => setActiveTab('upload')} className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'upload' ? 'bg-card shadow-md text-primary border border-border/50' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>Submit Broadcast</button>
         <button onClick={() => setActiveTab('matches')} className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 ${activeTab === 'matches' ? 'bg-card shadow-md text-emerald-500 border border-border/50' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}>Global Radar</button>
       </div>

       <div className="w-full flex justify-center ease-in-out duration-500 animate-in fade-in slide-in-from-bottom-4">
          {activeTab === 'upload' && <UploadForm />}
          {activeTab === 'matches' && <GlobalRadarDashboard />}
       </div>
    </div>
  )
}

function UploadForm() {
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [status, setStatus] = useState<string>('missing')
  const [rapidMatches, setRapidMatches] = useState<any[] | null>(null)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    setRapidMatches(null)
    const formData = new FormData(e.target as HTMLFormElement)
    
    const toastId = toast.loading('Initializing Deep Scan Sequence...')
    
    try {
      const token = await getToken()
      const res = await axios.post(`${API_URL}/pets`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success(res.data.message || 'Successfully uploaded!', { id: toastId })
      
      if (status === 'missing') {
          if (res.data.matches && res.data.matches.length > 0) {
            setRapidMatches(res.data.matches)
            toast.info(`Isolated ${res.data.matches.length} Neural Matches`, { id: toastId })
          } else {
            setRapidMatches([])
            toast.info('No direct matches found. Broadcast active.', { id: toastId })
          }
      } else {
          // Silent clear for 'found' status
          (e.target as HTMLFormElement).reset()
      }
      
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to upload pet.', { id: toastId })
    }
    setLoading(false)
  }

  // If matches exist after upload, redirect view to the matches immediately
  if (rapidMatches !== null) {
    return (
      <div className="w-full max-w-4xl bg-card border border-border p-8 sm:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-500">
        <div className="text-center mb-10 flex flex-col items-center">
          <div className="bg-emerald-500/10 p-5 rounded-full mb-6 border border-emerald-500/20 shadow-inner">
            <CheckCircle className="text-emerald-500" size={48}/>
          </div>
          <h2 className="text-4xl font-black tracking-tight text-foreground uppercase">Target Locked</h2>
          <p className="text-muted-foreground mt-3 max-w-lg leading-relaxed text-sm font-medium">Broadcast transmitted globally. The Deep Radar instantly swept the vector network and discovered these localized matches.</p>
        </div>

        {rapidMatches.length === 0 ? (
          <div className="bg-secondary/20 border border-border p-12 rounded-[2rem] text-center text-muted-foreground font-black text-sm tracking-widest uppercase shadow-inner">
            <Search size={48} className="mx-auto mb-4 opacity-50"/>
            0 Neural Matches Currently Found in Your Grid.<br/>
            <span className="text-primary opacity-80 mt-2 block">Radar will continue listening actively.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mt-4">
            {rapidMatches.map((m: any) => {
              const pct = Math.round(m.final_score * 100)
              return (
                 <div key={m.id} className="bg-background border border-border rounded-2xl flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
                   {m.image_url && <img src={m.image_url} alt="match" className="w-full h-56 object-cover border-b border-border/50 transition-transform duration-700 group-hover:scale-105" />}
                   
                   <div className="absolute top-0 right-0 bg-emerald-500 text-white font-black text-[10px] px-5 py-2 rounded-bl-2xl z-10 shadow-lg uppercase tracking-widest border-b border-emerald-600">
                     {pct}% NEURAL MATCH
                   </div>
                   
                   <div className="p-6 pb-8">
                      <div className="flex justify-between items-start mb-3 bg-secondary/50 -mx-6 -mt-6 p-4 px-6 border-b border-border/50 relative z-20">
                         <h4 className="font-black text-xl tracking-wide uppercase text-foreground">{m.type}</h4>
                         <span className="bg-emerald-500/20 text-emerald-500 px-3 py-1 rounded-lg font-black tracking-widest text-[10px] border border-emerald-500/20 tracking-wider">
                           {m.status}
                         </span>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-4 font-bold tracking-wide"><MapPin size={16} className="text-primary"/> {m.location}</p>
                      {m.description && <p className="text-sm text-foreground/80 mt-3 font-medium bg-secondary/30 p-4 rounded-xl border border-border/30 line-clamp-3 leading-relaxed">{m.description}</p>}
                   </div>
                 </div>
              )
            })}
          </div>
        )}

        <button onClick={() => { setRapidMatches(null); setMsg(''); }} className="mt-12 w-full p-5 bg-background text-foreground rounded-2xl font-black uppercase tracking-widest text-[13px] hover:bg-secondary transition-all border border-border shadow-sm flex items-center justify-center gap-3">
          <UploadCloud size={20}/> Orchestrate New Broadcast
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl bg-card border border-border p-8 sm:p-16 rounded-[2rem] shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px] animate-in zoom-in-95 duration-500">
         <div className="absolute top-0 left-0 w-full h-1 bg-primary animate-pulse"></div>
         
         <div className="relative mb-8">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            <div className="bg-primary/20 p-6 rounded-full border border-primary/30 relative z-10">
               <Search size={48} className="text-primary animate-pulse"/>
            </div>
         </div>
         
         <h2 className="text-3xl font-black tracking-tight text-foreground uppercase animate-pulse">Neural Sweep in Progress</h2>
         <p className="text-muted-foreground mt-4 font-medium text-center max-w-sm">
           Passing image through neural layers. Extracting 2048-dimensional vectors to search the entire global grid...
         </p>
         
         <div className="w-full max-w-xs bg-secondary/50 rounded-full h-1.5 mt-10 overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full bg-primary animate-[translate_2s_ease-in-out_infinite] w-1/3 rounded-full"></div>
         </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl bg-card border border-border p-8 sm:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500"></div>
      
      <div className="text-center mb-10 flex flex-col items-center">
        <div className="bg-primary/10 p-4 rounded-full mb-5 border border-primary/20 shadow-inner">
          <UploadCloud className="text-primary" size={32}/>
        </div>
        <h2 className="text-3xl font-black tracking-tight text-foreground">Submit a Broadcast</h2>
        <p className="text-muted-foreground mt-3 text-sm max-w-md font-medium leading-relaxed">Log a pet securely into the PgVector similarity engine. The more detailed the photo and traits, the higher the vector match accuracy.</p>
      </div>

      {msg && <div className="mb-8 p-5 rounded-2xl bg-orange-500/10 text-orange-500 font-bold border border-orange-500/20 text-center shadow-sm text-sm uppercase tracking-wide">{msg}</div>}
      
      <form onSubmit={handleUpload} className="flex flex-col gap-6">
        <div>
           <label className="text-xs font-black text-muted-foreground mb-3 block uppercase tracking-widest">Classification</label>
           <select name="type" className="w-full p-4 bg-background border border-border rounded-2xl text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer shadow-sm hover:border-border/80" required>
             <option value="Dog">DOG</option>
             <option value="Cat">CAT</option>
             <option value="Bird">BIRD</option>
             <option value="Other">OTHER</option>
           </select>
        </div>
        
        <div>
            <label className="text-xs font-black text-muted-foreground mb-3 block uppercase tracking-widest">Status Protocol</label>
            <div className="flex gap-4">
              <label className={`flex-1 p-5 border rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center gap-3 font-bold shadow-sm ${status === 'missing' ? 'border-red-500 bg-red-500/10 text-red-500 scale-[1.02]' : 'border-border bg-background text-muted-foreground hover:bg-secondary/50'}`}>
                 <input type="radio" name="status" value="missing" required className="hidden" checked={status === 'missing'} onChange={() => setStatus('missing')} /> 
                 <AlertCircle size={28}/> 
                 I LOST A PET
              </label>
              <label className={`flex-1 p-5 border rounded-2xl cursor-pointer transition-all duration-300 flex flex-col items-center gap-3 font-bold shadow-sm ${status === 'found' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 scale-[1.02]' : 'border-border bg-background text-muted-foreground hover:bg-secondary/50'}`}>
                 <input type="radio" name="status" value="found" required className="hidden" checked={status === 'found'} onChange={() => setStatus('found')} /> 
                 <CheckCircle size={28}/> 
                 I FOUND A PET
              </label>
            </div>
        </div>

        <div>
           <label className="text-xs font-black text-muted-foreground mb-3 block uppercase tracking-widest">Geospatial Marker</label>
           <input name="location" placeholder="City or Coordinates" className="w-full p-4 bg-background border border-border rounded-2xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium shadow-sm hover:border-border/80" required/>
        </div>
        
        <div>
           <label className="text-xs font-black text-muted-foreground mb-3 block uppercase tracking-widest">Identifying Metadata</label>
           <textarea name="description" placeholder="Collars, tags, demeanor..." className="w-full p-4 bg-background border border-border rounded-2xl text-foreground h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary transition-all font-medium shadow-sm hover:border-border/80"></textarea>
        </div>
        
        <div>
           <label className="text-xs font-black text-muted-foreground mb-3 block uppercase tracking-widest">Visual Evidence Array</label>
           <input type="file" name="image" accept="image/*" className="w-full p-6 border-2 border-dashed border-border hover:border-primary/50 bg-background rounded-2xl cursor-pointer text-muted-foreground transition-all file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 shadow-sm" required />
        </div>
        
        <button type="submit" className="mt-6 p-5 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-2xl font-black tracking-widest text-base hover:opacity-90 hover:-translate-y-1 active:translate-y-0 transition-all shadow-[0_10px_40px_-10px_rgba(239,68,68,0.5)] uppercase">
          Engage Broadcast
        </button>
      </form>
    </div>
  )
}

function GlobalRadarDashboard() {
  const { getToken, userId } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filtering states
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'missing' | 'found'>('all')

  useEffect(() => {
    fetchPosts()
  }, [statusFilter])

  async function fetchPosts() {
    setLoading(true)
    try {
      const token = await getToken()
      let query = `${API_URL}/pets?`
      if (searchTerm) query += `location=${encodeURIComponent(searchTerm)}&`
      if (statusFilter !== 'all') query += `status=${statusFilter}`
      
      const res = await axios.get(query, { headers: { Authorization: `Bearer ${token}` }})
      setPosts(res.data.pets || [])
    } catch (err) {}
    setLoading(false)
  }

  const handleDelete = async (petId: string) => {
    if (!confirm("Remove this broadcast from the Global Feed? (Deep Neural Vectors will be mathematically preserved for future training/matching)")) return;
    try {
      const token = await getToken()
      await axios.delete(`${API_URL}/pets/${petId}`, { headers: { Authorization: `Bearer ${token}` }})
      setPosts(prev => prev.filter(p => p.id !== petId)) // Remove visibly from DOM
    } catch (err) {
      console.error("Failed to delete", err)
      alert("Failed to wipe entity.")
    }
  }

  return (
    <div className="w-full max-w-6xl flex flex-col gap-6">
      
      {/* Global Filter Console */}
      <div className="w-full bg-card border border-border p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
         <div className="flex bg-background border border-border rounded-xl overflow-hidden w-full sm:w-auto">
            <span className="p-3 text-muted-foreground"><Search size={18}/></span>
            <input 
              type="text" 
              placeholder="Target Pincode or City..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchPosts()}
              className="bg-transparent outline-none p-3 text-sm font-bold w-full sm:w-64 tracking-wide"
            />
            <button onClick={fetchPosts} className="bg-primary/10 text-primary px-5 font-black uppercase text-xs tracking-widest hover:bg-primary/20 transition-all">Scan</button>
         </div>

         <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={() => setStatusFilter('all')} className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${statusFilter === 'all' ? 'bg-primary text-white shadow-md' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>Global</button>
            <button onClick={() => setStatusFilter('missing')} className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${statusFilter === 'missing' ? 'bg-red-500 text-white shadow-md' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>Missing</button>
            <button onClick={() => setStatusFilter('found')} className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all ${statusFilter === 'found' ? 'bg-emerald-500 text-white shadow-md' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>Found</button>
         </div>
      </div>

      {loading ? (
         <div className="flex justify-center py-40 animate-pulse text-muted-foreground font-bold tracking-widest uppercase text-sm">Syncing Radar Feed...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 w-full mt-4">
          {posts.length === 0 ? <p className="text-muted-foreground col-span-full text-center py-32 font-bold tracking-widest text-sm uppercase border-2 border-dashed border-border/50 rounded-[2rem] bg-secondary/10">No tracking signals detected in this sector.</p> : null}
          
          {posts.map(post => (
             <div key={post.id} className="bg-card p-6 rounded-[2rem] shadow-xl border border-border flex flex-col justify-between hover:border-primary/40 transition-all duration-300 group overflow-hidden relative">
                 {post.status === 'missing' ? 
                   <div className="absolute top-0 right-0 bg-red-500 text-white font-black text-[10px] px-5 py-2 rounded-bl-2xl z-10 shadow-sm uppercase tracking-widest">MISSING</div> 
                   : <div className="absolute top-0 right-0 bg-emerald-500 text-white font-black text-[10px] px-5 py-2 rounded-bl-2xl z-10 shadow-sm uppercase tracking-widest">FOUND</div>
                 }
                 
                 {post.user_id === userId && (
                    <button onClick={() => handleDelete(post.id)} className="absolute top-4 left-4 bg-background/80 hover:bg-red-600 text-muted-foreground hover:text-white px-3 py-2 rounded-xl font-bold text-[10px] tracking-widest uppercase transition-all shadow-sm backdrop-blur-md z-20 flex gap-2 items-center border border-border hover:border-red-600">
                      <Trash2 size={12}/> Disconnect Node
                    </button>
                 )}

                 <div>
                   {post.image_url && <img src={post.image_url} alt="pet" className="rounded-2xl object-cover h-64 w-full mb-6 shadow-md border border-border/50 group-hover:scale-[1.03] transition-transform duration-700"/>}
                   <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="font-black text-2xl text-foreground tracking-tight uppercase">{post.type}</h3>
                        {post.description && <p className="text-muted-foreground text-sm mt-1">{post.description}</p>}
                     </div>
                   </div>
                   <p className="text-foreground bg-secondary/40 w-fit px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold tracking-wide border border-border/40"><MapPin size={16} className="text-primary"/> {post.location}</p>
                 </div>
                 
                 <div className="mt-8 border-t border-border/50 pt-6">
                    <MatchTrigger petId={post.id} />
                 </div>
             </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MatchTrigger({ petId }: { petId: string }) {
  const { getToken } = useAuth()
  const [matches, setMatches] = useState<any[]|null>(null)
  const [loading, setLoading] = useState(false)

  const findMatches = async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res = await axios.get(`${API_URL}/pets/${petId}/matches`, { headers: { Authorization: `Bearer ${token}` }})
      setMatches(res.data.matches || [])
    } catch (err) {}
    setLoading(false)
  }

  if (matches === null) {
      return (
        <button 
          onClick={findMatches} 
          className="w-full bg-primary/10 text-primary border border-primary/20 px-4 py-4 rounded-xl font-bold flex justify-center gap-2 items-center hover:bg-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-sm uppercase tracking-widest text-[11px]"
        >
          {loading ? "Aligning Neural Vectors..." : <><Search size={16}/> Initiate Deep Scan</>}
        </button>
      )
  }

  return (
    <div className="flex flex-col gap-4 animate-in slide-in-from-top-2">
      {matches.length === 0 ? <p className="text-[11px] uppercase tracking-widest font-black text-muted-foreground text-center py-4 border border-border rounded-xl bg-background">Radar Clear: 0 Visual Matches</p> : null}
      
      {matches.map(m => {
        const pct = Math.round(m.final_score * 100)
        return (
          <div key={m.id} className="text-sm bg-background border border-border p-3 rounded-2xl flex gap-4 items-center shadow-inner relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
            
            {m.image_url ? (
               <img src={m.image_url} alt="match" className="w-16 h-16 rounded-xl object-cover border border-border/50 shadow-sm" />
            ) : (
               <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center border border-border/50"><Search size={20} className="text-muted-foreground"/></div>
            )}
            
            <div className="flex-1">
               <h4 className="font-black text-xs tracking-widest uppercase text-foreground">{m.type}</h4>
               <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1"><MapPin size={12}/> {m.location}</p>
            </div>
            
            <div className="flex flex-col items-end gap-1">
               <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-lg font-black tracking-widest text-[10px] uppercase shadow-sm border border-emerald-500/20">
                 {m.status}
               </span>
               <span className="text-emerald-500 font-bold text-xs">{pct}% MATCH</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}


