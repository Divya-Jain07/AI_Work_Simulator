import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiCpu } from 'react-icons/fi';
import styles from './Auth.module.css';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await register(name, email, password);
    if (res.success) {
      navigate('/choose-role');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={`card ${styles.authCard} animate-fade-in`}>
        <div className={styles.authHeader}>
          <div className={styles.logoWrapper}>
            <Link to="/" className={styles.brandLink}>
              <span className={styles.logoIconInline}><FiCpu /></span>
              <span>WorkSim</span>
              <span className={styles.logoBox}>AI</span>
            </Link>
          </div>
          <h2>Apply as Intern</h2>
          <p>Join the AI Work Simulator platform</p>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className="label">Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label className="label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="intern@company.com"
              required 
            />
          </div>
          <div className={styles.formGroup}>
            <label className="label">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required 
            />
          </div>
          <button type="submit" className={`btn btn-primary ${styles.submitBtn}`}>
            Create Account
          </button>
        </form>
        <p className={styles.authFooter}>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
