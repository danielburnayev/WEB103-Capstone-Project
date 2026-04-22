function SignUp() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-20">
      <h1 className="text-3xl font-bold">Insync Calendar</h1>
      <div className="flex flex-col gap-10 w-sm p-8 rounded shadow">
        <div className="flex flex-col items-center justify-center gap-1">
          <h2 className="text-3xl font-bold">Create an Account</h2>
          <p className="text-gray-500">Sign up to get started</p>
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
            Sign Up
          </button>
        </form>
        <p className="text-center text-gray-500">Already have an account? <a href="/signin" className="text-black font-semibold hover:underline">Sign In</a></p>
      </div>
    </div>
  );
}

export default SignUp;
