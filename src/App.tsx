import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { AuthGate } from "./features/auth/AuthGate";
import { Toasts } from "./components/Toasts";
import { LevelUpOverlay } from "./components/LevelUpOverlay";
import { Garden } from "./screens/Garden";
import { FlowerDetail } from "./screens/FlowerDetail";
import { Applications } from "./screens/Applications";
import { SpeciesGallery } from "./screens/SpeciesGallery";
import { Settings } from "./screens/Settings";
import { Pipeline } from "./screens/Pipeline";
import { Bouquet } from "./screens/Bouquet";
import { Almanac } from "./screens/Almanac";
import { AlmanacPreview } from "./screens/AlmanacPreview";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

/** Routes with a gentle cross-fade + lift between pages (fade only under
 *  reduced motion). Keyed on pathname so each navigation animates. */
function AnimatedRoutes() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          {/* dev-only views: static/mock, no auth needed */}
          <Route path="/species" element={<SpeciesGallery />} />
          <Route path="/almanac-preview" element={<AlmanacPreview />} />
          <Route path="/" element={<AuthGate><Garden /></AuthGate>} />
          <Route path="/flower/:id" element={<AuthGate><FlowerDetail /></AuthGate>} />
          <Route path="/applications" element={<AuthGate><Applications /></AuthGate>} />
          <Route path="/pipeline" element={<AuthGate><Pipeline /></AuthGate>} />
          <Route path="/bouquet" element={<AuthGate><Bouquet /></AuthGate>} />
          <Route path="/almanac" element={<AuthGate><Almanac /></AuthGate>} />
          <Route path="/settings" element={<AuthGate><Settings /></AuthGate>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AnimatedRoutes />
        <Toasts />
        <LevelUpOverlay />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
