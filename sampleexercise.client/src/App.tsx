import "./App.css";
import UserMessageGrid from "./components/molecule/UserMessageGrid/UserMessageGrid";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Sample Application</h1>
        <UserMessageGrid></UserMessageGrid>
      </header>
    </div>
  );
}

export default App;
