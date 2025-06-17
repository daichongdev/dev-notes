import React, { useState, useEffect } from 'react';
import { useGitHub } from '../hooks/useGitHub';

const FileBrowser = ({ owner, repo, token, onFileSelect, onFolderSelect, onCreateNew }) => {
    const [treeData, setTreeData] = useState([]);
    const [expandedFolders, setExpandedFolders] = useState(new Set());
    const [selectedItem, setSelectedItem] = useState(null);
    const { getRepositoryTree, deleteFile, deleteFolder, loading, isAuthenticated } = useGitHub(token);

    // Monitor repository changes and clear file browser state
    useEffect(() => {
        // When owner or repo changes, clear all states
        setTreeData([]);
        setExpandedFolders(new Set());
        setSelectedItem(null);
    }, [owner, repo]);

    const handleBrowseRepository = async () => {
        if (!owner || !repo) {
            alert('请先输入仓库所有者和名称');
            return;
        }

        if (!isAuthenticated) {
            alert('GitHub token未配置或无效，请检查设置');
            return;
        }

        try {
            const tree = await getRepositoryTree(owner, repo);
            setTreeData(tree);
            // 默认展开所有文件夹
            const allFolderPaths = new Set();
            const collectFolderPaths = (nodes) => {
                nodes.forEach(node => {
                    if (node.type === 'tree') {
                        allFolderPaths.add(node.path);
                        if (node.children && node.children.length > 0) {
                            collectFolderPaths(node.children);
                        }
                    }
                });
            };
            collectFolderPaths(tree);
            allFolderPaths.add('root');
            setExpandedFolders(allFolderPaths);
        } catch (error) {
            console.error('Error browsing repository:', error);
            alert('获取仓库结构失败');
        }
    };

    const toggleFolder = (path) => {
        const newExpanded = new Set(expandedFolders);
        if (newExpanded.has(path)) {
            newExpanded.delete(path);
        } else {
            newExpanded.add(path);
        }
        setExpandedFolders(newExpanded);
    };

    const handleItemSelect = (item) => {
        setSelectedItem(item.path);

        if (item.type === 'tree') {
            onFolderSelect && onFolderSelect({
                path: item.path,
                name: item.name,
                type: 'folder'
            });
        } else if (item.type === 'blob') {
            onFileSelect && onFileSelect({
                path: item.path,
                name: item.name,
                type: 'file',
                sha: item.sha,
                size: item.size
            });
        }
    };

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        const iconMap = {
            'js': '⚙️',
            'jsx': '⚛️',
            'ts': '🔷',
            'tsx': '⚛️',
            'html': '🌐',
            'css': '🎨',
            'scss': '🎨',
            'json': '📋',
            'md': '📝',
            'txt': '📄',
            'py': '🐍',
            'java': '☕',
            'php': '🐘',
            'go': '🐹',
            'rs': '🦀',
            'cpp': '⚙️',
            'c': '⚙️',
            'yml': '⚙️',
            'yaml': '⚙️',
            'xml': '📄',
            'svg': '🖼️',
            'png': '🖼️',
            'jpg': '🖼️',
            'gif': '🖼️'
        };
        return iconMap[ext] || '📄';
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return `${bytes}B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    };

    const handleDeleteItem = async (item) => {
        if (!window.confirm(`确定要删除 ${item.type === 'tree' ? '文件夹' : '文件'} "${item.name}" 吗？\n\n注意：此操作将同时删除GitHub上的文件，且无法撤销！`)) {
            return;
        }

        try {
            if (item.type === 'blob') {
                await deleteFile(owner, repo, item.path, item.sha, `删除文件: ${item.name}`);
            } else if (item.type === 'tree') {
                await deleteFolder(owner, repo, item.path, `删除文件夹: ${item.name}`);
            }

            // 删除成功后刷新文件树，强制破坏缓存
            const tree = await getRepositoryTree(owner, repo);
            setTreeData(tree);
            setSelectedItem(null);
        } catch (error) {
            console.error('删除失败:', error);
            alert('删除失败: ' + error.message);
        }
    };

    const renderTreeNode = (node, level = 0) => {
        const isExpanded = expandedFolders.has(node.path);
        const isSelected = selectedItem === node.path;
        const hasChildren = node.children && node.children.length > 0;

        return (
            <div key={node.path} className="tree-node-modern">
                <div
                    className={`tree-item-modern ${isSelected ? 'selected' : ''} ${node.type === 'tree' ? 'folder' : 'file'}`}
                    style={{ paddingLeft: `${level * 20 + 12}px` }}
                    onClick={() => handleItemSelect(node)}
                >
                    <div className="item-content">
                        {node.type === 'tree' && (
                            <span
                                className="folder-toggle-modern"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFolder(node.path);
                                }}
                            >
                                <svg width="12" height="12" viewBox="0 0 12 12" className={`chevron ${isExpanded ? 'expanded' : ''}`}>
                                    <path d="M4 2L8 6L4 10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </span>
                        )}
                        <span className="item-icon">
                            {node.type === 'tree' ? (isExpanded ? '📂' : '📁') : getFileIcon(node.name)}
                        </span>
                        <span className="item-name-modern">{node.name}</span>
                        {node.type === 'blob' && node.size && (
                            <span className="file-size-modern">{formatFileSize(node.size)}</span>
                        )}
                        <button
                            className="delete-btn-modern"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteItem(node);
                            }}
                            title={`删除${node.type === 'tree' ? '文件夹' : '文件'}`}
                        >
                            🗑️
                        </button>
                    </div>
                </div>

                {node.type === 'tree' && isExpanded && hasChildren && (
                    <div className="tree-children-modern">
                        {node.children.map(child => renderTreeNode(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="file-browser-modern">
            <div className="browser-actions-modern">
                <button
                    type="button"
                    onClick={handleBrowseRepository}
                    disabled={loading}
                    className="btn btn-primary browse-repo-btn"
                >
                    {loading ? (
                        <>
                            <div className="btn-spinner"></div>
                            加载中...
                        </>
                    ) : (
                        <>
                            <span>📁</span>
                            浏览仓库文件
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={onCreateNew}
                    className="btn btn-outline create-new-btn"
                >
                    <span>✨</span>
                    创建新文件
                </button>
            </div>

            {treeData.length > 0 && (
                <div className="repository-tree-modern">
                    <div className="tree-header-modern">
                        <div className="repo-info">
                            <span className="repo-icon">📦</span>
                            <span className="repo-name">{owner}/{repo}</span>
                        </div>
                        <div className="tree-stats">
                            <span className="file-count">{treeData.filter(n => n.type === 'blob').length} 文件</span>
                            <span className="folder-count">{treeData.filter(n => n.type === 'tree').length} 文件夹</span>
                        </div>
                    </div>
                    <div className="tree-container-modern">
                        {treeData.map(node => renderTreeNode(node))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileBrowser;