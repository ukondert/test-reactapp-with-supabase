import React from 'react';
import './App.css';
import SupabaseHealthCheck from './components/SupabaseHealthCheck';
import { BookCommandFormContainer } from './features/library';

function App() {
  return (
    <div className="App">
      <h1>Welcome to the Digital School Library</h1>
      <SupabaseHealthCheck />
      <BookCommandFormContainer />
    </div>
  );
}

export default App;