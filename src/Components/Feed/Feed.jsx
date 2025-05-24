import React, { useEffect, useState, useCallback } from 'react';
import './Feed.css';
import Header from '../Header/Header';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

function Feed() {
  // Estados para o Feed de Posts
  const [posts, setPosts] = useState([]);
  const [feedNextPage, setFeedNextPage] = useState(
    `${API_BASE_URL}/posts/feed/`
  );
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedHasMore, setFeedHasMore] = useState(true);

  // Estados para Novo Post
  const [conteudo, setConteudo] = useState('');

  // Estados para Comentários
  const [comentariosVisiveis, setComentariosVisiveis] = useState({});
  const [novoComentario, setNovoComentario] = useState({});

  // Estados para Busca de Usuários
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false); // Loading para a busca

  const token = localStorage.getItem('token');

  // --- Funções de Logout ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login'; // Considerar usar React Router para navegação
  };

  // --- Funções relacionadas ao FEED DE POSTS ---

  // RECARREGA o feed do INÍCIO (primeira página)
  const refreshFeed = useCallback(async () => {
    if (!token) {
      setPosts([]);
      setFeedNextPage(null);
      setFeedHasMore(false);
      return;
    }
    console.log('Recarregando feed do início...');
    setFeedLoading(true);
    setPosts([]); // Limpa posts existentes
    setFeedHasMore(true); // Assume que pode haver mais ao recarregar
    const initialFeedUrl = `${API_BASE_URL}/posts/feed/`;

    try {
      const res = await axios.get(initialFeedUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(res.data.results || []);
      setFeedNextPage(res.data.next);
      setFeedHasMore(res.data.next !== null);
    } catch (err) {
      console.error('Erro ao recarregar o feed:', err);
      setPosts([]);
      setFeedNextPage(null);
      setFeedHasMore(false);
    } finally {
      setFeedLoading(false);
    }
  }, [token]);

  // CARREGA MAIS posts para o feed (scroll infinito)
  const loadMoreFeedPosts = useCallback(async () => {
    if (!feedNextPage || feedLoading || !feedHasMore || !token) return;

    console.log('Carregando mais posts de:', feedNextPage);
    setFeedLoading(true);
    try {
      const res = await axios.get(feedNextPage, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts((prevPosts) => [...prevPosts, ...(res.data.results || [])]);
      setFeedNextPage(res.data.next);
      setFeedHasMore(res.data.next !== null);
    } catch (err) {
      console.error('Erro ao carregar mais posts:', err);
      // Poderia tentar novamente ou parar de tentar carregar mais
    } finally {
      setFeedLoading(false);
    }
  }, [feedNextPage, feedLoading, token, feedHasMore]);

  // Carregamento inicial do feed
  useEffect(() => {
    refreshFeed();
  }, [refreshFeed]); // `refreshFeed` já depende do `token`

  // Scroll infinito para o feed
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
      if (nearBottom && feedHasMore && !feedLoading) {
        loadMoreFeedPosts();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreFeedPosts, feedHasMore, feedLoading]);

  // --- Funções de AÇÕES DO USUÁRIO (Postar, Curtir, Comentar) ---
  const handlePostar = async () => {
    if (!conteudo.trim() || !token) return alert('Digite algo para postar.');
    try {
      await axios.post(
        `${API_BASE_URL}/posts/create/`,
        { content: conteudo },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setConteudo('');
      await refreshFeed(); // Recarrega o feed para ver o novo post
    } catch (error) {
      console.error('Erro ao postar:', error);
      alert('Erro ao postar');
    }
  };

  const handleCurtir = async (postId) => {
    if (!token) return;
    const originalPosts = posts.map((p) => ({ ...p })); // Cópia profunda simples para reversão
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId
          ? {
              ...p,
              like: !p.like,
              likes_count: p.like ? p.likes_count - 1 : p.likes_count + 1,
            }
          : p
      )
    );
    try {
      await axios.post(
        `${API_BASE_URL}/posts/${postId}/like/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Erro ao curtir/descurtir:', error);
      alert('Erro ao curtir/descurtir');
      setPosts(originalPosts); // Reverte em caso de erro
    }
  };

  const toggleComentarios = (postId) => {
    setComentariosVisiveis((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleComentarioChange = (postId, texto) => {
    setNovoComentario((prev) => ({ ...prev, [postId]: texto }));
  };

  const handleComentar = async (postId) => {
    const texto = novoComentario[postId];
    if (!texto || !texto.trim() || !token)
      return alert('Digite um comentário.');

    const originalPosts = posts.map((p) => ({
      ...p,
      comments: p.comments ? [...p.comments] : [],
    }));
    // Otimista: Adicionar comentário localmente (opcional, buscar post atualizado é mais seguro)
    // Se fizer otimista, precisa gerar um ID temporário ou algo assim.
    // Por agora, vamos manter a busca do post atualizado.

    try {
      await axios.post(
        `${API_BASE_URL}/posts/${postId}/comments/create/`,
        { content: texto },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Busca o post atualizado para pegar a lista de comentários e a contagem corretas
      const res = await axios.get(
        `${API_BASE_URL}/posts/posts/${postId}/`, // Verifique se esta URL está correta (ex: /posts/${postId}/)
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const postAtualizado = res.data;
      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === postId ? postAtualizado : p))
      );
      setNovoComentario((prev) => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error('Erro ao comentar:', error);
      alert('Erro ao comentar');
      setPosts(originalPosts); // Reverte se a lógica otimista estivesse mais complexa
    }
  };

  // --- Funções relacionadas à BUSCA DE USUÁRIOS e SEGUIR ---
  useEffect(() => {
    if (!searchQuery.trim() || !token) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const timerId = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/accounts/search-users/?search=${searchQuery}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSearchResults(res.data?.results || []);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timerId);
  }, [searchQuery, token]);

  const handleFollow = async (targetUsername) => {
    if (!token) return;

    const originalSearchResults = searchResults.map((u) => ({ ...u }));
    // Atualização Otimista da UI para o botão na lista de busca
    setSearchResults((prevResults) =>
      prevResults.map((user) =>
        user.nome === targetUsername
          ? { ...user, is_following: !user.is_following }
          : user
      )
    );

    try {
      await axios.post(
        `${API_BASE_URL}/accounts/follow-toggle/${targetUsername}/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Sucesso: Refetch do feed principal de posts
      console.log(
        `Ação de seguir/deixar de seguir ${targetUsername} bem-sucedida. Recarregando feed.`
      );
      await refreshFeed();
    } catch (error) {
      console.error(
        `Erro ao seguir/deixar de seguir ${targetUsername}:`,
        error
      );
      const action = originalSearchResults.find(
        (u) => u.nome === targetUsername
      )?.is_following
        ? 'deixar de seguir'
        : 'seguir';
      alert(`Erro ao ${action} ${targetUsername}. Tente novamente.`);
      setSearchResults(originalSearchResults); // Reverte a atualização otimista da lista de busca
    }
  };

  // --- RENDERIZAÇÃO ---
  if (!token) {
    return (
      <div className="feed-container">
        <Header token={null} onLogout={handleLogout} />
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'white' }}>
          Por favor, faça{' '}
          <a href="/login" style={{ color: '#1da1f2' }}>
            login
          </a>{' '}
          para ver o feed.
        </p>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <Header token={token} onLogout={handleLogout} />

      <h2>Seus leros leros</h2>

        <div className="buscar">
          <input
            className="buscar"
            type="text"
            placeholder="Buscar usuários..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchLoading && (
            <p className="loading-text">Buscando usuários...</p>
          )}
          {!searchLoading && searchQuery.length > 0 && (
            <div className="resultados-busca">
              {searchResults.length > 0 ? (
                searchResults.map((user) => (
                  <div key={user.id} className="resultado-nome">
                    <span>{user.nome}</span>
                    <button
                      onClick={() => handleFollow(user.nome)}
                      disabled={feedLoading} // Desabilita enquanto o feed principal está recarregando
                    >
                      {user.is_following ? 'Deixar de seguir' : 'Seguir'}
                    </button>
                  </div>
                ))
              ) : (
                <p className="no-results">Nenhum usuário encontrado.</p>
              )}
            </div>
          )}
        </div>
        <div className="novo-post">
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Qual o lero de hoje??"
            rows={3}
          />
          <button onClick={handlePostar} disabled={feedLoading}>
            Postar
          </button>
        </div>
      

      {feedLoading && posts.length === 0 && (
        <p className="loading-text">Carregando feed...</p>
      )}

      <div className="lista-posts">
        {!feedLoading && posts.length === 0 && token && (
          <p className="feed-empty">
            Seu feed está vazio. Siga alguém ou faça um post!
          </p>
        )}
        {posts.map((post) => (
          <div key={post.id} className="post">
            <p>
              <strong>
                {typeof post.user === 'object'
                  ? post.user.nome || post.user.username
                  : post.user}
              </strong>
            </p>
            <p className="post-content">{post.content}</p>
            <small>{new Date(post.created_at).toLocaleString()}</small>

            <div className="post-actions">
              <button onClick={() => handleCurtir(post.id)}>
                {post.like ? 'Descurtir' : 'Curtir'} ({post.likes_count || 0})
              </button>
              <button onClick={() => toggleComentarios(post.id)}>
                {comentariosVisiveis[post.id] ? 'Ocultar' : 'Comentários'} (
                {post.comments_count || 0})
              </button>
            </div>

            {comentariosVisiveis[post.id] && (
              <div className="comentarios-section">
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <div key={comment.id} className="comentario-item">
                      <strong>
                        {typeof comment.user === 'object'
                          ? comment.user.nome || comment.user.username
                          : comment.user}
                      </strong>
                      : {comment.content}
                      <br />
                      <small>
                        {new Date(comment.created_at).toLocaleString()}
                      </small>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">Nenhum comentário ainda.</p>
                )}
                <div className="novo-comentario-area">
                  <textarea
                    rows={2}
                    placeholder="Escreva um comentário..."
                    value={novoComentario[post.id] || ''}
                    onChange={(e) =>
                      handleComentarioChange(post.id, e.target.value)
                    }
                  />
                  <button onClick={() => handleComentar(post.id)}>
                    Comentar
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {feedLoading && posts.length > 0 && (
        <p className="loading-text">Carregando mais posts...</p>
      )}
      {!feedLoading && !feedHasMore && posts.length > 0 && (
        <p className="feed-end">Você chegou ao fim dos leros.</p>
      )}
    </div>
  );
}

export default Feed;
