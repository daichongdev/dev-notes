import React, { useState, useEffect } from 'react';
import GitHubService from '../services/GitHubService';

const SetupPage = ({ onComplete, existingConfig }) => {
    const [formData, setFormData] = useState({
        owner: '',
        token: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (existingConfig) {
            setFormData({
                owner: existingConfig.owner || '',
                token: existingConfig.token || ''
            });
        }
    }, [existingConfig]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const validateAndComplete = async () => {
        if (!formData.owner || !formData.token) {
            setError('请填写完整的用户名和 Token');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const service = new GitHubService(formData.token);
            const isValid = await service.validateToken();
            if (!isValid) {
                setError('Token 无效，请检查权限设置');
                return;
            }

            // 验证用户是否存在
            try {
                await service.getUserRepositories(formData.owner);
            } catch (err) {
                setError('用户名不存在或无权限访问');
                return;
            }

            // 只保存 owner 和 token，repo 在上传页面选择
            onComplete({
                owner: formData.owner,
                token: formData.token,
                repo: '' // 清空 repo，在上传页面选择
            });
        } catch (err) {
            setError('验证失败：' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="setup-page">
            <div className="setup-header">
                <div className="logo">
                    <div className="logo-icon">⭐️</div>
                    <h1>DevNotes</h1>
                </div>
                <p className="subtitle">GitHub 代码上传助手</p>
            </div>

            <div className="setup-content">
                <div className="setup-form">
                    <h3>配置 GitHub 信息</h3>
                    <p className="setup-description">
                        请输入您的 GitHub 用户名和访问令牌，配置完成后可以在上传页面选择具体仓库。
                    </p>

                    <div className="form-group">
                        <label>GitHub 用户名</label>
                        <input
                            type="text"
                            value={formData.owner}
                            onChange={(e) => handleInputChange('owner', e.target.value)}
                            placeholder="请输入 GitHub 用户名"
                            className="modern-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>GitHub Token</label>
                        <input
                            type="password"
                            value={formData.token}
                            onChange={(e) => handleInputChange('token', e.target.value)}
                            placeholder="请输入 GitHub Personal Access Token"
                            className="modern-input"
                        />
                        <div className="input-help">
                            需要 repo 权限的 Personal Access Token
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={validateAndComplete}
                        disabled={loading}
                        className="btn btn-primary setup-btn"
                    >
                        {loading ? (
                            <>
                                <div className="spinner"></div>
                                验证中...
                            </>
                        ) : (
                            '开始使用'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetupPage;