import { useState, useEffect } from 'react';

export const useStorage = (key, defaultValue) => {
    const [value, setValue] = useState(defaultValue);

    useEffect(() => {
        // Load from Chrome storage on mount
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.get([key], (result) => {
                if (result[key] !== undefined) {
                    setValue(result[key]);
                }
            });
        } else {
            // Fallback to localStorage for development
            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    setValue(JSON.parse(stored));
                } catch (e) {
                    console.error('Error parsing stored value:', e);
                }
            }
        }
    }, [key]);

    const updateValue = (newValue) => {
        setValue(newValue);
        
        // Save to Chrome storage
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.local.set({ [key]: newValue });
        } else {
            // Fallback to localStorage for development
            localStorage.setItem(key, JSON.stringify(newValue));
        }
    };

    return [value, updateValue];
};

// 添加多仓库管理的 hook
export const useRepositories = () => {
  const [repositories, setRepositories] = useStorage('github-repositories', []);
  const [currentRepo, setCurrentRepo] = useStorage('current-repository', null);

  const addRepository = (config) => {
    const newRepo = {
      id: Date.now().toString(),
      name: `${config.owner}/${config.repo}`,
      ...config,
      addedAt: new Date().toISOString()
    };
    setRepositories(prev => [...prev, newRepo]);
    return newRepo;
  };

  const removeRepository = (id) => {
    setRepositories(prev => prev.filter(repo => repo.id !== id));
    if (currentRepo?.id === id) {
      setCurrentRepo(null);
    }
  };

  const selectRepository = (repo) => {
    setCurrentRepo(repo);
  };

  return {
    repositories,
    currentRepo,
    addRepository,
    removeRepository,
    selectRepository
  };
};

// 添加仓库列表管理
export const useRepositoryList = () => {
  const [repositories, setRepositories] = useStorage('github-repositories', []);

  const addRepository = (config) => {
    const repoKey = `${config.owner}/${config.repo}`;
    const exists = repositories.find(repo => `${repo.owner}/${repo.repo}` === repoKey);
    
    if (!exists) {
      const newRepo = {
        id: Date.now().toString(),
        owner: config.owner,
        repo: config.repo,
        token: config.token,
        name: repoKey,
        addedAt: new Date().toISOString()
      };
      setRepositories(prev => [...prev, newRepo]);
      return newRepo;
    }
    return exists;
  };

  const removeRepository = (id) => {
    setRepositories(prev => prev.filter(repo => repo.id !== id));
  };

  const updateRepository = (id, updates) => {
    setRepositories(prev => prev.map(repo => 
      repo.id === id ? { ...repo, ...updates } : repo
    ));
  };

  return {
    repositories,
    addRepository,
    removeRepository,
    updateRepository
  };
};