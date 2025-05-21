import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import { useState } from 'react';
import axios from 'axios';
import './Login.css';
import logo from '/src/assets/logo_zimbalerolero01.png';

function Login() {
  const navigate = useNavigate();

  const handleCadastro = () => {
    navigate('/register');
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        email: email, // seu estado chama username, mas é o email
        password: password,
      });

        localStorage.setItem('token', response.data.access); // salva o token no localStorage
        localStorage.setItem('refresh', response.data.refresh);
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

        alert('Login realizado com sucesso!');
        navigate('/feed'); // redireciona para o feed

    } catch (error) {
      if (error.response) {
        alert('Erro no login: ' + JSON.stringify(error.response.data));
      } else {
        alert('Erro ao conectar com o servidor.');
      }
    }

    // alert("Enviando os dados: " + username + " - " + password);
    // console.log("Envio");
  };

  return (
    <div className="container">
        <img src={logo} />
      <form onSubmit={handleSubmit}>
          <h1>Acessar</h1>
        <div className="input-field">
          <input
            type="email"
            placeholder="E-mail"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <FaUser className="icon" />
        </div>
        <div className="input-field">
          <input
            type="password"
            placeholder="Digite a senha"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FaLock className="icon" />
        </div>
        <div className="recall-forget">
        </div>
        <button type="submit">Entrar</button>
        <div className="signup-link">
          <p>
            Não tem uma conta? <a onClick={handleCadastro}>Registrar</a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
