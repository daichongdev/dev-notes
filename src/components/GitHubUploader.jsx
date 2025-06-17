import React, { useState } from 'react';
import { useGitHub } from '../hooks/useGitHub';
import { useStorage } from '../hooks/useStorage';
import FileBrowser from './FileBrowser';
import CodeEditor from './CodeEditor';

const GitHubUploader = () => {
    const [config, setConfig] = useStorage('github-config', {
        owner: '',
        repo: '',
        token: ''
    });

    const [formData, setFormData] = useState({
        filename: '',
        language: 'javascript',
        code: '',
        message: 'Add code via Chrome extension',
        customPath: ''
    });

    const { uploadCode, loading, error } = useGitHub(config.token);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const result = await uploadCode({
                owner: config.owner,
                repo: config.repo,
                ...formData
            });

            alert(`File ${result.action} successfully!`);
            setFormData(prev => ({ ...prev, code: '', filename: '' }));
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    return (
        <div className="github-uploader">
            <h2>GitHub Code Uploader</h2>

            {/* Configuration Section */}
            <div className="config-section">
                <h3>Repository Configuration</h3>
                <input
                    type="text"
                    placeholder="Repository Owner"
                    value={config.owner}
                    onChange={(e) => setConfig(prev => ({ ...prev, owner: e.target.value }))}
                />
                <input
                    type="text"
                    placeholder="Repository Name"
                    value={config.repo}
                    onChange={(e) => setConfig(prev => ({ ...prev, repo: e.target.value }))}
                />
                <input
                    type="password"
                    placeholder="GitHub Token"
                    value={config.token}
                    onChange={(e) => setConfig(prev => ({ ...prev, token: e.target.value }))}
                />
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSubmit}>
                <FileBrowser
                    owner={config.owner}
                    repo={config.repo}
                    language={formData.language}
                    onFileSelect={(file) => {
                        setFormData(prev => ({
                            ...prev,
                            filename: file.name,
                            code: file.content || '',
                            customPath: file.path
                        }));
                    }}
                />

                <input
                    type="text"
                    placeholder="Filename"
                    value={formData.filename}
                    onChange={(e) => setFormData(prev => ({ ...prev, filename: e.target.value }))}
                    required
                />

                <input
                    type="text"
                    placeholder="Custom Path (optional)"
                    value={formData.customPath}
                    onChange={(e) => setFormData(prev => ({ ...prev, customPath: e.target.value }))}
                />

                <input
                    type="text"
                    placeholder="Commit Message"
                    value={formData.message}
                    onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                />

                <CodeEditor
                    value={formData.code}
                    language={formData.language}
                    onChange={(code) => setFormData(prev => ({ ...prev, code }))}
                />

                <button type="submit" disabled={loading}>
                    {loading ? 'Uploading...' : 'Upload to GitHub'}
                </button>
            </form>

            {error && <div className="error">{error}</div>}
        </div>
    );
};

export default GitHubUploader;