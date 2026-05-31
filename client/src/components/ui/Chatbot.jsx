import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styles from './Chatbot.module.css';

const Chatbot = ({ taskId, roleId, teammate }) => {
  const [messages, setMessages] = useState(() => {
    const saved = sessionStorage.getItem(`chat-history-${taskId}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore JSON parse error
      }
    }
    return [
      {
        role: 'model',
        content: `${teammate?.name || 'Your AI teammate'} is online. I will tailor guidance to this role and keep the solution practical.`
      }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (taskId) {
      sessionStorage.setItem(`chat-history-${taskId}`, JSON.stringify(messages));
    }
    scrollToBottom();
  }, [messages, taskId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/ai/teammate/chat', {
        history: messages,
        message: userMessage,
        roleId
      });
      setMessages([...newMessages, { role: 'model', content: data.reply }]);
    } catch (error) {
      console.error("Chat error", error);
      setMessages([...newMessages, { role: 'model', content: 'Sorry, I am having trouble connecting right now.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div>
          <div className={styles.statusDot}></div>
        </div>
        <div className={styles.teammateIdentity}>
          <span>{teammate?.name || 'AI Teammate'}</span>
          <small>{teammate?.title || 'Role-aware collaborator'}</small>
        </div>
      </div>

      <div className={styles.messagesArea}>
        {messages.map((msg, index) => (
          <div key={index} className={`${styles.messageWrapper} ${msg.role === 'user' ? styles.userWrapper : styles.modelWrapper}`}>
            <div className={`${styles.messageBubble} ${msg.role === 'user' ? styles.userBubble : styles.modelBubble}`}>
              {msg.content}
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
          placeholder="Ask for help or guidance..."
          className={styles.chatInput}
          disabled={loading}
        />
        <button type="submit" className={styles.sendBtn} disabled={loading || !input.trim()}>
          Ask
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
