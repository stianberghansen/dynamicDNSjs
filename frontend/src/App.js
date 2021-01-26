import "./App.css";
import Navbar from "./components/navbar.component.js";
import Menu from "./components/menu.component.js";

function App() {
  return (
    <div>
      <Navbar />
      <div className="content">
        <Menu />
      </div>
    </div>
  );
}

export default App;
