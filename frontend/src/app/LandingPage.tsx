"use client"
import { AlertCircle, CheckCircle, Shield, Zap, Search } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center w-full px-4 max-w-6xl mx-auto text-foreground">
      {/* Hero Section */}
      <div className="text-center py-24 mt-8 flex flex-col items-center max-w-4xl mx-auto">
         <div className="bg-red-500/10 text-red-500 font-bold px-4 py-1.5 rounded-full text-sm mb-8 border border-red-500/20 flex items-center gap-2 shadow-sm">
           <Zap size={16} fill="currentColor"/> Powered by PgVector AI
         </div>
         <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
           Reunite missing pets using <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">visual intelligence.</span>
         </h1>
         <p className="text-xl text-muted-foreground max-w-3xl mb-12 leading-relaxed">
           PetFinder mathematically searches neighborhood reports using advanced embedding networks to track lost pets instantly.
         </p>
         
         <Link href="/sign-in">
           <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-primary/20 cursor-pointer">
              Access the Radar <Search size={20}/>
           </button>
         </Link>
      </div>
      
      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 py-16 w-full mt-10 border-t border-border">
         <div className="bg-card text-card-foreground p-8 rounded-3xl border border-border shadow-sm flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition duration-300">
           <div className="bg-orange-500/10 p-4 rounded-full text-orange-500 mb-5 border border-orange-500/20">
             <AlertCircle size={28}/>
           </div>
           <h3 className="text-xl font-bold mb-3 tracking-tight">Broadcast Alerts</h3>
           <p className="text-muted-foreground text-sm leading-relaxed">Upload a clear photo array and geospatial location string. The system pushes it directly to the active radar.</p>
         </div>
         
         <div className="bg-card text-card-foreground p-8 rounded-3xl border border-border shadow-sm flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition duration-300">
           <div className="bg-purple-500/10 p-4 rounded-full text-purple-500 mb-5 border border-purple-500/20">
             <Shield size={28}/>
           </div>
           <h3 className="text-xl font-bold mb-3 tracking-tight">Mathematical Matches</h3>
           <p className="text-muted-foreground text-sm leading-relaxed">Our machine learning algorithms translate animal physiological traits strictly into 512-dimensional queryable vectors.</p>
         </div>
         
         <div className="bg-card text-card-foreground p-8 rounded-3xl border border-border shadow-sm flex flex-col items-center text-center hover:-translate-y-1 hover:shadow-lg transition duration-300">
           <div className="bg-emerald-500/10 p-4 rounded-full text-emerald-500 mb-5 border border-emerald-500/20">
             <CheckCircle size={28}/>
           </div>
           <h3 className="text-xl font-bold mb-3 tracking-tight">High-confidence Locks</h3>
           <p className="text-muted-foreground text-sm leading-relaxed">When a found pet overlaps with your missing vector threshold, you instantly get the alert to safely cross-reference.</p>
         </div>
      </div>
    </div>
  )
}
