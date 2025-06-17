import { useState, useCallback } from 'react';
import GitHubService from '../services/GitHubService';
import { generatePath } from '../utils/pathGenerator';
import { decodeContent } from '../utils/fileUtils';

export const useGitHub = (token) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [githubService] = useState(() => token ? new GitHubService(token) : null);

    const shouldAppendToFileByExtension = async (path, language) => {
        const appendableExtensions = ['.js', '.py', '.java', '.cpp', '.c', '.go'];
        const extension = path.substring(path.lastIndexOf('.'));
        return appendableExtensions.includes(extension);
    };

    const uploadCode = useCallback(async ({
        owner,
        repo,
        filename,
        language,
        code,
        message,
        customPath = null,
        shouldAppend = false
    }) => {
        if (!githubService) {
            throw new Error('GitHub token not provided');
        }

        setLoading(true);
        setError(null);

        try {
            const path = customPath || generatePath(language, filename);

            const existingFile = await githubService.getFileContent(owner, repo, path);

            let finalContent = code;
            let sha = null;

            if (existingFile) {
                sha = existingFile.sha;

                if (shouldAppend) {
                    // 强制追加内容
                    const existingContent = decodeContent(existingFile.content);
                    finalContent = `${existingContent}\n\n// --- ${message} ---\n${code}`;
                } else {
                    // 检查是否应该追加（保持原有逻辑）
                    const shouldAppendToFile = await shouldAppendToFileByExtension(path, language);
                    if (shouldAppendToFile) {
                        const existingContent = decodeContent(existingFile.content);
                        finalContent = `${existingContent}\n\n// --- ${message} ---\n${code}`;
                    }
                }
            }

            const result = await githubService.uploadFile(
                owner,
                repo,
                path,
                finalContent,
                message,
                sha
            );

            return {
                success: true,
                path,
                url: result.content.html_url,
                sha: result.content.sha
            };
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [githubService]);

    const browseFiles = useCallback(async (owner, repo, path = '') => {
        if (!githubService) {
            throw new Error('GitHub token not provided');
        }

        setLoading(true);
        setError(null);

        try {
            const files = await githubService.listRepositoryFiles(owner, repo, path);
            return files;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [githubService]);

    const getRepositoryTree = useCallback(async (owner, repo) => {
        if (!githubService) {
            throw new Error('GitHub token not provided');
        }

        setLoading(true);
        setError(null);

        try {
            const tree = await githubService.getRepositoryTree(owner, repo);
            return tree;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [githubService]);

    const deleteFile = async (owner, repo, path, sha, message = '删除文件') => {
        if (!githubService) {
            throw new Error('GitHub service not initialized');
        }
        setLoading(true);
        try {
            const result = await githubService.deleteFile(owner, repo, path, message, sha);
            return result;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteFolder = async (owner, repo, folderPath, message = '删除文件夹') => {
        if (!githubService) {
            throw new Error('GitHub service not initialized');
        }
        setLoading(true);
        try {
            // 使用优化的递归删除方法
            const result = await githubService.deleteFolderRecursive(owner, repo, folderPath, message);
            return result;
        } catch (error) {
            console.error('Error deleting folder:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    return {
        uploadCode,
        browseFiles,
        getRepositoryTree,
        deleteFile,
        deleteFolder,
        loading,
        error,
        isAuthenticated: !!githubService
    };
};