* {
  box-sizing: border-box;
}

:root {
  --bg: #07100d;
  --panel: #101d1a;
  --panel-strong: #142922;
  --border: rgba(150, 202, 181, 0.18);
  --text: #edf7f1;
  --muted: #a9c3b8;
  --primary: #7ed8b4;
  --primary-2: #94aaf7;
  --danger: #ef9a9a;
  --warning: #f4d38d;
  --success: #7ed8b4;
  --shadow: 0 14px 30px rgba(0, 0, 0, 0.28);
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: Inter, "Segoe UI", sans-serif;
  background: radial-gradient(circle at top, #0f1e1a 0%, var(--bg) 40%, #050a09 100%);
  color: var(--text);
}

button,
input {
  font: inherit;
}

.app-shell {
  width: min(1200px, calc(100% - 32px));
  margin: 32px auto;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3rem);
}

.card {
  background: rgba(16, 29, 26, 0.78);
  border: 1px solid var(--border);
  border-radius: 18px;
  box-shadow: var(--shadow);
}

.controls {
  padding: 18px;
}

.button-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

button {
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
  background: rgba(255, 255, 255, 0.04);
  color: white;
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

button.primary {
  background: linear-gradient(135deg, var(--primary), #5bc4b1);
  color: #062317;
  font-weight: 700;
}

button.secondary {
  background: rgba(126, 216, 180, 0.12);
  border-color: rgba(126, 216, 180, 0.32);
}

button.ghost {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.12);
}

button.danger {
  border-color: rgba(239, 154, 154, 0.25);
}

.drop-zone {
  border: 1.5px dashed rgba(126, 216, 180, 0.42);
  border-radius: 14px;
  padding: 28px 18px;
  text-align: center;
  background: rgba(126, 216, 180, 0.04);
  color: var(--muted);
}

.workspace {
  margin-top: 18px;
  padding: 20px;
  display: grid;
  grid-template-columns: minmax(0, 1.7fr) minmax(260px, 0.9fr);
  gap: 20px;
}

.canvas-panel {
  background: #091713;
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
}

canvas {
  width: 100%;
  display: block;
  background: #081311;
}

.analysis-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.badge-row,
.direction-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.label {
  color: var(--muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.pill,
.direction {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 999px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.pill {
  background: rgba(148, 170, 247, 0.12);
  color: var(--primary-2);
}

.direction {
  min-width: 96px;
  background: rgba(255, 255, 255, 0.06);
  color: white;
}

.direction.long {
  background: rgba(126, 216, 180, 0.18);
  color: var(--success);
}

.direction.short {
  background: rgba(239, 154, 154, 0.18);
  color: var(--danger);
}

.direction.wait {
  background: rgba(148, 170, 247, 0.12);
  color: var(--primary-2);
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(120px, 1fr));
  gap: 16px;
}

.meta-grid div {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 10px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.meta-grid strong {
  font-size: 0.98rem;
}

.summary-block {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.summary-block h2 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1rem;
}

.summary-block p {
  margin: 0;
  color: var(--muted);
  line-height: 1.6;
}

.status-wrap {
  display: flex;
  align-items: center;
}

.status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 8px 12px;
  background: rgba(148, 170, 247, 0.12);
  color: var(--primary-2);
  border: 1px solid rgba(148, 170, 247, 0.22);
  font-size: 0.82rem;
}

.status.error {
  background: rgba(239, 154, 154, 0.12);
  border-color: rgba(239, 154, 154, 0.25);
  color: var(--danger);
}

.status.success {
  background: rgba(126, 216, 180, 0.14);
  border-color: rgba(126, 216, 180, 0.24);
  color: var(--success);
}

@media (max-width: 860px) {
  .workspace {
    grid-template-columns: 1fr;
  }
}
