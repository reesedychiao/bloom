import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router";
import { AuthGate } from "./features/auth/AuthGate";
import { Garden } from "./screens/Garden";
import { FlowerDetail } from "./screens/FlowerDetail";
import { Applications } from "./screens/Applications";
import { SpeciesGallery } from "./screens/SpeciesGallery";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* dev-only art direction view; static art, no data, no auth needed */}
          <Route path="/species" element={<SpeciesGallery />} />
          <Route path="/" element={<AuthGate><Garden /></AuthGate>} />
          <Route path="/flower/:id" element={<AuthGate><FlowerDetail /></AuthGate>} />
          <Route path="/applications" element={<AuthGate><Applications /></AuthGate>} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
