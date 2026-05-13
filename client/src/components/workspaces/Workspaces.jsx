import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import styles from './Workspaces.module.css';
import { DesignWorkspace } from './DesignWorkspace';

export const CodeWorkspace = ({ value, onChange, language = "javascript" }) => {
  return (
    <div className={styles.workspaceContainer}>
      <Editor
        height="100%"
        defaultLanguage={language}
        theme="vs-dark"
        value={value}
        onChange={(val) => onChange(val || '')}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineHeight: 22,
          wordWrap: 'on',
          padding: { top: 18 },
          scrollBeyondLastLine: false
        }}
      />
    </div>
  );
};

export const ApiPlayground = ({ value, onChange }) => {
  const [method, setMethod] = useState('POST');
  const [url, setUrl] = useState('https://api.workplace.local/v1/auth');
  
  useEffect(() => {
    if (!value) {
      onChange(`// API Playground Simulation\n// Method: ${method}\n// URL: ${url}\n// Request Body:\n{\n  \n}`);
    }
  }, []);

  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.apiHeader}>
        <select value={method} onChange={(e) => setMethod(e.target.value)} className={styles.apiSelect}>
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>PATCH</option>
          <option>DELETE</option>
        </select>
        <input 
          type="text" 
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          className={styles.apiInput}
          placeholder="Enter API endpoint URL"
        />
        <button className={styles.apiSend}>Send Request</button>
      </div>
      <div className={styles.apiBody}>
        <div className={styles.apiLabel}>Request Body (JSON)</div>
        <Editor
          height="100%"
          defaultLanguage="json"
          theme="vs-dark"
          value={value}
          onChange={(val) => onChange(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 18 }
          }}
        />
      </div>
    </div>
  );
};

export const DataDashboard = ({ value, onChange }) => {
  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.dataHeader}>
        <div className={styles.dataTabs}>
          <button className={styles.activeTab}>Query Editor</button>
          <button>Schema Viewer</button>
          <button>Chart Builder</button>
        </div>
        <div className={styles.datasetInfo}>Dataset: user_cohorts_v2.csv</div>
      </div>
      <div className={styles.dataWorkspace}>
        <Editor
          height="100%"
          defaultLanguage="sql"
          theme="vs-dark"
          value={value}
          onChange={(val) => onChange(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 18 }
          }}
        />
      </div>
    </div>
  );
};

// DesignFeedbackBoard has been replaced by the premium DesignWorkspace component imported above.

export const RichTextEditor = ({ value, onChange }) => {
  return (
    <div className={styles.workspaceContainer}>
      <div className={styles.richTextToolbar}>
        <button><strong>B</strong></button>
        <button><em>I</em></button>
        <button><u>U</u></button>
        <div className={styles.separator}></div>
        <button>H1</button>
        <button>H2</button>
        <div className={styles.separator}></div>
        <button>List</button>
        <button>Link</button>
      </div>
      <textarea 
        className={styles.textArea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start writing your report..."
      />
    </div>
  );
};

export const getWorkspaceComponent = (role) => {
  switch(role) {
    case 'frontend_developer':
      return CodeWorkspace;
    case 'backend_developer':
      return ApiPlayground;
    case 'data_analyst':
      return DataDashboard;
    case 'uiux_designer':
      return DesignWorkspace;
    default:
      return RichTextEditor;
  }
};
