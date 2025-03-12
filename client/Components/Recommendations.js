import React, { useState } from 'react';

const Recommendations = () => {
  const [userQuery, setUserQuery] = useState('');
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecommendation('');

    try {
      const response = await fetch('/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userQuery }),
      });

      if (response.status !== 200) {
        const parsedError = await response.json();
        setError(parsedError.err);
      } else {
        const parsedResponse = await response.json();
        setRecommendation(parsedResponse.movieRecommendation);
      }
    } catch (_err) {
      setError('Error fetching recommendation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <form onSubmit={handleSubmit}>
        <label>
          I want to watch a movie about:
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Enter movie summary"
            style={{ width: '100%', padding: '8px', marginTop: '8px' }}
          />
        </label>
        <label>
          Start year:
          <input
            type="number"
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            placeholder="Enter start year"
            style={{ width: '100%', padding: '8px', marginTop: '8px' }}
          />
        </label>
        <label>
          End year:
          <input
            type="number"
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            placeholder="Enter end year"
            style={{ width: '100%', padding: '8px', marginTop: '8px' }}
          />
        </label>
        <button type="submit" style={{ marginTop: '16px' }} disabled={loading}>
          {loading ? 'Loading...' : 'Get Recommendation'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {recommendation && (
        <div style={{ marginTop: '24px' }}>
          <h2>Recommendation:</h2>
          <p>{recommendation}</p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;