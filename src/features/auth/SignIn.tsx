import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";

type Status = "idle" | "sending" | "sent" | "error";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;

    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-canvas p-6">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm">
        <h1 className="text-3xl text-ink">Bloom</h1>
        <p className="mt-2 text-ink-soft">
          Tend your job hunt like a garden.
        </p>

        {!supabase ? (
          <p className="mt-6 rounded-lg border border-line bg-canvas p-4 text-sm text-ink-soft">
            Bloom isn’t connected to its garden bed yet. Add your Supabase
            keys to <code className="font-mono text-xs">.env.local</code> and
            reload.
          </p>
        ) : status === "sent" ? (
          <p className="mt-6 rounded-lg border border-line bg-canvas p-4 text-ink-soft">
            Check your inbox — your sign-in link is on its way to{" "}
            <span className="font-mono text-sm text-ink">{email}</span>.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            <label className="text-sm text-ink" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="rounded-lg border border-line bg-canvas px-3 py-2 text-ink placeholder:text-mist"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-2 rounded-lg bg-leaf-deep px-4 py-2 font-semibold text-parchment transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send sign-in link"}
            </button>
            {status === "error" && (
              <p role="alert" className="text-sm text-petal">
                {errorMessage}
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
