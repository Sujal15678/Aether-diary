import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030508]">
        <motion.div
          className="relative"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-16 h-16 border-2 border-[#00E5FF]/20 border-t-[#00E5FF] rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-2 border-transparent border-t-[#00E5FF]/40 rounded-full blur-sm" />
        </motion.div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" />;
};
