import React from 'react';
import { useStorage } from '../hooks/useStorage';
import IntroPage from './IntroPage';
import SetupPage from './SetupPage';
import UploadPage from './UploadPage';

function App() {
  const [config, setConfig] = useStorage('github-config', {
    owner: '',
    repo: '',
    token: ''
  });
  
  const [hasSeenIntro, setHasSeenIntro] = useStorage('has-seen-intro', false);

  // 只需要 owner 和 token 就可以进入上传页面
  const isConfigured = config.owner && config.token;

  // 如果用户还没有看过介绍页面，显示介绍页面
  if (!hasSeenIntro) {
    return (
      <div className="app-container">
        <IntroPage onContinue={() => setHasSeenIntro(true)} />
      </div>
    );
  }

  // 如果还没有配置，显示设置页面
  if (!isConfigured) {
    return (
      <div className="app-container">
        <SetupPage
          onComplete={(newConfig) => setConfig(newConfig)}
          existingConfig={config}
        />
      </div>
    );
  }

  // 配置完成，显示上传页面
  return (
    <div className="app-container">
      <UploadPage
        config={config}
        onConfigUpdate={(newConfig) => setConfig(newConfig)}
        onReset={() => {
          setConfig({ owner: '', repo: '', token: '' });
          setHasSeenIntro(false); // 重置时也重置介绍页面状态
        }}
      />
    </div>
  );
}

export default App;