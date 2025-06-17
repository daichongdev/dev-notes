# DevNotes

<div align="center">

![DevNotes Logo](https://github.com/daichongdev/dev-notes/raw/main/public/128.png)

**基于GitHub的代码笔记管理工具**

</div>

## 📝 项目介绍

DevNotes 是一个专为开发者设计的代码笔记管理工具，帮助您将代码片段、学习笔记和技术文档直接保存到GitHub仓库中，实现代码知识的版本化管理和云端同步。

作为一个Chrome扩展，DevNotes让您可以随时随地记录和管理您的编程灵感、代码片段和技术笔记，所有内容都会安全地存储在您自己的GitHub仓库中。

## ✨ 主要功能

- **代码笔记管理**：轻松创建、编辑和组织您的代码笔记
- **GitHub集成**：直接将笔记保存到您的GitHub仓库
- **多语言支持**：支持JavaScript、TypeScript、Python、Java、C++、C、Go、Rust等多种编程语言
- **文件浏览器**：浏览和管理您GitHub仓库中的文件和目录
- **版本控制**：利用GitHub的版本控制功能追踪笔记的变更历史
- **云端同步**：在不同设备间同步您的笔记内容
- **简洁界面**：现代化的用户界面，提供流畅的使用体验

## 🚀 安装与使用

### 安装扩展

1. 下载本仓库代码
2. 运行 `npm install` 安装依赖
3. 运行 `npm run build` 构建扩展
4. 在Chrome浏览器中打开 `chrome://extensions/`
5. 开启「开发者模式」
6. 点击「加载已解压的扩展程序」，选择项目的 `dist` 目录

### 配置GitHub

1. 生成GitHub Personal Access Token
   - 访问GitHub设置：点击右上角头像 → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 点击 "Generate new token" → "Generate new token (classic)"
   - 设置Token名称和过期时间，选择以下权限：
     - `repo` - 完整的仓库访问权限
     - `user:email` - 访问用户邮箱信息
   - 点击「Generate token」并保存生成的token

2. 在DevNotes中配置GitHub账户
   - 点击Chrome工具栏中的DevNotes图标
   - 输入您的GitHub用户名和刚才生成的Personal Access Token
   - 选择或创建一个用于存储笔记的仓库

### 使用方法

1. 点击Chrome工具栏中的DevNotes图标打开扩展
2. 创建新笔记：选择编程语言，输入文件名和代码内容
3. 浏览笔记：使用文件浏览器查看和管理已有笔记
4. 编辑笔记：点击文件进行查看和编辑
5. 保存笔记：编辑完成后点击保存，内容将上传至GitHub仓库

## 🛠️ 技术栈

- **前端框架**：React
- **构建工具**：Webpack
- **API集成**：GitHub API
- **存储**：Chrome Storage API
- **样式**：CSS

## 🔧 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build