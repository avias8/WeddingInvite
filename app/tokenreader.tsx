"use client"; // Marks this file as a client-side component

import { useState, useEffect } from "react";

export default function TokenReader() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Function to extract the token from the URL hash
    const extractTokenFromHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#")) {
        setToken(hash.substring(1)); // Remove the "#" and set the token
      } else {
        setToken(null);
      }
    };

    // Call the function on component mount
    extractTokenFromHash();

    // Optional: Listen for hash changes and update the token
    const handleHashChange = () => extractTokenFromHash();
    window.addEventListener("hashchange", handleHashChange);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <div className="p-4 border rounded">
      <h1 className="text-lg font-bold">Token Reader</h1>
      {token ? (
        <p>
          The token in the URL is: <strong>{token}</strong>
        </p>
      ) : (
        <p>No token found in the URL.</p>
      )}
    </div>
  );
}
