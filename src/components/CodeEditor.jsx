import React from 'react';

const CodeEditor = ({ value, onChange }) => {
    return (
        <div className="code-editor-modern">
            <div className="editor-header">
                <label htmlFor="code-textarea" className="editor-label">
                    <span className="label-icon">📝</span>
                    内容
                </label>
                <div className="editor-info">
                    <span className="char-count">{value.length} 字符</span>
                </div>
            </div>
            <div className="editor-container">
                <textarea
                    id="code-textarea"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="在此输入您要上传的内容..."
                    className="code-textarea-modern"
                    rows={15}
                    spellCheck={false}
                />
            </div>
        </div>
    );
};

export default CodeEditor;