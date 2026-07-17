import { motion } from 'framer-motion';
import { Rocket, ShieldAlert } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background z-0" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center z-10 space-y-6"
      >
        <div className="flex justify-center">
          <motion.div
            animate={{ 
              y: [0, -10, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <ShieldAlert className="h-24 w-24 text-primary opacity-80" />
          </motion.div>
        </div>
        
        <h1 className="font-heading text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="font-heading text-2xl uppercase tracking-widest text-white/90">Signal Lost</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            The coordinates you requested do not exist in our flight plan.
            Please verify your trajectory and try again.
          </p>
        </div>

        <div className="pt-8">
          <Link href="/">
            <Button size="lg" className="uppercase tracking-widest font-heading rounded-none">
              Return to Mission Control
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
