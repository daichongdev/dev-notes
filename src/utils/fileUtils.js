export const encodeContent = (content) => {
    return btoa(unescape(encodeURIComponent(content)));
};

export const decodeContent = (encodedContent) => {
    try {
        return decodeURIComponent(escape(atob(encodedContent)));
    } catch (error) {
        console.error('Error decoding content:', error);
        return encodedContent;
    }
};

export const getFileExtension = (filename) => {
    return filename.substring(filename.lastIndexOf('.'));
};

export const isValidFilename = (filename) => {
    const invalidChars = /[<>:"/\\|?*]/;
    return filename && !invalidChars.test(filename);
};