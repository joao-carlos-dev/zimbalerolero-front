import React, { useEffect, useState } from 'react';
import './Feed.css';
import axios from 'axios';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [conteudo, setConteudo] = useState('');
  const [comentariosVisiveis, setComentariosVisiveis] = useState({});
  const [novoComentario, setNovoComentario] = useState({});
  const [nextPage, setNextPage] = useState('http://localhost:8000/api/posts/feed/');
  const [loading, setLoading] = useState(false);

  const fetchPosts = async () => {
    if (!nextPage || loading) return;

    setLoading(true);
    try {
      const res = await axios.get(nextPage, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts((prev) => [...prev, ...res.data.results]);
      setNextPage(res.data.next);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Carregar a primeira página
  useEffect(() => {
    fetchPosts();
  }, []);

  // Scroll infinito
  useEffect(() => {
    const handleScroll = () => {
      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;

      if (nearBottom) {
        fetchPosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [nextPage, loading]);


  const token = localStorage.getItem('token');

  const fetchFeed = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/posts/feed/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Resposta da API:', res.data);
      setPosts(res.data.results);
    } catch (err) {
      console.error('Erro ao carregar o feed', err);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePostar = async () => {
    if (!conteudo.trim()) return alert('Digite algo para postar.');

    try {
      await axios.post(
        'http://localhost:8000/api/posts/create/',
        { content: conteudo },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setConteudo('');
      fetchFeed();
    } catch (error) {
      console.error(error);
      alert('Erro ao postar');
    }
  };

  const handleCurtir = async (postId) => {
    try {
      // const post = posts.find((p) => p.id === postId);
      // const method = post.like ? 'delete' : 'post';

      await axios.post(
        `http://localhost:8000/api/posts/${postId}/like/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPosts(
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                like: !p.like,
                likes_count: p.like ? p.likes_count - 1 : p.likes_count + 1,
              }
            : p
        )
      );
    } catch (error) {
      console.error(error);
      alert('Erro ao curtir/descurtir');
    }
  };

  const toggleComentarios = (postId) => {
    setComentariosVisiveis((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  const handleComentarioChange = (postId, texto) => {
    setNovoComentario((prev) => ({
      ...prev,
      [postId]: texto,
    }));
  };

  const handleComentar = async (postId) => {
    const texto = novoComentario[postId];
    if (!texto || !texto.trim()) return alert('Digite um comentário.');

    try {
      await axios.post(
        `http://localhost:8000/api/posts/${postId}/comments/create/`,
        { content: texto },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const res = await axios.get(
        `http://localhost:8000/api/posts/posts/${postId}/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const postAtualizado = res.data;

      setPosts((prevPosts) =>
        prevPosts.map((p) => (p.id === postId ? postAtualizado : p))
      );
      setNovoComentario((prev) => ({ ...prev, [postId]: '' }));
    } catch (error) {
      console.error(error);
      alert('Erro ao comentar');
    }
    // const comentario = res.data;
    // setPosts(
    //   posts.map((post) => {
    //     if (post.id === postId) {
    //       return {
    //         ...post,
    //         comment: [...(post.comment || []), comentario],
    //       };
    //     }
    //     return post;
    //   })
    // );
  };

  return (
    <div className="feed-container">
      <h2>Seu Feed</h2>

      <div className="novo-post">
        <textarea
          value={conteudo}
          onChange={(e) => setConteudo(e.target.value)}
          placeholder="O que está acontecendo?"
          rows={3}
        />
        <button onClick={handlePostar}>Postar</button>
      </div>

      <div className="lista-posts post">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <p>
              <strong>{post.user}</strong>
            </p>
            <p>{post.content}</p>
            {/* <strong>{post.autor_nome || post.autor}</strong>
            <p>{post.conteudo}</p> */}
            <small>{new Date(post.created_at).toLocaleString()}</small>

            <div className="post-actions">
              <button onClick={() => handleCurtir(post.id)}>
                {post.like ? 'Descurtir' : 'Curtir'}
              </button>
              <span style={{ marginLeft: 8 }}>
                {post.likes_count || 0} curtida
                {post.likes_count !== 1 ? 's' : ''}
              </span>

              <button
                style={{ marginLeft: 16 }}
                onClick={() => toggleComentarios(post.id)}
              >
                {comentariosVisiveis[post.id] ? 'Ocultar' : 'Mostrar'}{' '}
                comentários
              </button>
              <span>{post.comments_count} comentário{post.comments_count !== 1 ? 's' : ''}</span>

            </div>

            {comentariosVisiveis[post.id] && (
              <div className="comentarios">
                {(post.comments || []).map((comment) => (
                  <div key={comment.id} style={{ marginBottom: 6 }}>
                    <strong>{comment.user}</strong>: {comment.content}
                    <br />
                    <small>
                      {new Date(comment.created_at).toLocaleString()}
                    </small>
                  </div>
                ))}

                <textarea
                  rows={2}
                  placeholder="Escreva um comentário..."
                  value={novoComentario[post.id] || ''}
                  onChange={(e) =>
                    handleComentarioChange(post.id, e.target.value)
                  }
                  style={{ width: '100%', marginTop: 6 }}
                />
                <button onClick={() => handleComentar(post.id)}>
                  Comentar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Feed;
