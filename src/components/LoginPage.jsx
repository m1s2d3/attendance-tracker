import React from "react";

const LoginPage = ({ username, setUsername, error, handleLogin ,setError}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-login px-4 py-8">
      <div className="text-white mt-2 text-center">
        <h1 className="text-4xl font-bold mb-2">Presence+</h1>
        <p className="text-sm">Track your daily attendance records.</p>
      </div>
      <div style={{ width: "15rem", height: "20rem" }}>
        <img
          src="../../public/welcome.png"
          alt="Welcome Illustration"
          className="w-full max-w-lg rounded-lg shadow-md"
        />
      </div>
      <div style={{ width: "15rem" }} className="mb-4">
        <label
          htmlFor="name"
          className="block text-sm text-white font-medium mb-2"
        >
          Enter Your Name
        </label>
        <input
          style={{ borderRadius: "25px" }}
          type="text"
          placeholder="Enter Your Name"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setError((prev) => ({ ...prev, usernameError: "" }));
          }}
          className="w-full px-4 py-2 border border-gray-500 rounded-lg focus:outline-none focus:border-black"
        />
        {error.usernameError && (
          <p className="text-red-500 text-xs mb-2">{error.usernameError}</p>
        )}
        <button
          style={{ borderRadius: "25px" }}
          onClick={handleLogin}
          className="w-full px-4 mt-4 py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition duration-300"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default LoginPage;