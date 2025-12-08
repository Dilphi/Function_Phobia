import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const navigate = useNavigate();
  const { userId: paramUserId } = useParams();
  const isMobile = window.innerWidth < 768;

  // Определяем userId: сначала из параметров URL, затем из localStorage
  const userId = paramUserId || localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate('/login'); // если нет userId, отправляем на логин
      return;
    }

    const loadUserData = async () => {
      try {
        const res = await fetch(`http://localhost:3001/profile/${userId}`);
        const data = await res.json();

        if (!res.ok) {
          console.error(data.error || "Ошибка загрузки профиля");
          // Если профиль не найден и это текущий пользователь, перенаправляем на создание
          if (!paramUserId) {
            navigate('/login');
          }
          return;
        }

        // Заполняем отсутствующие поля пустыми значениями, чтобы компонент не ломался
        const userDataWithDefaults = {
          ...data,
          fullName: data.fullName || '',
          progress: data.progress || [],
          achievements: data.achievements || [],
          recentActivity: data.recentActivity || [],
          level: data.level || 1,
          score: data.score || 0,
          gamesPlayed: data.gamesPlayed || 0,
          codeSnippets: data.codeSnippets || 0
        };
        
        setUserData(userDataWithDefaults);
        setEditForm(userDataWithDefaults);
        setLoading(false);
      } catch (err) {
        console.error("Ошибка соединения с сервером");
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId, navigate, paramUserId]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setEditForm(userData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:3001/profile/${userId}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
      });

      const data = await res.json();
      if (!res.ok) {
        console.error(data.error || "Ошибка сохранения профиля");
        return;
      }

      setUserData(data);
      setIsEditing(false);
    } catch {
      console.error("Ошибка соединения с сервером");
    }
  };

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  // Проверка, является ли профиль текущего пользователя
  const isCurrentUser = !paramUserId || paramUserId === localStorage.getItem("userId");

  const styles = {
    container: { 
      minHeight: '100vh', 
      backgroundColor: '#1a202c', 
      color: 'white', 
      fontFamily: 'Arial, sans-serif', 
      padding: isMobile ? '15px' : '20px' 
    },
    header: { 
      textAlign: 'center', 
      marginBottom: isMobile ? '20px' : '30px' 
    },
    title: { 
      fontSize: isMobile ? '28px' : '36px', 
      color: '#f6e05e', 
      marginBottom: '10px' 
    },
    subtitle: { 
      fontSize: isMobile ? '14px' : '16px', 
      color: '#cbd5e0', 
      marginBottom: '20px' 
    },
    card: { 
      background: '#2d3748', 
      borderRadius: '10px', 
      padding: isMobile ? '15px' : '20px', 
      marginBottom: isMobile ? '15px' : '20px', 
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)' 
    },
    tabContainer: { 
      display: 'flex', 
      overflowX: 'auto', 
      marginBottom: '20px', 
      WebkitOverflowScrolling: 'touch', 
      scrollbarWidth: 'none', 
      msOverflowStyle: 'none' 
    },
    tab: { 
      padding: isMobile ? '10px 15px' : '12px 20px', 
      background: 'transparent', 
      border: 'none', 
      color: '#cbd5e0', 
      fontSize: isMobile ? '14px' : '16px', 
      cursor: 'pointer', 
      whiteSpace: 'nowrap', 
      borderBottom: '2px solid transparent' 
    },
    activeTab: { 
      color: '#f6e05e', 
      borderBottom: '2px solid #f6e05e' 
    },
    profileSection: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      alignItems: isMobile ? 'center' : 'flex-start', 
      gap: isMobile ? '20px' : '30px', 
      marginBottom: '30px' 
    },
    avatar: { 
      width: isMobile ? '80px' : '100px', 
      height: isMobile ? '80px' : '100px', 
      borderRadius: '50%', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      fontSize: isMobile ? '36px' : '48px', 
      fontWeight: 'bold', 
      color: 'white' 
    },
    userInfo: { flex: 1 },
    username: { 
      fontSize: isMobile ? '20px' : '24px', 
      fontWeight: 'bold', 
      marginBottom: '5px' 
    },
    email: { 
      color: '#a0aec0', 
      marginBottom: '10px' 
    },
    editButton: { 
      background: '#f6e05e', 
      color: '#1a202c', 
      border: 'none', 
      padding: '8px 16px', 
      borderRadius: '6px', 
      cursor: 'pointer', 
      fontWeight: '600', 
      marginTop: '10px' 
    },
    input: { 
      width: '100%', 
      padding: '8px 12px', 
      marginBottom: '10px', 
      background: '#1a202c', 
      border: '1px solid #4a5568', 
      borderRadius: '4px', 
      color: 'white', 
      fontSize: '14px' 
    },
    statsGrid: { 
      display: 'grid', 
      gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
      gap: isMobile ? '10px' : '15px' 
    },
    statCard: { 
      background: '#4a5568', 
      padding: '15px', 
      borderRadius: '8px', 
      textAlign: 'center' 
    },
    statNumber: { 
      fontSize: isMobile ? '20px' : '24px', 
      fontWeight: 'bold', 
      color: '#68d391', 
      marginBottom: '5px' 
    },
    statLabel: { 
      fontSize: isMobile ? '11px' : '12px', 
      color: '#cbd5e0' 
    },
    progressItem: { 
      background: '#4a5568', 
      padding: '12px', 
      borderRadius: '6px', 
      marginBottom: '10px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    },
    progressTitle: { fontWeight: '500' },
    progressScore: { 
      color: '#f6e05e', 
      fontSize: '14px' 
    },
    achievementCard: { 
      background: '#4a5568', 
      padding: '15px', 
      borderRadius: '8px', 
      marginBottom: '10px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '15px' 
    },
    achievementIcon: { fontSize: '24px' },
    activityItem: { 
      padding: '12px', 
      borderBottom: '1px solid #4a5568', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center' 
    },
    buttonGroup: { 
      display: 'flex', 
      gap: '10px', 
      marginTop: '20px' 
    },
    logoutButton: { 
      background: '#e53e3e', 
      color: 'white', 
      border: 'none', 
      padding: '10px 20px', 
      borderRadius: '6px', 
      cursor: 'pointer', 
      fontWeight: '600' 
    },
    backButton: {
      background: '#4a5568',
      color: 'white',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      marginRight: '10px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <div style={{ textAlign: 'center', color: '#cbd5e0' }}>
            <div style={{
              width: '50px', height: '50px', border: '3px solid #4a5568',
              borderTop: '3px solid #f6e05e', borderRadius: '50%',
              animation: 'spin 1s linear infinite', margin: '0 auto 20px'
            }}></div>
            <p>Загрузка профиля...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', paddingTop: '50px' }}>
          <h1 style={styles.title}>Профиль не найден</h1>
          <button 
            onClick={() => navigate('/')}
            style={styles.backButton}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>
          {isCurrentUser ? 'Мой профиль' : `Профиль: ${userData.username}`}
        </h1>
        <p style={styles.subtitle}>
          {isCurrentUser ? 'Управляйте аккаунтом и следите за прогрессом' : 'Просмотр профиля пользователя'}
        </p>
        {!isCurrentUser && (
          <button 
            onClick={() => navigate('/profile')}
            style={styles.backButton}
          >
            ← К моему профилю
          </button>
        )}
      </header>

      {/* Профиль */}
      <div style={styles.profileSection}>
        <div style={styles.avatar}>
          {userData.username.charAt(0).toUpperCase()}
        </div>
        <div style={styles.userInfo}>
          {isEditing && isCurrentUser ? (
            <>
              <input 
                name="username" 
                value={editForm.username} 
                onChange={handleChange} 
                style={styles.input} 
                placeholder="Имя пользователя" 
              />
              <input 
                name="email" 
                value={editForm.email} 
                onChange={handleChange} 
                style={styles.input} 
                placeholder="Email" 
              />
              <input 
                name="fullName" 
                value={editForm.fullName} 
                onChange={handleChange} 
                style={styles.input} 
                placeholder="Полное имя" 
              />
              <div style={styles.buttonGroup}>
                <button onClick={handleSave} style={styles.editButton}>
                  Сохранить
                </button>
                <button onClick={handleCancel} style={{ ...styles.editButton, background: '#4a5568', color: 'white' }}>
                  Отмена
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 style={styles.username}>{userData.username}</h2>
              <p style={styles.email}>{userData.email}</p>
              {userData.fullName && (
                <p style={{ color: '#cbd5e0', marginBottom: '10px' }}>
                  Полное имя: {userData.fullName}
                </p>
              )}
              {userData.joinDate && (
                <p style={{ color: '#a0aec0', fontSize: '14px' }}>
                  Участник с {new Date(userData.joinDate).toLocaleDateString('ru-RU')}
                </p>
              )}
              {isCurrentUser && (
                <button onClick={handleEdit} style={styles.editButton}>
                  Редактировать профиль
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Табы для навигации по разделам профиля */}
      <div style={styles.tabContainer}>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'stats' && styles.activeTab) }} 
          onClick={() => setActiveTab('stats')}
        >
          Статистика
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'progress' && styles.activeTab) }} 
          onClick={() => setActiveTab('progress')}
        >
          Прогресс
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'achievements' && styles.activeTab) }} 
          onClick={() => setActiveTab('achievements')}
        >
          Достижения
        </button>
        <button 
          style={{ ...styles.tab, ...(activeTab === 'activity' && styles.activeTab) }} 
          onClick={() => setActiveTab('activity')}
        >
          Активность
        </button>
      </div>

      {/* Статистика */}
      {activeTab === 'stats' && (
        <div style={styles.card}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', color: '#f6e05e' }}>
            Общая статистика
          </h3>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{userData.level || 1}</div>
              <div style={styles.statLabel}>Уровень</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{userData.score || 0}</div>
              <div style={styles.statLabel}>Очки</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{userData.gamesPlayed || 0}</div>
              <div style={styles.statLabel}>Игр сыграно</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{userData.codeSnippets || 0}</div>
              <div style={styles.statLabel}>Сохранений кода</div>
            </div>
          </div>
        </div>
      )}

      {/* Прогресс */}
      {activeTab === 'progress' && (
        <div style={styles.card}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', color: '#f6e05e' }}>
            Прогресс по уровням
          </h3>
          {userData.progress && userData.progress.length > 0 ? (
            userData.progress.map(item => (
              <div key={item.level || item.id} style={styles.progressItem}>
                <div>
                  <div style={styles.progressTitle}>
                    Уровень {item.level}: {item.title || 'Без названия'}
                  </div>
                  {item.completedAt && (
                    <div style={{ fontSize: '12px', color: '#a0aec0' }}>
                      Завершен: {new Date(item.completedAt).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>
                <div style={styles.progressScore}>
                  {item.completed ? `${item.bestScore || 0} очков` : 'В процессе'}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#cbd5e0', textAlign: 'center' }}>
              Прогресс пока отсутствует
            </p>
          )}
        </div>
      )}

      {/* Достижения */}
      {activeTab === 'achievements' && (
        <div style={styles.card}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', color: '#f6e05e' }}>
            Достижения ({userData.achievements?.length || 0})
          </h3>
          {userData.achievements && userData.achievements.length > 0 ? (
            userData.achievements.map(a => (
              <div key={a.id} style={styles.achievementCard}>
                <div style={styles.achievementIcon}>{a.icon || '🏆'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {a.title || 'Достижение'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#cbd5e0', marginBottom: '5px' }}>
                    {a.description || 'Описание отсутствует'}
                  </div>
                  {a.unlockedAt && (
                    <div style={{ fontSize: '12px', color: '#a0aec0' }}>
                      Получено: {new Date(a.unlockedAt).toLocaleDateString('ru-RU')}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#cbd5e0', textAlign: 'center' }}>
              Достижения пока отсутствуют
            </p>
          )}
        </div>
      )}

      {/* Активность */}
      {activeTab === 'activity' && (
        <div style={styles.card}>
          <h3 style={{ marginBottom: '20px', fontSize: '18px', color: '#f6e05e' }}>
            Недавняя активность
          </h3>
          {userData.recentActivity && userData.recentActivity.length > 0 ? (
            userData.recentActivity.map(a => (
              <div key={a.id} style={styles.activityItem}>
                <div>
                  <div style={{ fontWeight: '500' }}>{a.action || 'Действие'}</div>
                  <div style={{ fontSize: '14px', color: '#cbd5e0' }}>
                    {a.details || 'Детали отсутствуют'}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#a0aec0' }}>
                  {a.time || 'Недавно'}
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#cbd5e0', textAlign: 'center' }}>
              Активность пока отсутствует
            </p>
          )}
        </div>
      )}

      {/* Выход (только для текущего пользователя) */}
      {isCurrentUser && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Выйти из аккаунта
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}