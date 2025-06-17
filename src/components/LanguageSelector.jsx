import React from 'react';
import { SUPPORTED_LANGUAGES } from '../utils/constants';

const LanguageSelector = ({ value, onChange }) => {
    return (
        <div className="form-group">
            <label>编程语言</label>
            <select 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="modern-input"
            >
                {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.value} value={lang.value}>
                        {lang.icon} {lang.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSelector;