import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Your custom styling

function App() {
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isListening, setIsListening] = useState(false);

  const handleChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearch = async () => {
    if (!query) {
      setError('Please enter a book title or author.');
      setBooks([]);
      setRecommendations([]);
      return;
    }

    try {
      setError(null);

      // ✅ Updated backend function URL
      const response = await axios.get(
        `https://search-app-bookie.azurewebsites.net/api/BookSearchFunction?query=${encodeURIComponent(query)}`
      );

      console.log("Books API response:", response.data);

      // ✅ Assuming backend returns array directly
      if (Array.isArray(response.data) && response.data.length > 0) {
        setBooks(response.data);
      } else {
        setBooks([]);
        setError('No books found. Please try another search.');
      }

      // 🔐 Replace this with your real backend or remove if OpenAI call not ready
     // const openAIResponse = await axios.post('http://localhost:5000/api/openai', { query });
      //setSummary(openAIResponse.data.summary);

      // ✅ Use author from first book for recommendations
      const author = response.data[0].authors?.[0] || '';
      if (author) {
        const recommendationsResponse = await axios.get(
          `https://www.googleapis.com/books/v1/volumes?q=author:${author}`
        );
        setRecommendations(recommendationsResponse.data.items || []);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while searching. Please try again.');
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.start();

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setQuery(result);
      handleSearch();
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      setError('Speech recognition error: ' + event.error);
    };
  };

  return (
    <div className="App">
      <h1>Book Verse</h1>

      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Enter book title or author"
      />
      <button onClick={handleSearch}>Search</button>
      <button onClick={handleVoiceSearch} className="voice-search-button">
        {isListening ? (
          <i className="fas fa-microphone-slash"></i>
        ) : (
          <i className="fas fa-microphone"></i>
        )}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Books List */}
      <ul>
        {books.map((book, index) => (
          <li key={index}>
            <h2>{book.title}</h2>
            <p><strong>Authors:</strong> {book.authors.join(', ')}</p>
            <p>{book.description}</p>
            <p><strong>Price:</strong> {book.price}</p>
            <a href={book.url} target="_blank" rel="noopener noreferrer">View more</a>

            <div>
              <a href={`https://www.clarku.edu/library/search/?search=${book.title}`} target="_blank" rel="noopener noreferrer">
                Check Availability in Clark University Library
              </a>
            </div>
            <div>
              <a href={`https://www.mywpl.org/?q=${book.title}`} target="_blank" rel="noopener noreferrer">
                Check Availability in Worcester Public Library
              </a>
            </div>
            <div>
              <a href={`https://www.amazon.com/s?k=${book.title}`} target="_blank" rel="noopener noreferrer">
                Check on Amazon
              </a>
            </div>
            <div>
              <a href={`https://www.ebay.com/sch/i.html?_nkw=${book.title}`} target="_blank" rel="noopener noreferrer">
                Check on eBay
              </a>
            </div>
          </li>
        ))}
      </ul>

      {/* OpenAI Summary */}
      {summary && (
        <div>
          <h3>Summary from OpenAI</h3>
          <p>{summary}</p>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div>
          <h3>Recommended Books</h3>
          <ul>
            {recommendations.map((book, index) => (
              <li key={index}>
                <h4>{book.volumeInfo.title}</h4>
                <p>{book.volumeInfo.description}</p>
                <a href={book.volumeInfo.infoLink} target="_blank" rel="noopener noreferrer">View more</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
