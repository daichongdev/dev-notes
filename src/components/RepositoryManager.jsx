import React, { useState, useEffect } from 'react';
import GitHubService from '../services/GitHubService';

const RepositoryManager = ({ token, repositories, onRepositoriesChange, onClose }) => {
    const [userRepos, setUserRepos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newRepo, setNewRepo] = useState({
        name: '',
        description: '',
        isPrivate: false
    });

    const githubService = new GitHubService(token, '', '');

    useEffect(() => {
        loadUserRepositories();
    }, []);

    const loadUserRepositories = async () => {
        setLoading(true);
        try {
            const repos = await githubService.getUserRepositories();
            setUserRepos(repos);
        } catch (error) {
            console.error('Failed to load repositories:', error);
            alert('获取仓库列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRepository = async () => {
        if (!newRepo.name.trim()) {
            alert('请输入仓库名称');
            return;
        }

        setLoading(true);
        try {
            const createdRepo = await githubService.createRepository(
                newRepo.name,
                newRepo.description,
                newRepo.isPrivate
            );
            
            // 添加到仓库列表
            const newRepoConfig = {
                id: createdRepo.id,
                name: createdRepo.name,
                owner: createdRepo.owner.login,
                fullName: createdRepo.full_name,
                isPrivate: createdRepo.private
            };
            
            onRepositoriesChange([...repositories, newRepoConfig]);
            setShowCreateForm(false);
            setNewRepo({ name: '', description: '', isPrivate: false });
            await loadUserRepositories();
            alert('仓库创建成功！');
        } catch (error) {
            console.error('Failed to create repository:', error);
            alert('创建仓库失败: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddExistingRepo = (repo) => {
        const repoConfig = {
            id: repo.id,
            name: repo.name,
            owner: repo.owner.login,
            fullName: repo.full_name,
            isPrivate: repo.private
        };
        
        // 检查是否已存在
        if (repositories.some(r => r.id === repo.id)) {
            alert('该仓库已添加');
            return;
        }
        
        onRepositoriesChange([...repositories, repoConfig]);
    };

    const handleRemoveRepo = (repoId) => {
        if (window.confirm('确定要从列表中移除此仓库吗？')) {
            onRepositoriesChange(repositories.filter(r => r.id !== repoId));
        }
    };

    return (
        <div className="repository-manager">
            <div className="manager-header">
                <h3>仓库管理</h3>
                <button className="btn btn-outline" onClick={onClose}>关闭</button>
            </div>

            <div className="current-repositories">
                <h4>当前仓库列表</h4>
                {repositories.length === 0 ? (
                    <p className="empty-state">暂无仓库</p>
                ) : (
                    <div className="repo-list">
                        {repositories.map(repo => (
                            <div key={repo.id} className="repo-item">
                                <div className="repo-info">
                                    <span className="repo-name">{repo.fullName}</span>
                                    {repo.isPrivate && <span className="private-badge">私有</span>}
                                </div>
                                <button 
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleRemoveRepo(repo.id)}
                                >
                                    移除
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="actions">
                <button 
                    className="btn btn-primary"
                    onClick={() => setShowCreateForm(!showCreateForm)}
                >
                    {showCreateForm ? '取消创建' : '创建新仓库'}
                </button>
                <button 
                    className="btn btn-outline"
                    onClick={loadUserRepositories}
                    disabled={loading}
                >
                    {loading ? '加载中...' : '刷新仓库列表'}
                </button>
            </div>

            {showCreateForm && (
                <div className="create-repo-form">
                    <h4>创建新仓库</h4>
                    <div className="form-group">
                        <label>仓库名称</label>
                        <input
                            type="text"
                            value={newRepo.name}
                            onChange={(e) => setNewRepo({...newRepo, name: e.target.value})}
                            placeholder="输入仓库名称"
                        />
                    </div>
                    <div className="form-group">
                        <label>描述（可选）</label>
                        <input
                            type="text"
                            value={newRepo.description}
                            onChange={(e) => setNewRepo({...newRepo, description: e.target.value})}
                            placeholder="输入仓库描述"
                        />
                    </div>
                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={newRepo.isPrivate}
                                onChange={(e) => setNewRepo({...newRepo, isPrivate: e.target.checked})}
                            />
                            私有仓库
                        </label>
                    </div>
                    <button 
                        className="btn btn-primary"
                        onClick={handleCreateRepository}
                        disabled={loading}
                    >
                        {loading ? '创建中...' : '创建仓库'}
                    </button>
                </div>
            )}

            {userRepos.length > 0 && (
                <div className="available-repositories">
                    <h4>可添加的仓库</h4>
                    <div className="repo-list">
                        {userRepos.filter(repo => !repositories.some(r => r.id === repo.id)).map(repo => (
                            <div key={repo.id} className="repo-item">
                                <div className="repo-info">
                                    <span className="repo-name">{repo.full_name}</span>
                                    {repo.private && <span className="private-badge">私有</span>}
                                </div>
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleAddExistingRepo(repo)}
                                >
                                    添加
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RepositoryManager;