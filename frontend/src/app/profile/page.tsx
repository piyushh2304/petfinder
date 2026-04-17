"use client"
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import axios from 'axios'
import { Target, Trash2, MapPin } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"

export default function PersonalProfile() {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMyPosts() {
      try {
        const token = await getToken()
        if (!token) return;
        const res = await axios.get(`${API_URL}/pets/my-posts`, { headers: { Authorization: `Bearer ${token}` }})
        setPosts(res.data.posts || [])
      } catch (err) {
        console.error("Failed to load profile", err)
      }
      setLoading(false)
    }
    
    if (isLoaded && isSignedIn) {
       fetchMyPosts()
    }
  }, [isLoaded, isSignedIn])

  const handleDelete = async (petId: string) => {
    if (!confirm("Are you sure you want to deactivate this entity? (Mathematical vectors remain in backend training models)")) return;
    const toastId = toast.loading('Initiating Soft Delete sequence...')
    try {
      const token = await getToken()
      await axios.delete(`${API_URL}/pets/${petId}`, { headers: { Authorization: `Bearer ${token}` }})
      setPosts(prev => prev.filter(p => p.id !== petId))
      toast.success('Entity deactivated. Memory retained.', { id: toastId })
    } catch (err) {
      toast.error("Critical failure during entity deactivation.", { id: toastId })
    }
  }

  if (!isLoaded || loading) return <div className="text-center py-40 text-muted-foreground font-black tracking-widest uppercase">Aligning Profile...</div>
  if (!isSignedIn) return <div className="text-center py-40 font-black tracking-widest uppercase text-red-500">Authentication Required.</div>

  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4">
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-border/50">
         <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20"><Target className="text-rose-500" size={32}/></div>
         <div>
            <h2 className="text-3xl font-black uppercase tracking-tight text-foreground">Commander Profile</h2>
            <p className="text-muted-foreground font-medium text-sm mt-1">Manage your strategically deployed Deep Radar instances.</p>
         </div>
      </div>

      {posts.length === 0 ? (
         <div className="bg-card border border-border p-16 rounded-[2rem] text-center text-muted-foreground font-bold text-sm tracking-widest uppercase shadow-sm">
            0 deployed tracking grids active historically.
         </div>
      ) : (
         <div className="grid sm:grid-cols-2 gap-6">
           {posts.map(post => (
             <div key={post.id} className="bg-card border border-border p-6 rounded-[2rem] flex flex-col relative overflow-hidden group shadow-lg">
                <div className="absolute top-0 right-0 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-bl-[1.5rem] z-10 text-[10px] font-black tracking-widest uppercase text-muted-foreground shadow-sm">
                  {post.status}
                </div>
                
                {post.image_url && <img src={post.image_url} alt="pet" className="w-full h-48 object-cover rounded-2xl mb-4 shadow-sm border border-border/50 group-hover:scale-[1.02] transition-transform duration-500"/>}
                
                <h3 className="font-black text-xl uppercase tracking-wider text-foreground">{post.type}</h3>
                <p className="text-sm text-foreground/80 bg-secondary px-3 py-1.5 w-fit rounded-lg mt-2 font-semibold tracking-wide border border-border/50 flex items-center gap-1.5"><MapPin size={14} className="text-primary"/> {post.location}</p>
                {post.description && <p className="text-muted-foreground text-sm mt-4 bg-background p-4 flex-1 rounded-xl border border-border line-clamp-2">{post.description}</p>}
                
                <button 
                   onClick={() => handleDelete(post.id)}
                   className="mt-6 w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl uppercase tracking-widest font-black text-xs transition-all border border-red-500/20 flex justify-center items-center gap-2 group-hover:shadow-md"
                >
                  <Trash2 size={16}/> Disconnect Node
                </button>
             </div>
           ))}
         </div>
      )}
    </div>
  )
}
