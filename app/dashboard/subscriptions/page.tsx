"use client";

import { Badge } from "@/components/ui/badge";
import { Sparkles, Rocket, Crown, Zap, Star, Shield, Cpu } from "lucide-react";

export default function SubscriptionPage() {
  const features = [
    { icon: Zap, label: "Unlimited Reviews", desc: "No limits on AI analysis" },
    { icon: Crown, label: "Priority Queue", desc: "Skip the line, every time" },
    { icon: Star, label: "Deep Analytics", desc: "Insights that matter" },
    { icon: Shield, label: "Team Access", desc: "Collaborate seamlessly" },
    { icon: Cpu, label: "Custom Models", desc: "Tailored AI for your stack" },
  ];

  return (
    <div className="relative min-h-[calc(100vh-6rem)] flex items-center justify-center overflow-hidden px-4">
      {/* Futuristic Grid Background */}
      <div className="absolute inset-0 -z-10">
        {/* Perspective Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(var(--primary-rgb, 139, 92, 246), 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(var(--primary-rgb, 139, 92, 246), 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        
        {/* Glowing Orbs */}
        <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 right-0 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[80px]" />
        
        {/* Animated Scan Line */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scan" />
        </div>
        
        {/* Corner Accents */}
        <div className="absolute top-8 left-8 w-16 h-16 border-l-2 border-t-2 border-primary/20 rounded-tl-lg" />
        <div className="absolute top-8 right-8 w-16 h-16 border-r-2 border-t-2 border-primary/20 rounded-tr-lg" />
        <div className="absolute bottom-8 left-8 w-16 h-16 border-l-2 border-b-2 border-primary/20 rounded-bl-lg" />
        <div className="absolute bottom-8 right-8 w-16 h-16 border-r-2 border-b-2 border-primary/20 rounded-br-lg" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto text-center space-y-10">
        {/* Holographic Badge */}
        <div className="inline-flex">
          <Badge 
            className="px-5 py-2 text-sm font-semibold tracking-wider uppercase bg-gradient-to-r from-primary/20 via-purple-500/20 to-cyan-500/20 border border-primary/30 text-primary backdrop-blur-sm animate-pulse"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Coming Soon
          </Badge>
        </div>

        {/* Hero Section */}
        <div className="space-y-6">
          {/* Animated Icon */}
          <div className="relative inline-flex justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 rounded-2xl blur-2xl opacity-40 animate-pulse" />
            <div className="relative p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-600/10 border border-primary/20 backdrop-blur-xl">
              <Rocket className="h-12 w-12 md:h-16 md:w-16 text-primary animate-float" />
            </div>
            {/* Orbiting Dots */}
            <div className="absolute inset-0 animate-orbit">
              <div className="absolute -top-1 left-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
            </div>
            <div className="absolute inset-0 animate-orbit-reverse">
              <div className="absolute -bottom-1 left-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Pro Subscriptions
            </span>
          </h1>
          
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-lg mx-auto leading-relaxed">
            Supercharge your workflow with next-gen AI code reviews.
            <br className="hidden sm:block" />
            <span className="text-foreground/80">Something powerful is loading...</span>
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 max-w-2xl mx-auto">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-4 rounded-xl bg-gradient-to-b from-muted/50 to-muted/20 border border-border/50 hover:border-primary/40 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Hover Glow */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative space-y-2">
                <feature.icon className="h-6 w-6 mx-auto text-primary/80 group-hover:text-primary transition-colors duration-300" />
                <p className="text-xs font-medium text-foreground/90 group-hover:text-foreground transition-colors">{feature.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
          <span className="tracking-wide">In Development</span>
          <span className="text-border">•</span>
          <span className="font-mono text-xs text-primary/70">v2.0</span>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes orbit {
          from { transform: rotate(0deg) translateX(40px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
        }
        @keyframes orbit-reverse {
          from { transform: rotate(360deg) translateX(35px) rotate(-360deg); }
          to { transform: rotate(0deg) translateX(35px) rotate(0deg); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-scan {
          animation: scan 8s linear infinite;
        }
        .animate-orbit {
          animation: orbit 6s linear infinite;
        }
        .animate-orbit-reverse {
          animation: orbit-reverse 8s linear infinite;
        }
      `}</style>
    </div>
  );
}
