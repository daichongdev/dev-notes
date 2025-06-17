import { SUPPORTED_LANGUAGES } from './constants';

export const generatePath = (language, filename) => {
    const langConfig = SUPPORTED_LANGUAGES.find(lang => lang.value === language);
    
    if (!langConfig) {
        return filename;
    }

    const folder = langConfig.folder;
    const extension = langConfig.extension;
    
    // Add extension if not present
    let finalFilename = filename;
    if (!filename.includes('.')) {
        finalFilename = `${filename}${extension}`;
    }
    
    // Combine folder and filename
    return folder ? `${folder}/${finalFilename}` : finalFilename;
};

export const getLanguageConfig = (language) => {
    return SUPPORTED_LANGUAGES.find(lang => lang.value === language);
};