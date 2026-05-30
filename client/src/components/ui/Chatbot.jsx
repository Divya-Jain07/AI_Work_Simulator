import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useDashboardStore } from '../../engine/dashboardStore';
import styles from './Chatbot.module.css';

// Typewriter component for realistic live typing feel
const TypewriterText = ({ text, onComplete, onCharTyped }) => {
  const [visibleChars, setVisibleChars] = useState(0);
  const onCompleteRef = useRef(onComplete);
  const onCharTypedRef = useRef(onCharTyped);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onCharTypedRef.current = onCharTyped;
  }, [onComplete, onCharTyped]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleChars((current) => {
        if (current >= text.length) {
          clearInterval(interval);
          onCompleteRef.current?.();
          return current;
        }

        onCharTypedRef.current?.();
        return current + 1;
      });
    }, 12); // ~12ms per char for a smooth, readable speed

    return () => clearInterval(interval);
  }, [text]);

  return <span>{text.slice(0, visibleChars)}</span>;
};

const Chatbot = ({ roleId, teammate }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const applyLiveDashboardSnapshot = useDashboardStore((state) => state.applyLiveSnapshot);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch chat history from database when roleId changes
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setConnectionStatus('connecting');
        const { data } = await axios.get(`http://localhost:5000/api/ai/teammate/history?roleId=${roleId}`);
        if (data.history && data.history.length > 0) {
          setMessages(data.history.map(msg => ({ ...msg, isNew: false })));
        } else {
          setMessages([
            {
              role: 'model',
              content: `${teammate?.name || 'Your AI teammate'} is online. I will tailor guidance to this role and keep the solution practical.`,
              isNew: false
            }
          ]);
        }
        setConnectionStatus('online');
      } catch (error) {
        console.error("Error fetching chat history", error);
        setConnectionStatus('offline');
        setMessages([
          {
            role: 'model',
            content: `${teammate?.name || 'Your AI teammate'} is online. I will tailor guidance to this role and keep the solution practical.`,
            isNew: false
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [roleId, teammate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMessage, isNew: false }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setConnectionStatus('thinking');

    try {
      const { data } = await axios.post('http://localhost:5000/api/ai/teammate/chat', {
        history: messages,
        message: userMessage,
        roleId
      });
      const reply = typeof data.reply === 'string' ? data.reply.trim() : '';

      if (!reply) {
        throw new Error('AI teammate returned an empty response');
      }

      // Append response and flag as isNew so typewriter effect triggers
      setMessages([...newMessages, { role: 'model', content: reply, isNew: true }]);
      if (data.dashboardSnapshot) applyLiveDashboardSnapshot(data.dashboardSnapshot);
      setConnectionStatus('online');
    } catch (error) {
      console.error("Chat error", error);
      setConnectionStatus('offline');
      setMessages([
        ...newMessages,
        {
          role: 'model',
          content: error.response?.data?.message || 'AI teammate is temporarily unavailable. Please try again in a moment.',
          isNew: true,
          isError: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = loading
    ? 'AI is thinking...'
    : connectionStatus === 'offline'
      ? 'offline'
      : connectionStatus === 'connecting'
        ? 'connecting'
        : 'online';

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          <div className={`${styles.statusDot} ${connectionStatus === 'offline' ? styles.statusDotOffline : loading ? styles.statusDotTyping : styles.statusDotActive}`}></div>
          <div className={styles.teammateIdentity}>
            <span className={styles.teammateName}>{teammate?.name || 'AI Teammate'}</span>
            <small className={styles.teammateTitle}>{teammate?.title || 'Role-aware collaborator'}</small>
          </div>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.onlineText}>
            {statusLabel}
          </span>
        </div>
      </div>
      
      <div className={styles.messagesArea}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userWrapper : styles.modelWrapper}`}>
            <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userBubble : styles.modelBubble} ${msg.isError ? styles.errorBubble : ''}`}>
              {msg.role === 'model' && msg.isNew ? (
                <TypewriterText
                  key={`${index}-${msg.content}`}
                  text={msg.content}
                  onCharTyped={scrollToBottom}
                  onComplete={() => {
                    setMessages((currentMessages) =>
                      currentMessages.map((currentMessage, currentIndex) =>
                        currentIndex === index
                          ? { ...currentMessage, isNew: false }
                          : currentMessage
                      )
                    );
                  }}
                />
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.messageWrapper} ${styles.modelWrapper}`}>
            <div className={`${styles.messageBubble} ${styles.modelBubble} ${styles.typingIndicator}`}>
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className={styles.inputArea}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${teammate?.name || 'teammate'}...`} 
          className={styles.chatInput}
          disabled={loading}
        />
        <button type="submit" className={styles.sendBtn} disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
