"use client";

import { clsx, type ClassValue } from "clsx";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Brain, Layers, Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function FloatingElement({ children, delay = 0, duration = 5, className }: { children: React.ReactNode, delay?: number, duration?: number, className?: string }) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0],
        rotate: [0, 2, -2, 0],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function MouseFollower() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the mouse movement
  const springConfig = { damping: 25, stiffness: 150 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 100); // Center offset
      mouseY.set(e.clientY - 100);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{ x, y }}
      className="fixed top-0 left-0 w-[200px] h-[200px] bg-primary/20 blur-[100px] rounded-full pointer-events-none z-0"
    />
  );
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-primary/30">
        <MouseFollower />
        
        {/* Navigation */}
        <nav className="fixed top-0 w-full z-50 px-6 py-6 flex items-center justify-between mix-blend-difference">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black">
                    <Brain size={16} />
                </div>
                <span>Antigravity<span className="text-gray-400">AI</span></span>
            </div>
            
            <div className="flex items-center gap-4">
                <Link 
                    href="/login" 
                    className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                    Log In
                </Link>
                <Link 
                    href="/register" 
                    className="px-5 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-gray-200 transition-all hover:scale-105 active:scale-95"
                >
                    Get Started
                </Link>
            </div>
        </nav>

        {/* Hero Section */}
        <main ref={containerRef} className="relative pt-32 pb-20 px-6 md:px-12 lg:px-24 flex flex-col items-center justify-center min-h-[90vh]">
            
            {/* Background Floating Elements (The "AntiGravity" Feel) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <FloatingElement delay={0} duration={8} className="absolute top-[20%] left-[10%] opacity-20">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 blur-xl" />
                </FloatingElement>
                <FloatingElement delay={1} duration={10} className="absolute top-[40%] right-[15%] opacity-20">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 blur-2xl" />
                </FloatingElement>
                <FloatingElement delay={2} duration={7} className="absolute bottom-[20%] left-[30%] opacity-10">
                     <Zap className="w-24 h-24 text-blue-400" />
                </FloatingElement>
            </div>

            <motion.div 
                style={{ y: y1, opacity }}
                className="relative z-10 text-center max-w-5xl mx-auto"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-medium text-gray-300 mb-8"
                >
                    <Sparkles size={12} className="text-yellow-300" />
                    <span>Next Generation Content Engine</span>
                </motion.div>

                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="text-6xl md:text-8xl font-bold tracking-tighter leading-[1.1] mb-8 bg-gradient-to-b from-white via-white to-gray-500 bg-clip-text text-transparent"
                >
                    Ai Content <br /> Management
                </motion.h1>

                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
                >
                    Experience the future of digital creation. 
                    <span className="text-white block mt-2">Zero friction. Infinite possibilities.</span>
                </motion.p>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    className="flex items-center justify-center gap-4"
                >
                    <Link href="/register" className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold text-lg hover:bg-gray-100 transition-all active:scale-95 flex items-center gap-2">
                        Start Creating
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link href="/login" className="px-8 py-4 rounded-full border border-white/20 hover:bg-white/10 transition-all font-semibold text-lg active:scale-95 backdrop-blur-sm">
                        View Demo
                    </Link>
                </motion.div>
            </motion.div>

            {/* Floating Cards Demo */}
            <motion.div 
                style={{ y: y2 }}
                className="mt-32 w-full grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10"
            >
                {[
                  { title: "Smart Generation", icon: Brain, desc: "Context-aware AI builds content that feels human.", color: "bg-blue-500/10 text-blue-400" },
                  { title: "Instant Scale", icon: Layers, desc: "Generate thousands of variations in seconds.", color: "bg-purple-500/10 text-purple-400" },
                  { title: "Real-time Flow", icon: Zap, desc: "Seamless integration with your existing workflow.", color: "bg-orange-500/10 text-orange-400" }
                ].map((item, i) => (
                    <FloatingElement key={i} delay={i * 0.5} duration={6 + i}>
                        <div className="p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors group">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${item.color} group-hover:scale-110 transition-transform`}>
                                <item.icon size={24} />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{item.desc}</p>
                        </div>
                    </FloatingElement>
                ))}
            </motion.div>
        </main>
        
        {/* Footer */}
        <footer className="border-t border-white/10 py-12 bg-black/50 backdrop-blur-lg">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
                <p>&copy; 2026 Antigravity AI. All rights served.</p>
                <div className="flex gap-6 mt-4 md:mt-0">
                    <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                    <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                    <Link href="#" className="hover:text-white transition-colors">Contact</Link>
                </div>
            </div>
        </footer>
    </div>
  );
}
