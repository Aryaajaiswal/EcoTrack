/** Authenticated app layout with navbar. */
import { Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navbar from '../components/Navbar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#030712]">
      <Navbar />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>
    </div>
  )
}
