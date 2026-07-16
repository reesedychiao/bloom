import { AuthGate } from "./features/auth/AuthGate";
import { Garden } from "./screens/Garden";

export default function App() {
  return (
    <AuthGate>
      <Garden />
    </AuthGate>
  );
}
