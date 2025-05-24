import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FaUser, FaLock } from 'react-icons/fa';
import { useState } from 'react';
import axios from 'axios';
import './Login.css';
import logo from '/src/assets/logo_zimbalerolero01.png';

function Login({ setCurrentUser, setFeedPosts }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleCadastro = () => {
    navigate('/register');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post('joaocarloz.pythonanywhere.com/api/token/', {
        email, // Usando a sintaxe shorthand para cleaner code
        password,
      });

      const accessToken = response.data.access;
      const refreshToken = response.data.refresh;

      // Salva tokens no localStorage
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refresh', refreshToken);

      // Configura o axios para usar o token em requisições futuras
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // Limpa estados antigos antes de carregar os novos dados do usuário logado
      // (Presumindo que setCurrentUser e setFeedPosts são funções de set de estados do React, por exemplo)
      if (typeof setCurrentUser === 'function') {
        setCurrentUser(null);
      }
      if (typeof setFeedPosts === 'function') {
        setFeedPosts([]);
      }
      

      // Busca dados do usuário logado
      const userRes = await axios.get(
        'joaocarloz.pythonanywhere.com/api/accounts/profile/'
      );
      if (typeof setCurrentUser === 'function') {
        setCurrentUser(userRes.data);
      }

      // Busca o feed do usuário logado
      const feedRes = await axios.get('joaocarloz.pythonanywhere.com/api/posts/feed/');
      if (typeof setFeedPosts === 'function') {
        setFeedPosts(feedRes.data);
      }

      // Alerta de sucesso e redirecionamento, como no primeiro código
      alert('Login realizado com sucesso!');
      navigate('/feed');

      // Opcional: Removi o alert e console.log que estavam fora do try/catch no primeiro exemplo,
      // pois eles seriam executados independentemente do sucesso do login e o 'username' não estava definido.
      // Se precisar de logs, coloque-os aqui dentro do bloco try após o sucesso.
      console.log('Login bem-sucedido. Dados do usuário e feed carregados.');
    } catch (error) {
      // Tratamento de erros aprimorado
      if (error.response) {
        // Erro de resposta do servidor (ex: 401 Unauthorized, 400 Bad Request)
        alert('Erro no login: ' + JSON.stringify(error.response.data));
      } else if (error.request) {
        // Requisição feita mas sem resposta (ex: servidor offline, sem internet)
        alert(
          'Erro ao conectar com o servidor. Verifique sua conexão ou tente novamente mais tarde.'
        );
      } else {
        // Outros erros (ex: erro no setup da requisição)
        alert('Ocorreu um erro inesperado: ' + error.message);
      }
      console.error('Detalhes do erro:', error);
    }
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
        <div className="recall-forget"></div>
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
