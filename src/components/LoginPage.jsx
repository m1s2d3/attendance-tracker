import React from "react";

const LoginPage = ({ username, setUsername, error, handleLogin ,setError}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="text-gray-800 mb-6 text-center">
        <h1 style={{    fontSize: '52px'}} className="text-4xl font-bold mb-2">PRESENCE</h1>
        <p className="text-md">Track your daily attendance records.</p>
      </div>
      <div style={{ width: '17rem',height: '20rem' }}>
        <img
          src="/welcome.png"
          alt="Welcome Illustration"
          className="w-full max-w-lg rounded-lg"
        />
      </div>
      <div className="w-full max-w-md mx-auto mb-4 px-4">
  <label
    htmlFor="name"
    className="block text-sm text-gray-800 font-medium mb-2"
  >
    Enter Your Name
  </label>
  <input
    type="text"
    placeholder="Enter Your Name"
    value={username}
    onChange={(e) => {
      setUsername(e.target.value);
      setError((prev) => ({ ...prev, usernameError: "" }));
    }}
    style={{
      borderRadius: "25px",
      boxShadow: "inset 2px 2px 5px #cfcfcf, inset -2px -2px 5px #ffffff",
      border: "1px solid #ccc",
      padding: "12px 20px",
      fontSize: "16px",
      transition: "all 0.2s ease-in-out",
      background:'white'
    }}
    className="w-full mb-2 bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
  />
  <button
    disabled={username?.length === 0}
    onClick={handleLogin}
    className="w-full mt-4 py-3 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Get Started
  </button>
</div>
    </div>
  );
};

export default LoginPage;