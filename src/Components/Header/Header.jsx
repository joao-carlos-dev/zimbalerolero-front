import React, { useEffect, useState } from "react";
import axios from "axios";
import './Header.css';

const Header =  ({ token, onLogout }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("https://joaocarloz.pythonanywhere.com/api/accounts/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(res.data);
      } catch (error) {
        console.error("Erro ao buscar usuário logado:", error);
      }
    };

    if (token) {
      fetchUser();
    }
  }, [token]);

  if (!user) return null;
  return (
    <div className="header-container">
      <div className="header-user">
        <div className="header-avatar">
          {user?.nome?.[0]?.toUpperCase() || 'U'}
        </div>
        <span>{user?.nome || 'Usuário'}</span>
      </div>
      <button className="header-logout-button" onClick={onLogout}>
        Sair
      </button>
    </div>
  );
};

export default Header;
