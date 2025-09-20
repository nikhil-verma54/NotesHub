
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import Auth from "./components/Auth";
import Home from "./pages/Home";
import Navigation from './components/Navigation';
import Logout from './components/Logout';
import Dashboard from './pages/Dashboard'
import UploadNotes from './pages/UploadNotes';
import MyNotes from './pages/MyNotes';
import About from './pages/About';
function App() {
    return (
      <>
     
        <Navigation />
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/About" element={<About/>}/>
          <Route path="/Auth" element={<Auth/>}/>
          <Route path="/logout" element={<Logout/>}/>
          <Route path="/Dashboard" element={<Dashboard/>}/>
          <Route path="/UploadNotes" element={<UploadNotes/>}/>
          <Route path="/MyNotes" element={<MyNotes/>}/>
        </Routes>
      </>);
}
export default App;