class GitHubService {
    constructor(token) {
        this.token = token;
        this.baseURL = 'https://api.github.com';
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Authorization': `token ${this.token}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        const response = await fetch(url, config);
        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }
        return response.json();
    }

    async getFileContent(owner, repo, path) {
        try {
            return await this.request(`/repos/${owner}/${repo}/contents/${path}`);
        } catch (error) {
            if (error.message.includes('404')) {
                return null;
            }
            throw error;
        }
    }

    async uploadFile(owner, repo, path, content, message, sha = null) {
        const encodedContent = btoa(unescape(encodeURIComponent(content)));
        const data = {
            message,
            content: encodedContent
        };

        if (sha) {
            data.sha = sha;
        }

        return await this.request(`/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async listRepositoryFiles(owner, repo, path = '') {
        return await this.request(`/repos/${owner}/${repo}/contents/${path}`);
    }

    async getRepositoryTree(owner, repo) {
        try {
            // 添加时间戳参数来破坏缓存
            const timestamp = `&_t=${Date.now()}`;
            const response = await this.request(`/repos/${owner}/${repo}/git/trees/HEAD?recursive=1${timestamp}`);
            return this.buildTreeStructure(response.tree);
        } catch (error) {
            console.error('Error fetching repository tree:', error);
            throw error;
        }
    }

    // 构建树形结构
    buildTreeStructure(items) {
        const tree = {};
        const result = [];

        // 按路径排序，确保父目录在子目录之前
        items.sort((a, b) => a.path.localeCompare(b.path));

        items.forEach(item => {
            const pathParts = item.path.split('/');
            let currentLevel = tree;

            pathParts.forEach((part, index) => {
                if (!currentLevel[part]) {
                    currentLevel[part] = {
                        name: part,
                        path: pathParts.slice(0, index + 1).join('/'),
                        type: index === pathParts.length - 1 ? item.type : 'tree',
                        children: {},
                        sha: index === pathParts.length - 1 ? item.sha : null,
                        size: index === pathParts.length - 1 ? item.size : null
                    };
                }
                currentLevel = currentLevel[part].children;
            });
        });

        // 转换为数组格式
        const convertToArray = (obj) => {
            return Object.values(obj).map(item => ({
                ...item,
                children: Object.keys(item.children).length > 0 ? convertToArray(item.children) : []
            }));
        };

        return convertToArray(tree);
    }

    async createRepository(name, description = '', isPrivate = false) {
        const url = 'https://api.github.com/user/repos';
        const data = {
            name: name,
            description: description,
            private: isPrivate,
            auto_init: true // 自动创建README
        };
        return this.request(url, 'POST', data);
    }

    async getUserRepositories(username = null) {
        const endpoint = username
            ? `/users/${username}/repos?sort=updated&per_page=100`
            : '/user/repos?sort=updated&per_page=100';
        return this.request(endpoint);
    }

    async validateToken() {
        try {
            // Make a small request to check if the token is valid
            await this.request('/user');
            return true;
        } catch (error) {
            console.error("Token validation failed:", error);
            return false;
        }
    }

    async deleteFile(owner, repo, path, message, sha) {
        const data = {
            message,
            sha
        };

        return await this.request(`/repos/${owner}/${repo}/contents/${path}`, {
            method: 'DELETE',
            body: JSON.stringify(data)
        });
    }

    async deleteFolderRecursive(owner, repo, folderPath, message) {
        try {
            // 获取文件夹内容
            const contents = await this.request(`/repos/${owner}/${repo}/contents/${folderPath}`);

            // 递归删除所有文件
            for (const item of contents) {
                if (item.type === 'file') {
                    await this.deleteFile(owner, repo, item.path, `${message} - 删除文件: ${item.name}`, item.sha);
                } else if (item.type === 'dir') {
                    await this.deleteFolderRecursive(owner, repo, item.path, message);
                }
            }

            return { success: true };
        } catch (error) {
            console.error('删除文件夹失败:', error);
            throw error;
        }
    }
}

export default GitHubService;