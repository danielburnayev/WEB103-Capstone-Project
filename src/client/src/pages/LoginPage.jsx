import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getAllUsers } from "../services/usersAPI.jsx";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    try {
      setIsSubmitting(true);
      setError("");
      const users = await getAllUsers();
      const matchedUser = users.find(
        (user) =>
          `${user.email}`.toLowerCase() === email.trim().toLowerCase() &&
          `${user.password}` === password.trim() &&
          !user.is_guest
      );

      if (!matchedUser) {
        setError("Invalid email or password.");
        return;
      }

      window.localStorage.setItem("insync-user-id", `${matchedUser.id}`);
      window.localStorage.setItem("insync-user-email", matchedUser.email);
      navigate("/");
    } catch {
      setError("Could not log in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <Header navItems={[{ label: "Back Home", onClick: () => navigate("/") }]} />

      <main className="flex flex-1 items-center justify-center px-6">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md border border-gray-200 rounded-xl p-8 flex flex-col gap-5"
        >
          <h2 className="text-3xl font-bold text-center">Log in</h2>
          <p className="text-gray-600 text-center">Use your email and password to continue.</p>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-4 py-3"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded px-4 py-3"
            required
          />

          <button
            type="submit"
            className="bg-black text-white py-3 rounded font-semibold transition hover:bg-gray-800 active:scale-[0.98]"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
          {error ? <p className="text-red-600 text-sm text-center">{error}</p> : null}
        </form>
      </main>
    </div>
  );
}

export default LoginPage;
