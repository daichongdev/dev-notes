import React, { useState } from 'react';
import { useRepositories } from '../hooks/useStorage';
import GitHubService from '../services/GitHubService';

const RepositorySelector = () => {
  const { repositories, currentRepo, addRepository, removeRepository, selectRepository } = useRepositories();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRepoForm, setNewRepoForm] = useState({ owner: '', repo: '', token: '' });
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handleAddRepository = async () => {
    if (!newRepoForm.owner || !newRepoForm.repo || !newRepoForm.token) {
      setError('请填写所有字段');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      // 验证仓库访问权限
      const githubService = new GitHubService(newRepoForm.token, newRepoForm.owner, newRepoForm.repo);
      await githubService.getRepositoryInfo();
      
      // 检查是否已存在
      const exists = repositories.some(repo => 
        repo.owner === newRepoForm.owner && repo.repo === newRepoForm.repo
      );
      
      if (exists) {
        setError('该仓库已存在');
        return;
      }

      const newRepo = addRepository(newRepoForm);
      selectRepository(newRepo);
      setNewRepoForm({ owner: '', repo: '', token: '' });
      setShowAddForm(false);
    } catch (err) {
      setError('无法访问该仓库，请检查仓库信息和token权限');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="repository-selector">
      <div className="current-repo">
        <h3>当前仓库</h3>
        {currentRepo ? (
          <div className="repo-info">
            <span className="repo-name">{currentRepo.name}</span>
            <button 
              className="btn-secondary"
              onClick={() => setShowAddForm(true)}
            >
              切换仓库
            </button>
          </div>
        ) : (
          <button 
            className="btn-primary"
            onClick={() => setShowAddForm(true)}
          >
            添加仓库
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="add-repo-modal">
          <div className="modal-content">
            <h3>添加GitHub仓库</h3>
            
            <div className="form-group">
              <label>仓库所有者</label>
              <input
                type="text"
                value={newRepoForm.owner}
                onChange={(e) => setNewRepoForm(prev => ({ ...prev, owner: e.target.value }))}
                placeholder="用户名或组织名"
              />
            </div>

            <div className="form-group">
              <label>仓库名称</label>
              <input
                type="text"
                value={newRepoForm.repo}
                onChange={(e) => setNewRepoForm(prev => ({ ...prev, repo: e.target.value }))}
                placeholder="仓库名称"
              />
            </div>

            <div className="form-group">
              <label>GitHub Token</label>
              <input
                type="password"
                value={newRepoForm.token}
                onChange={(e) => setNewRepoForm(prev => ({ ...prev, token: e.target.value }))}
                placeholder="GitHub Personal Access Token"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-actions">
              <button 
                className="btn-secondary"
                onClick={() => {
                  setShowAddForm(false);
                  setError('');
                  setNewRepoForm({ owner: '', repo: '', token: '' });
                }}
              >
                取消
              </button>
              <button 
                className="btn-primary"
                onClick={handleAddRepository}
                disabled={isValidating}
              >
                {isValidating ? '验证中...' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {repositories.length > 0 && (
        <div className="repo-list">
          <h4>已添加的仓库</h4>
          {repositories.map(repo => (
            <div key={repo.id} className={`repo-item ${currentRepo?.id === repo.id ? 'active' : ''}`}>
              <span className="repo-name">{repo.name}</span>
              <div className="repo-actions">
                {currentRepo?.id !== repo.id && (
                  <button 
                    className="btn-link"
                    onClick={() => selectRepository(repo)}
                  >
                    选择
                  </button>
                )}
                <button 
                  className="btn-danger-link"
                  onClick={() => removeRepository(repo.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RepositorySelector;