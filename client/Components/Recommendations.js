import React, { useState } from 'react';
// import tweetychef from '../public/tweety-chef.png';

const Recommendations = () => {
  const [userQuery, setUserQuery] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [instructions, setInstructions] = useState([]);
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
        setRecommendation(parsedResponse.recipeRecommendation.title);
        setIngredients(parsedResponse.recipeRecommendation.ingredients);
        setInstructions(parsedResponse.recipeRecommendation.instructions);
      }
    } catch (_err) {
      setError('Error fetching recommendation');
    } finally {
      setLoading(false);
    }
  };

 const separateIngredients = ingredients.map(ingredient => <p>{ingredient}</p>);

 const separateInstructions = instructions.map(instruction => <p>{instruction}</p>);
  


  return (
    <div style={{ padding: '20px' }} className='allContent'>
      <div className='topSection'>
        <h1>Let's find a recipe to cook!</h1>
      <img src='https://i.imgur.com/BHvAMch.png' style={{ width: '400px', marginBottom: '40px'}} />
      <form onSubmit={handleSubmit}>
        <label>
          <h3>I have these ingredients:</h3>
          <input
            type='text'
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder='ex. onion, tomato, garlic...'
            style={{ width: '100%', padding: '15px', marginTop: '10px', textAlign: 'center'}}
          />
        </label>
        <button type='submit' style={{ marginTop: '0px' }} disabled={loading}>
          {loading ? 'Loading...' : 'Get Recommendation!'}
        </button>
        {error && <p className='error'>{error}</p>}
      </form>
      </div>    
      {recommendation && (
        <div className='bottomSection'>  
        <div style={{ marginTop: '0px' }} className='recipeDetails' >
          
          <br/>
          <h2>{recommendation}</h2>
          <br/>
          <h3>Ingredients:</h3>
          <div>{separateIngredients}</div>
          <br/>
          <h3 className='Instructions'>Instructions:</h3>
          <div>{separateInstructions}</div>
        </div>
        </div>
      )} 
    </div>
  );
};

export default Recommendations;
