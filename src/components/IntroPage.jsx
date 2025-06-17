import React from 'react';
import '../styles/IntroPage.css';

const IntroPage = ({ onContinue }) => {
    return (
        <div className="intro-page">
            <div className="intro-container">
                <div className="intro-header">
                    <h1 className="intro-title">DevNotes</h1>
                    <p className="intro-subtitle">基于GitHub的代码笔记管理工具</p>
                </div>

                <div className="intro-content">
                    <section className="intro-section">
                        <h2>项目宗旨</h2>
                        <p>
                            DevNotes 是一个专为开发者设计的代码笔记管理工具，帮助您将代码片段、学习笔记和技术文档
                            直接保存到GitHub仓库中，实现代码知识的版本化管理和云端同步。
                        </p>
                    </section>

                    <section className="intro-section">
                        <h2>如何生成GitHub Personal Access Token</h2>
                        <div className="steps">
                            <div className="step">
                                <span className="step-number">1</span>
                                <div className="step-content">
                                    <h3>访问GitHub设置</h3>
                                    <p>登录GitHub，点击右上角头像 → Settings → Developer settings → Personal access tokens → Tokens (classic)</p>
                                </div>
                            </div>
                            <div className="step">
                                <span className="step-number">2</span>
                                <div className="step-content">
                                    <h3>生成新Token</h3>
                                    <p>点击 "Generate new token" → "Generate new token (classic)"</p>
                                </div>
                            </div>
                            <div className="step">
                                <span className="step-number">3</span>
                                <div className="step-content">
                                    <h3>配置Token权限</h3>
                                    <p>设置Token名称和过期时间，然后选择以下权限：</p>
                                    <ul className="permissions-list">
                                        <li><code>repo</code> - 完整的仓库访问权限</li>
                                        <li><code>user:email</code> - 访问用户邮箱信息</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="step">
                                <span className="step-number">4</span>
                                <div className="step-content">
                                    <h3>复制Token</h3>
                                    <p>点击 "Generate token"，立即复制生成的Token（只会显示一次）</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="intro-section">
                        <h2>所需权限说明</h2>
                        <div className="permissions">
                            <div className="permission-item">
                                <h4>repo (仓库权限)</h4>
                                <p>用于创建、读取、更新和删除仓库文件，这是核心功能所必需的权限。</p>
                            </div>
                            <div className="permission-item">
                                <h4>user:email (用户邮箱)</h4>
                                <p>用于获取用户信息，确保提交记录的完整性。</p>
                            </div>
                        </div>
                    </section>

                    <div className="intro-warning">
                        <h3>⚠️ 安全提醒</h3>
                        <p>
                            请妥善保管您的Personal Access Token，不要在公开场所分享。
                            Token具有您账户的部分权限，泄露可能导致安全风险。
                        </p>
                    </div>
                </div>

                <div className="intro-footer">
                    <button className="continue-btn" onClick={onContinue}>
                        开始使用
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IntroPage;