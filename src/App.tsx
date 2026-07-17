import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
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

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
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
        <Toasts />
        <LevelUpOverlay />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
