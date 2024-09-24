import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// 현재 모듈의 디렉터리 경로를 얻기 위한 설정
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 브라우저 창을 생성하는 함수
function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 1000,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'), // ES 모듈에서 __dirname 구현
    },
  });

  win.loadURL('http://localhost:5173');
}

// Electron이 초기화가 완료되면 호출되는 메서드
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 모든 창이 닫힐 때 종료
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

