// app/page.js
'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        console.log("Fetching count from /api/route...");
        const response = await fetch('/api/counter');
        console.log("Fetch response:", response); // Log the response object

        if (!response.ok) {
          // If response is not OK, try to get more info from the body
          const errorText = await response.text(); // Get response body as text
          console.error("API Error Response:", errorText);
          throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText.substring(0, 100)}...`);
        }

        const data = await response.json();
        console.log("Received data:", data); // Log the parsed JSON data

        if (data && typeof data.count === 'number') {
          setCount(data.count);
        } else {
          throw new Error("Invalid data format received from API.");
        }
      } catch (e) {
        setError(e.message);
        console.error("Failed to fetch count:", e); // This is the original error console.
      } finally {
        setLoading(false);
      }
    };
    fetchCount();
  }, []); // Empty dependency array means this runs once on mount

  // ... (rest of your component for buttons) ...
  const updateCount = async (action) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/counter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });
      console.log("Update response:", response);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Update Error Response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText.substring(0, 100)}...`);
      }
      const data = await response.json();
      console.log("Received update data:", data);
      setCount(data.count);
    } catch (e) {
      setError(e.message);
      console.error("Failed to update count:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>Simple Full-Stack Counter</h1>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : (
        <h2>Current Count: {count}</h2>
      )}

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={() => updateCount('increment')}
          disabled={loading || !!error}
          style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Increment
        </button>
        <button
          onClick={() => updateCount('decrement')}
          disabled={loading || !!error}
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Decrement
        </button>
      </div>
    </div>
  );
}
