import { FaUser, FaLock } from "react-icons/fa"
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom'
import './Cadastro.css';

function Cadastro() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nome: '',
        email: '',
        telefone: '',
        cidade: '',
        estado: '',
        senha: '',
        confirmarSenha: '',
        aceitarTermos: false,
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

        if (!formData.aceitarTermos) {
            alert('Você precisa aceitar os termos de uso.');
            return;
        }
        try {
            const response = await fetch('http://localhost:8000/api/cadastro/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: formData.nome, 
                    email: formData.email,
                    password: formData.senha,
                    confirmarSenha: formData.confirmarSenha,
                    telefone: formData.telefone,
                    cidade: formData.cidade,
                    estado: formData.estado,
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
            <form onSubmit={handleSubmit}>
                <h1>Cadastro</h1>
                <div className="input-field">
                    <input type="text"
                        name="nome"
                        value={formData.nome}
                        placeholder="Nome"
                        required
                        onChange={handleChange} />
                    {/* <FaUser className="icon" /> */}
                </div>
                <div className="input-field">
                    <input type="email"
                        name="email"
                        placeholder="E-mail"
                        required
                        onChange={handleChange} />
                    {/* <FaLock className="icon" /> */}
                </div>
                <div className="input-field">
                    <input type="tel"
                        name="telefone"
                        placeholder="Telefone"
                        value={formData.telefone}
                        required
                        onChange={handleChange} />
                    {/* <FaLock className="icon" /> */}
                </div>
                <div className="input-field">
                    <input type="text"
                        name="cidade"
                        placeholder="Cidade"
                        value={formData.cidade}
                        required
                        onChange={handleChange} />
                    {/* <FaLock className="icon" /> */}
                </div>
                <div className="input-field">
                    <input type="text"
                        name="estado"
                        placeholder="Estado"
                        value={formData.estado}
                        required
                        onChange={handleChange} />
                    {/* <FaLock className="icon" /> */}
                </div>
                <div className="input-field">
                    <input type="password"
                        name="senha"
                        placeholder="Senha"
                        value={formData.senha}
                        required
                        onChange={handleChange} />
                    {/* <FaLock className="icon" /> */}
                </div>
                <div className="input-field">
                    <input type="password"
                        name="confirmarSenha"
                        placeholder="Confirmar Senha"
                        value={formData.confirmarSenha}
                        required
                        onChange={handleChange} />
                    {/* <FaLock className="icon" /> */}
                </div>
                <div className="signup-link">
                    <label>
                        <input type="checkbox"
                            name="aceitarTermos"
                            checked={formData.aceitarTermos}
                            onChange={handleChange} />
                        Aceito os termos de uso
                    </label>
                </div>

                <button type="submit">Cadastrar</button>
            </form>
        </div>
    )
};

export default Cadastro;