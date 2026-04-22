function SignIn() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-20 bg-gray-50">
      <h1 className="text-3xl font-bold">Insync Calendar</h1>
      <div className="flex flex-col gap-10 w-sm bg-gray-50 p-8 rounded shadow">
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-3xl font-bold">Welcome Back!</h2>
          <p className="text-gray-500">Sign in to your account</p>
        </div>
        <form className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="Email"
            className="border border-gray-300 rounded px-4 py-3"
          />
          <input
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded px-4 py-3"
          />
          <button
            type="submit"
            className="bg-black text-white py-3 rounded font-semibold hover:opacity-80 transition mt-1"
          >
            Sign In
          </button>
        </form>
        <p className="text-center text-gray-500">Don't have an account? <a href="/signup" className="text-black font-semibold hover:underline">Sign Up</a></p>
      </div>
    </div>
  );
}

export default SignIn;
