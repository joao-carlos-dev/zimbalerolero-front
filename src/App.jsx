import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css';
import Cadastro from './Components/Cadastro/Cadastro';
import Login from './Components/Login/Login';
import './index.css';

function App() {
   return (
      <div className='App'>
         <Router>
            <Routes>
               <Route path='/' element={<Navigate to='/login' />} />
               <Route path='/login' element={<Login />} />
               <Route path='/cadastro' element={<Cadastro />} />
            </Routes>
         </Router>
      </div>
   )
}

export default App
