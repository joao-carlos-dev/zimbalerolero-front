import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css';
import Register from './Components/Cadastro/Register';
import Login from './Components/Login/Login';
import Feed from './Components/Feed/Feed';
import './index.css';

function App() {
   return (
      <div className='App'>
         <Router>
            <Routes>
               <Route path='/' element={<Navigate to='/login' />} />
               <Route path='/login' element={<Login />} />
               <Route path='/register' element={<Register />} />
               <Route path='/feed' element={<Feed />} />
            </Routes>
         </Router>
      </div>
   )
}

export default App
