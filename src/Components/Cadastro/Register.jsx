import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import logo from '/src/assets/logo_zimbalerolero01.png';
import { FaEnvelope, FaKey, FaUser } from 'react-icons/fa'

function Register() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        senha: '',
        confirmarSenha: '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.senha !== formData.confirmarSenha) {
            alert('As senhas não coincidem!');
            return;
        }
        try {
            const response = await fetch('joaocarloz.pythonanywhere.com/accounts/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: formData.nome, 
                    email: formData.email,
                    password: formData.senha,
                })
            });


            if (response.ok) {
                alert('Cadastro realizado com sucesso!');
                navigate('/login');
            } else {
                const data = await response.json();
                console.log('Resposta da API: ', data);
                alert('Erro: ' + JSON.stringify(data));
            }
        } catch (error) {
            console.error(error);
            alert('Erro ao conectar com o servidor.');
        }
    }


    return (
        <div className="container">
            <img src={logo} />
            <form onSubmit={handleSubmit}>
                <h1>Cadastro</h1>
                <div className="input-field">
                    <input type="text"
                        name="nome"
                        value={formData.nome}
                        placeholder="Nome"
                        required
                        onChange={handleChange} />
                    <FaUser className="icon" /> 
                </div>
                <div className="input-field">
                    <input type="email"
                        name="email"
                        placeholder="E-mail"
                        required
                        onChange={handleChange} />
                    <FaEnvelope className="icon" />
                </div>
            
                <div className="input-field">
                    <input type="password"
                        name="senha"
                        placeholder="Senha"
                        value={formData.senha}
                        required
                        onChange={handleChange} />
                    <FaKey className="icon" />
                </div>
                <div className="input-field">
                    <input type="password"
                        name="confirmarSenha"
                        placeholder="Confirmar Senha"
                        value={formData.confirmarSenha}
                        required
                        onChange={handleChange} />
                    <FaKey className="icon" />
                </div>

                <button type="submit">Cadastrar</button>
            </form>
        </div>
    )
};

export default Register;