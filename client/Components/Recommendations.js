import React, { useState } from 'react';
// import tweetychef from '../public/tweety-chef.png';

const Recommendations = () => {
  const [userQuery, setUserQuery] = useState('');
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
        setRecommendation(parsedResponse.recipeRecommendation);
      }
    } catch (_err) {
      setError('Error fetching recommendation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <img src='https://i.imgur.com/BHvAMch.png' style={{ width: '220px' }} />
      <form onSubmit={handleSubmit}>
        <label>
          <div>I have these ingredients in my fridge:</div>
          <input
            type='text'
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder='Enter names of ingredients separated by commas'
            style={{ width: '50%', padding: '8px', marginTop: '8px' }}
          />
        </label>
        <button type='submit' style={{ marginTop: '16px' }} disabled={loading}>
          {loading ? 'Loading...' : 'Get Me a Recommendation!'}
        </button>
      </form>
      {error && <p className='error'>{error}</p>}
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
