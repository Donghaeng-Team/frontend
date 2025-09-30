// src/App.js
import Button from './components/Button';

function App() {
  const handleClick = () => {
    alert('버튼 클릭!');
  };

  return (
    <div className="App">
      <h1>버튼 테스트</h1>
      
      <Button variant="primary" onClick={handleClick}>
        Primary 버튼
      </Button>
      
      <Button variant="secondary" onClick={() => {}}>
        Secondary 버튼
      </Button>
    </div>
  );
}

export default App;