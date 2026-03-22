export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .auth-page {
          --bg: #e0e5ec;
          --text-main: #334155;
          --text-muted: #64748b;
          --accent: #3aa660; 
          --accent-dark: #2d8c55;
          --shadow-out: 9px 9px 16px rgba(163,177,198,0.6), -9px -9px 16px rgba(255,255,255, 0.7);
          --shadow-out-sm: 5px 5px 10px rgba(163,177,198,0.5), -5px -5px 10px rgba(255,255,255, 0.6);
          --shadow-hover: 12px 12px 20px rgba(163,177,198,0.7), -12px -12px 20px rgba(255,255,255, 0.8);
          --shadow-in: inset 6px 6px 10px 0 rgba(163,177,198, 0.5), inset -6px -6px 10px 0 rgba(255,255,255, 0.6);
          --shadow-in-sm: inset 3px 3px 6px 0 rgba(163,177,198, 0.5), inset -3px -3px 6px 0 rgba(255,255,255, 0.6);
          
          background: var(--bg);
          color: var(--text-main);
          min-height: 100vh;
        }
        
        .neu-panel {
          background: var(--bg);
          border-radius: 20px;
          box-shadow: var(--shadow-out);
          padding: 40px;
        }
        
        .neu-input {
          background: var(--bg);
          box-shadow: var(--shadow-in-sm);
          border: none;
          color: var(--text-main);
          border-radius: 12px;
          padding: 14px 18px;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
          font-size: 15px;
        }
        .neu-input:focus {
          box-shadow: var(--shadow-in);
        }
        .neu-input::placeholder {
          color: var(--text-muted);
        }
        
        .neu-btn {
          background: var(--bg);
          box-shadow: var(--shadow-out-sm);
          border: none;
          border-radius: 12px;
          padding: 14px 24px;
          color: var(--text-main);
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .neu-btn:hover {
          box-shadow: var(--shadow-hover);
          color: var(--accent-dark);
          transform: translateY(-1px);
        }
        .neu-btn:active {
          box-shadow: var(--shadow-in);
          transform: translateY(1px);
        }
        .neu-btn-primary {
          color: var(--accent-dark);
          font-weight: 700;
        }
      `}} />
      <div className="auth-page flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </>
  )
}
