import React from "react";
import { Navigate, useNavigate } from 'react-router-dom'
import { FaUser, FaLock } from "react-icons/fa"
import { useState } from "react";
import './Login.css';

function Login() {
    
    const navigate = useNavigate();

    const handleCadastro = () => {
        navigate('/cadastro');
    }

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        alert("Enviando os dados: " + username + " - " + password);

        console.log("Envio");
    }

    return (
        <div className="container">
            <form onSubmit={handleSubmit}>
                <h1>Acessar</h1>
                <div className="input-field">
                    <input type="email" placeholder="E-mail"
                    required
                    onChange={(e) => setUsername(e.target.value)} />
                    <FaUser className="icon" />
                </div>
                <div className="input-field">
                    <input type="password" placeholder="Dogite a senha"
                    required
                     onChange={(e) => setPassword(e.target.value)} />
                    <FaLock className="icon" />
                </div>
                <div className="recall-forget">
                    <label>
                        <input type="checkbox"/>
                        Lembre de mim
                    </label>
                        <a href="#">Esqueceu a senha?</a>
                </div>
                <button>Entrar</button>
                <div className="signup-link">
                    <p>
                        Não tem uma conta? <a onClick={handleCadastro}>Registrar</a>
                    </p>
                </div>
            </form>
        </div>
    )
}

export default Login;