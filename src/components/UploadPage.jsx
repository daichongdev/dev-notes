import React, { useState, useEffect } from 'react';
import { useGitHub } from '../hooks/useGitHub';
import { useRepositoryList } from '../hooks/useStorage';
import GitHubService from '../services/GitHubService';
import FileBrowser from './FileBrowser';
import CodeEditor from './CodeEditor';

const UploadPage = ({ config, onConfigUpdate, onReset }) => {
    const { addRepository } = useRepositoryList();
    const [showRepoDropdown, setShowRepoDropdown] = useState(false);
    const [ownerRepos, setOwnerRepos] = useState([]);
    const [loadingRepos, setLoadingRepos] = useState(false);

    const [formData, setFormData] = useState({
        filename: '',
        language: 'javascript',
        code: '',
        message: '',
        customPath: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [showCreateNew, setShowCreateNew] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const { uploadCode, loading, error } = useGitHub(config.token);

    const [showConfigModal, setShowConfigModal] = useState(false);
    const [configForm, setConfigForm] = useState({
        owner: config.owner,
        token: config.token
    });

    // 自动保存当前配置到仓库列表
    useEffect(() => {
        if (config.owner && config.repo && config.token) {
            addRepository(config);
        }
    }, [config]);

    // 获取当前owner下的所有仓库
    const fetchOwnerRepos = async () => {
        if (loadingRepos) return;

        setLoadingRepos(true);
        try {
            const githubService = new GitHubService(config.token);
            const repos = await githubService.getUserRepositories(config.owner);
            setOwnerRepos(repos);
        } catch (error) {
            console.error('Failed to fetch repositories:', error);
        } finally {
            setLoadingRepos(false);
        }
    };

    // 处理仓库选择 - 只更新 repo，不重置整个配置
    const handleRepoSelect = (repo) => {
        const newConfig = {
            ...config,
            owner: repo.owner.login,
            repo: repo.name
        };

        // 清空文件选择状态
        setSelectedFile(null);
        setSelectedFolder(null);

        // 清空表单中的文件相关数据
        setFormData(prev => ({
            ...prev,
            filename: '',
            customPath: '',
            code: ''
        }));

        // 保存新配置到仓库列表
        addRepository(newConfig);

        // 更新当前配置
        onConfigUpdate(newConfig);
        setShowRepoDropdown(false);
    };

    // 处理点击仓库信息区域
    const handleRepoInfoClick = () => {
        if (!showRepoDropdown) {
            fetchOwnerRepos();
        }
        setShowRepoDropdown(!showRepoDropdown);
    };

    // 点击外部关闭下拉框
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.current-repo-info')) {
                setShowRepoDropdown(false);
            }
        };

        if (showRepoDropdown) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [showRepoDropdown]);

    // 处理配置更新
    const handleConfigUpdate = async () => {
        try {
            const service = new GitHubService(configForm.token);
            const isValid = await service.validateToken();
            if (!isValid) {
                alert('Token 无效');
                return;
            }

            onConfigUpdate({
                owner: configForm.owner,
                token: configForm.token,
                repo: '' // 清空当前仓库，让用户重新选择
            });
            setShowConfigModal(false);
        } catch (err) {
            alert('验证失败：' + err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let finalPath = formData.customPath;
            let shouldAppend = false;

            if (selectedFile) {
                finalPath = selectedFile.path;
                shouldAppend = true;
            } else if (selectedFolder) {
                if (formData.customPath) {
                    finalPath = formData.customPath;
                } else {
                    finalPath = selectedFolder.path ? `${selectedFolder.path}/${formData.filename}` : formData.filename;
                }
                shouldAppend = await checkFileExists(finalPath);
            } else if (showCreateNew) {
                finalPath = formData.customPath || formData.filename;
                shouldAppend = await checkFileExists(finalPath);
            }

            const result = await uploadCode({
                owner: config.owner,
                repo: config.repo,
                filename: formData.filename,
                language: formData.language,
                code: formData.code,
                message: formData.message || (shouldAppend ? `追加内容到 ${finalPath}` : `创建文件 ${finalPath}`),
                customPath: finalPath,
                shouldAppend: shouldAppend
            });

            setUploadSuccess(true);
            setFormData(prev => ({
                ...prev,
                code: '',
                filename: selectedFile ? selectedFile.name : ''
            }));

            setTimeout(() => setUploadSuccess(false), 3000);
        } catch (err) {
            console.error('Upload error:', err);
        }
    };

    const checkFileExists = async (path) => {
        try {
            const response = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/contents/${path}`, {
                headers: {
                    'Authorization': `token ${config.token}`
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setSelectedFolder(null);
        setShowCreateNew(false);
        setFormData(prev => ({
            ...prev,
            filename: file.name
        }));
    };

    const handleFolderSelect = (folder) => {
        setSelectedFolder(folder);
        setSelectedFile(null);
        setShowCreateNew(false);
    };

    const handleCreateNew = () => {
        setShowCreateNew(true);
        setSelectedFile(null);
        setSelectedFolder(null);
        setFormData(prev => ({
            ...prev,
            filename: ''
        }));
    };

    return (
        <div className="upload-page">
            <div className="upload-header">
                <div className="logo">
                    <div className="logo-icon">⭐️</div>
                    <h1>DevNotes</h1>
                </div>



                {/* 当前仓库信息和选择 */}
                <div className="current-repo-info" onClick={handleRepoInfoClick}>
                    <div className="repo-details">
                        <div className="repo-main">
                            <span className="repo-icon">📁</span>
                            <span className="repo-name">
                                {config.repo || '选择仓库'}
                            </span>
                            <span className="dropdown-arrow">▼</span>
                        </div>
                        <div className="repo-owner">@{config.owner}</div>
                    </div>
                    <div className="header-actions">
                        <button
                            className="btn btn-outline config-btn"
                            onClick={() => setShowConfigModal(true)}
                            title="修改 GitHub 配置"
                        >
                            ⚙️ 配置
                        </button>
                    </div>
                    {/* 下拉仓库列表 */}
                    {showRepoDropdown && (
                        <div className="repo-dropdown">
                            {loadingRepos ? (
                                <div className="repo-loading">
                                    <div className="spinner"></div>
                                    <span>加载仓库中...</span>
                                </div>
                            ) : (
                                <div className="repo-list">
                                    {ownerRepos.length > 0 ? (
                                        ownerRepos.map(repo => (
                                            <div
                                                key={repo.id}
                                                className={`repo-item ${repo.name === config.repo ? 'active' : ''
                                                    }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRepoSelect(repo);
                                                }}
                                            >
                                                <div className="repo-info">
                                                    <div className="repo-title">
                                                        <span className="repo-icon">📁</span>
                                                        <span className="repo-name">{repo.name}</span>
                                                        {repo.private && <span className="private-badge">私有</span>}
                                                    </div>
                                                    <div className="repo-meta">
                                                        <span className="repo-desc">{repo.description || '无描述'}</span>
                                                        <span className="repo-updated">更新于 {new Date(repo.updated_at).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                                {repo.language && (
                                                    <span className="repo-language">{repo.language}</span>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-repos">
                                            <span>未找到仓库</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 配置修改模态框 */}
            {showConfigModal && (
                <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>修改 GitHub 配置</h3>
                            <button
                                className="modal-close"
                                onClick={() => setShowConfigModal(false)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>GitHub 用户名</label>
                                <input
                                    type="text"
                                    value={configForm.owner}
                                    onChange={(e) => setConfigForm(prev => ({ ...prev, owner: e.target.value }))}
                                    className="modern-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>GitHub Token</label>
                                <input
                                    type="password"
                                    value={configForm.token}
                                    onChange={(e) => setConfigForm(prev => ({ ...prev, token: e.target.value }))}
                                    className="modern-input"
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline"
                                onClick={() => setShowConfigModal(false)}
                            >
                                取消
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleConfigUpdate}
                            >
                                保存
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="upload-content">
                {/* 文件浏览器 */}
                <div className="file-browser-section">
                    <FileBrowser
                        owner={config.owner}
                        repo={config.repo}
                        token={config.token}
                        onFileSelect={handleFileSelect}
                        onFolderSelect={handleFolderSelect}
                        onCreateNew={handleCreateNew}
                    />
                </div>

                {/* 上传表单 */}
                <div className="upload-form-section">
                    <form onSubmit={handleSubmit} className="upload-form">
                        <div className="form-group">
                            <label>文件名</label>
                            <input
                                type="text"
                                value={formData.filename}
                                onChange={(e) => setFormData(prev => ({ ...prev, filename: e.target.value }))}
                                placeholder="例如: script.js"
                                className="modern-input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>自定义路径 (可选)</label>
                            <input
                                type="text"
                                value={formData.customPath}
                                onChange={(e) => setFormData(prev => ({ ...prev, customPath: e.target.value }))}
                                placeholder="例如: src/utils/helper.js"
                                className="modern-input"
                            />
                        </div>

                        <div className="form-group">
                            <CodeEditor
                                value={formData.code}
                                onChange={(code) => setFormData(prev => ({ ...prev, code }))}
                                language={formData.language}
                            />
                        </div>

                        <div className="form-group">
                            <label>💻提交信息 (可选)</label>
                            <input
                                type="text"
                                value={formData.message}
                                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                                placeholder="描述这次提交的内容"
                                className="modern-input"
                            />
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                disabled={loading || !formData.filename || !formData.code}
                                className="btn btn-primary"
                            >
                                {loading ? (
                                    <>
                                        <div className="btn-spinner"></div>
                                        上传中...
                                    </>
                                ) : (
                                    selectedFile ? '追加到文件' : '创建文件'
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                {error}
                            </div>
                        )}

                        {uploadSuccess && (
                            <div className="success-message">
                                <span className="success-icon">✅</span>
                                文件上传成功！
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;