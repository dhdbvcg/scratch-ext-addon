/**
 * AI Assistant - Main Chat Component
 * 扩展编辑AI 风格的 AI 聊天面板，集成到 ExtensionBuilder
 * 
 * 功能：
 * - 左侧边栏：会话列表 + 新建对话
 * - 主区域：聊天消息（支持 Markdown + 工具调用展示）
 * - 底部：输入框 + 思考/选择积木/添加文件 按钮 + 发送
 * - 顶部：返回、标题、模型选择器、导出会话、设置按钮
 * - 设置弹窗：Agent 管理（名称/提供商/URL/API Key/模型列表）
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// 动态导入 store / provider / tools（避免循环依赖）
let Store = null, Provider = null, Tools = null;
try {
    Store = require('./store');
    Provider = require('./provider');
    Tools = require('./tools');
} catch (e) {
    console.warn('AI Assistant: 模块加载失败', e);
}

// ─── 图标 SVG ───
const ICONS = {
    send: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
    settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    back: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>,
    plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    export: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    bot: <svg width="32" height="32" viewBox="0 0 48 48" fill="none"><rect x="8" y="8" width="32" height="32" rx="10" fill="#E3F2FD" stroke="#1E88E5" strokeWidth="2"/><circle cx="18" cy="20" r="3" fill="#1E88E5"/><circle cx="30" cy="20" r="3" fill="#1E88E5"/><path d="M16 29c3 4 13 4 16 0" stroke="#1E88E5" strokeWidth="2.5" strokeLinecap="round"/></svg>,
    check: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,
    spinner: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07l-2.83 2.83M9.76 14.24l-2.83 2.83m11.31 0l-2.83-2.83M9.76 9.76L6.93 6.93"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>,
    thinking: <svg width="14" height="14" viewBox="0 0 24 24" fill="#6366f1"><circle cx="12" cy="12" r="10" opacity="0.2"/><path d="M12 2a10 10 0 1010 10" stroke="#6366f1" strokeWidth="2" fill="none" strokeLinecap="round"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>,
};

// ─── 简易 Markdown 渲染 ───
function renderMarkdown(text) {
    if (!text) return [];
    const lines = text.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeContent = '';
    let codeLang = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // 代码块
        if (line.startsWith('```')) {
            if (!inCodeBlock) {
                inCodeBlock = true;
                codeLang = line.slice(3).trim();
                codeContent = '';
            } else {
                elements.push({ type: 'code', lang: codeLang, content: codeContent });
                inCodeBlock = false;
            }
            continue;
        }
        if (inCodeBlock) {
            codeContent += line + '\n';
            continue;
        }
        // 标题
        if (line.startsWith('### ')) { elements.push({ type: 'h3', text: line.slice(4) }); continue; }
        if (line.startsWith('## ')) { elements.push({ type: 'h2', text: line.slice(3) }); continue; }
        if (line.startsWith('# ')) { elements.push({ type: 'h1', text: line.slice(2) }); continue; }
        // 列表
        if (line.match(/^\s*[-*]\s+/)) { elements.push({ type: 'li', text: line.replace(/^\s*[-*]\s+/, '') }); continue; }
        if (line.match(/^\s*\d+\.\s+/)) { elements.push({ type: 'li', text: line.replace(/^\s*\d+\.\s+/, '') }); continue; }
        // 空行
        if (line.trim() === '') { elements.push({ type: 'spacer' }); continue; }
        // 普通段落
        elements.push({ type: 'p', text: line });
    }
    if (inCodeBlock) {
        elements.push({ type: 'code', lang: codeLang, content: codeContent });
    }
    return elements;
}

// ─── 主组件 ───
export default function AIAssistant({
    workspaceRef,
    javascriptGenerator,
    customBlocks,
    customBlocksRef,
    visible,
    onClose,
}) {
    // 兼容两种传入方式：直接数组 或 { current: [...] } 引用
    const customBlocksValue = customBlocks ||
        (customBlocksRef && customBlocksRef.current) || [];
    // ── 状态 ──
    const [sessions, setSessions] = useState(() => Store ? Store.getSessions() : []);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [agents, setAgents] = useState(() => Store ? Store.getAgents() : []);
    const [currentModelId, setCurrentModelIdState] = useState(() => Store ? Store.getCurrentModelId() : '');
    const [settings, setSettingsState] = useState(() => Store ? Store.getSettings() : {});
    const [toolCalls, setToolCalls] = useState([]); // 当前正在展示的工具调用
    const [todos, setTodos] = useState([]);

    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // 滚动到底部
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, toolCalls]);

    // 聚焦输入框
    useEffect(() => {
        if (visible && inputRef.current) {
            inputRef.current.focus();
        }
    }, [visible]);

    // ── 会话操作 ──
    const handleNewChat = useCallback(() => {
        if (!Store) return;
        const session = Store.createSession('新对话');
        setSessions(Store.getSessions());
        setCurrentSessionId(session.id);
        setMessages([]);
        setToolCalls([]);
        setTodos([]);
    }, []);

    const handleSelectSession = useCallback((sessionId) => {
        if (!Store) return;
        setCurrentSessionId(sessionId);
        const session = Store.getSession(sessionId);
        setMessages(session ? session.messages : []);
        setToolCalls([]);
    }, []);

    const handleDeleteSession = useCallback((e, sessionId) => {
        e.stopPropagation();
        if (!Store) return;
        Store.deleteSession(sessionId);
        setSessions(Store.getSessions());
        if (sessionId === currentSessionId) {
            const remaining = Store.getSessions();
            if (remaining.length > 0) {
                handleSelectSession(remaining[0].id);
            } else {
                handleNewChat();
            }
        }
    }, [currentSessionId, handleNewChat, handleSelectSession]);

    // ── 发送消息 ──
    const handleSend = useCallback(async () => {
        const text = inputText.trim();
        if (!text || isLoading || !Store || !Provider || !Tools) return;

        // 创建或获取会话
        let sid = currentSessionId;
        if (!sid) {
            const session = Store.createSession(text.slice(0, 40));
            sid = session.id;
            setSessions(Store.getSessions());
            setCurrentSessionId(sid);
        }

        // 添加用户消息
        const userMsg = { id: 'msg-' + Date.now(), role: 'user', content: text };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInputText('');
        setIsLoading(true);

        try {
            // 构建发送给 AI 的消息
            const apiMessages = [
                { role: 'system', content: settings.systemPrompt || '你是 Scratch 扩展构建器的 AI 助手。' },
                ...newMessages.map(m => ({ role: m.role, content: m.content })),
            ];

            // 获取当前 Agent
            const agent = Store.getCurrentAgent();

            // 获取工具定义
            const toolSchemas = Tools.getToolSchemas();

            // 工具执行上下文
            const ctx = {
                workspace: workspaceRef?.current,
                javascriptGenerator: javascriptGenerator,
                customBlocks: customBlocksValue,
            };

            // 流式调用
            let assistantContent = '';
            const collectedToolCalls = [];

            const result = await Provider.sendChatCompletion({
                agent,
                messages: apiMessages,
                tools: toolSchemas,
                stream: true,
                onTextDelta: (delta) => {
                    assistantContent += delta;
                    setMessages([...newMessages, {
                        id: 'msg-ai-' + Date.now(),
                        role: 'assistant',
                        content: assistantContent,
                        toolCalls: collectedToolCalls.length > 0 ? [...collectedToolCalls] : undefined,
                    }]);
                },
                onToolCallsDelta: (tcs) => {
                    collectedToolCalls.push(...tcs);
                    // 展示工具调用
                    setToolCalls(tcs.map(tc => ({
                        id: tc.id,
                        name: tc.function.name,
                        args: tc.function.arguments,
                        status: 'running',
                        result: null,
                    })));

                    // 执行工具
                    (async () => {
                        for (const tc of tcs) {
                            try {
                                let argsObj = {};
                                try { argsObj = JSON.parse(tc.function.arguments); } catch (e) { argsObj = {}; }
                                const toolResult = await Tools.executeTool(tc.function.name, argsObj, ctx);
                                // 更新工具调用状态
                                setToolCalls(prev => prev.map(t =>
                                    t.id === tc.id ? { ...t, status: 'completed', result: JSON.stringify(toolResult).slice(0, 500) } : t
                                ));
                                // 把工具结果作为消息追加
                                const toolMsg = {
                                    id: 'msg-tool-' + tc.id,
                                    role: 'tool',
                                    name: tc.function.name,
                                    content: JSON.stringify(toolResult),
                                    toolCallId: tc.id,
                                };
                                setMessages(prev => [...prev, toolMsg]);
                            } catch (e) {
                                setToolCalls(prev => prev.map(t =>
                                    t.id === tc.id ? { ...t, status: 'error', result: e.message } : t
                                ));
                            }
                        }
                    })();
                },
            });

            // 最终更新
            setMessages(prev => {
                const updated = [...prev];
                // 更新/添加最后的 assistant 消息
                const lastAiIdx = updated.findLastIndex(m => m.role === 'assistant');
                if (lastAiIdx >= 0) {
                    updated[lastAiIdx] = {
                        ...updated[lastAiIdx],
                        content: result.content || assistantContent,
                        toolCalls: collectedToolCalls.length > 0 ? collectedToolCalls : undefined,
                    };
                } else if (result.content || assistantContent) {
                    updated.push({
                        id: 'msg-ai-final-' + Date.now(),
                        role: 'assistant',
                        content: result.content || assistantContent,
                    });
                }
                return updated;
            });

            // 保存会话
            const finalMessages = [...newMessages];
            if (result.content || assistantContent) {
                finalMessages.push({ role: 'assistant', content: result.content || assistantContent });
            }
            Store.updateSessionMessages(sid, finalMessages);

        } catch (e) {
            setMessages(prev => [...prev, {
                id: 'msg-err-' + Date.now(),
                role: 'assistant',
                content: '',
                error: e.message,
            }]);
        } finally {
            setIsLoading(false);
        }
    }, [inputText, isLoading, messages, currentSessionId, workspaceRef, javascriptGenerator, customBlocksValue, settings.systemPrompt]);

    // ── 键盘事件 ──
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }, [handleSend]);

    // ── 设置相关 ──
    const handleSaveAgent = useCallback((agentData) => {
        if (!Store) return;
        const existing = agents.find(a => a.id === agentData.id);
        if (existing) {
            Store.updateAgent(agentData.id, agentData);
        } else {
            Store.addAgent(agentData);
        }
        setAgents(Store.getAgents());
    }, [agents]);

    const handleDeleteAgentCallback = useCallback((agentId) => {
        if (!Store) return;
        Store.deleteAgent(agentId);
        setAgents(Store.getAgents());
        const models = Store.getAllFlattenedModels();
        if (models.length > 0) {
            setCurrentModelIdState(models[0].id);
            Store.setCurrentModelId(models[0].id);
        }
    }, []);

    const handleSwitchModel = useCallback((modelId) => {
        setCurrentModelIdState(modelId);
        if (Store) Store.setCurrentModelId(modelId);
    }, []);

    // ── 导出会话 ──
    const handleExportSession = useCallback(() => {
        if (!currentSessionId || messages.length === 0) return;
        const text = messages.map(m => {
            const prefix = m.role === 'user' ? '👤 ' : m.role === 'assistant' ? '🤖 ' : '🔧 ';
            return prefix + m.content + (m.error ? '\n❌ ' + m.error : '');
        }).join('\n\n---\n\n');
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-chat-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }, [currentSessionId, messages]);

    // ── 渲染 ──
    if (!visible) return null;

    const allModels = Store ? Store.getAllFlattenedModels() : [];

    return (
        <div className="ext-ai-panel" style={{
            position: 'absolute',
            top: '0', left: '0', right: '0', bottom: '0',
            background: '#f0f2f5',
            display: 'flex',
            zIndex: '1000',
            fontSize: '13',
            color: '#333',
        }}>
            {/* ── 左侧边栏 ── */}
            <div style={{ width: '220', background: '#e8eaed', borderRight: '1px solid #dadce0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
                {/* 头部 */}
                <div style={{ padding: '14px 14px 10px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {ICONS.bot}
                    <span style={{ fontWeight: '600', fontSize: 14 }}>扩展编辑AI</span>
                </div>
                <div style={{ padding: '0 14px 10px', fontSize: '11', color: '#666' }}>项目会话</div>

                {/* 新对话 */}
                <button onClick={handleNewChat} style={{
                    margin: '0 10px 8px', padding: '7px 12px',
                    border: '1px solid #dadce0', borderRadius: '6',
                    background: '#fff', cursor: 'pointer',
                    fontSize: '13', color: '#333', display: 'flex', alignItems: 'center', gap: '6',
                }}>
                    {ICONS.plus}<span>新对话</span>
                </button>

                {/* 最近 */}
                <div style={{ padding: '0 10px', fontSize: '11', color: '#888', marginBottom: 4 }}>最近</div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 6px' }}>
                    {sessions.length === 0 && (
                        <div style={{ padding: '16px 10px', color: '#999', fontSize: '12', textAlign: 'center' }}>
                            还没有会话，开始一个新的提问吧。
                        </div>
                    )}
                    {sessions.map(s => (
                        <div key={s.id}
                            onClick={() => handleSelectSession(s.id)}
                            style={{
                                padding: '8px 10px', margin: '2px 0', borderRadius: '6',
                                cursor: 'pointer', fontSize: '12',
                                background: s.id === currentSessionId ? '#d3e3fd' : 'transparent',
                                color: s.id === currentSessionId ? '#1a73e8' : '#444',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}
                        >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{s.title}</span>
                            <span onClick={(e) => handleDeleteSession(e, s.id)} style={{
                                cursor: 'pointer', color: '#999', fontSize: '14', lineHeight: '1',
                            }} title="删除">×</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── 主区域 ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* 顶栏 */}
                <div style={{
                    height: '48', background: '#fff', borderBottom: '1px solid #dadce0',
                    display: 'flex', alignItems: 'center', padding: '0 14px', gap: '10',
                    flexShrink: '0',
                }}>
                    <button onClick={onClose} title="关闭" style={{
                        border: 'none', background: 'none', cursor: 'pointer',
                        color: '#5f6368', padding: '4', borderRadius: '4', display: 'flex',
                    }}>{ICONS.back}</button>
                    <span style={{ fontWeight: '600', fontSize: '14', flex: 1 }}>扩展编辑AI</span>

                    {/* 模型选择 */}
                    <select value={currentModelId} onChange={e => handleSwitchModel(e.target.value)} style={{
                        padding: '4px 8px', borderRadius: '6', border: '1px solid #dadce0',
                        background: '#fff', fontSize: '12', color: '#333', maxWidth: '160',
                        cursor: 'pointer',
                    }}>
                        {allModels.map(m => (
                            <option key={m.id} value={m.id}>{m.displayName} ({m.agentName})</option>
                        ))}
                    </select>

                    <button onClick={handleExportSession} title="导出会话" style={{
                        border: '1px solid #dadce0', background: '#fff', borderRadius: '6',
                        padding: '5px 10px', cursor: 'pointer', fontSize: '12', color: '#333',
                        display: 'flex', alignItems: 'center', gap: '4',
                    }}>{ICONS.export}<span>导出会话</span></button>
                    <button onClick={() => setShowSettings(true)} title="设置" style={{
                        border: '1px solid #dadce0', background: '#fff', borderRadius: '6',
                        padding: '5px 10px', cursor: 'pointer', fontSize: '12', color: '#333',
                    }}>设置</button>
                </div>

                {/* 聊天区 */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {messages.length === 0 && (
                        /* 欢迎卡片 */
                        <div style={{
                            maxWidth: '480', margin: '40px auto', background: '#fff',
                            borderRadius: '12', padding: '28px 24px', border: '1px solid #e8eaed',
                        }}>
                            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12', background: '#e8f0fe', color: '#1a73e8', fontSize: '12', marginBottom: '12' }}>
                                扩展编辑AI
                            </div>
                            <div style={{ fontSize: '18', fontWeight: '700', color: '#202124', marginBottom: 8 }}>
                                把问题、需求或代码片段<br/>直接发进来
                            </div>
                            <div style={{ fontSize: '13', color: '#5f6368', lineHeight: 1.6 }}>
                                可以让它解释积木逻辑、整理上下文、分析附件，<br/>
                                或者直接帮助你修改当前工作区内容。
                            </div>
                        </div>
                    )}

                    {/* 消息列表 */}
                    {messages.map(msg => (
                        <div key={msg.id} style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                        }}>
                            {msg.error ? (
                                <div style={{ background: '#fce8e6', color: '#d93025', padding: '10px 14px', borderRadius: '12', fontSize: 12 }}>
                                    ❌ {msg.error}
                                </div>
                            ) : msg.role === 'user' ? (
                                <div style={{ background: '#1a73e8', color: '#fff', padding: '10px 14px', borderRadius: '12', fontSize: '13', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {msg.content}
                                </div>
                            ) : msg.role === 'tool' ? (
                                <div style={{ background: '#f8f9fa', border: '1px solid #e8eaed', borderRadius: '8', padding: '8px 12px', fontSize: 11 }}>
                                    <div style={{ fontWeight: '600', color: '#1a73e8', marginBottom: 4 }}>🔧 {msg.name}</div>
                                    <pre style={{ margin: '0', whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#444', maxHeight: '120', overflow: 'auto' }}>{msg.content}</pre>
                                </div>
                            ) : (
                                /* Assistant message */
                                <div className="ext-ai-msg-bubble">
                                    {renderMarkdown(msg.content).map((block, i) => {
                                        const _s = {
                                            h1: { margin: '12px 0 4px', fontSize: '16px', fontWeight: '700' },
                                            h2: { margin: '10px 0 4px', fontSize: '14px', fontWeight: '600' },
                                            h3: { margin: '8px 0 4px', fontSize: '13px', fontWeight: '600' },
                                            li: { paddingLeft: '16px', margin: '2px 0', fontSize: '13px', lineHeight: '1.6' },
                                            code: { background: '#f5f5f5', borderRadius: '6px', padding: '10px 12px', margin: '8px 0', fontSize: '12px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-all' },
                                            p: { margin: '4px 0', fontSize: '13px', lineHeight: '1.7', whiteSpace: 'pre-wrap' },
                                            spacer: { height: '6px' },
                                        };
                                        return (
                                        <div key={i}>
                                            {block.type === 'h1' && <h3 style={_s.h1}>{block.text}</h3>}
                                            {block.type === 'h2' && <h4 style={_s.h2}>{block.text}</h4>}
                                            {block.type === 'h3' && <h5 style={_s.h3}>{block.text}</h5>}
                                            {block.type === 'li' && <div style={_s.li}>• {block.text}</div>}
                                            {block.type === 'code' && <pre style={_s.code}><code>{block.content}</code></pre>}
                                            {block.type === 'p' && <p style={_s.p}>{block.text}</p>}
                                            {block.type === 'spacer' && <div style={_s.spacer} />}
                                        </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* 工具调用展示 */}
                    {toolCalls.map(tc => (
                        <div key={tc.id} style={{
                            background: '#fff', border: '1px solid #e8eaed', borderRadius: '10',
                            padding: '10px 14px', maxWidth: '80%', alignSelf: 'flex-start',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6', marginBottom: 6 }}>
                                {tc.status === 'running' ? ICONS.thinking :
                                 tc.status === 'completed' ? ICONS.check :
                                 <span style={{ color: '#ef4444' }}>✕</span>}
                                <span style={{ fontWeight: '600', fontSize: '12', color: '#333' }}>
                                    {tc.status === 'running' ? '执行完成' : tc.status === 'completed' ? '已完成' : '失败'}
                                </span>
                                <span style={{ fontSize: '11', color: '#888' }}>
                                    {tc.name} · {tc.status === 'running' ? '1 次工具调用' : '1 完成'}
                                </span>
                                <span style={{ marginLeft: 'auto', color: '#10b981', fontSize: '11', fontWeight: 500 }}>
                                    {tc.status === 'completed' ? '完成' : ''}
                                </span>
                            </div>
                            {tc.result && (
                                <pre style={{ margin: '0', fontSize: '11', color: '#555', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '100', overflow: 'auto', background: '#f8f9fa', padding: '6px 8px', borderRadius: 4 }}>
                                    {tc.result}
                                </pre>
                            )}
                        </div>
                    ))}

                    {/* 加载中指示器 */}
                    {isLoading && !toolCalls.some(t => t.status === 'running') && (
                        <div style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8', color: '#5f6368', fontSize: 12 }}>
                            {ICONS.spinner}<span>正在思考...</span>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* 输入区 */}
                <div style={{
                    padding: '12px 16px', background: '#fff', borderTop: '1px solid #dadce0',
                    flexShrink: '0',
                }}>
                    <div style={{
                        display: 'flex', gap: '8', alignItems: 'flex-end',
                        border: '1px solid #dadce0', borderRadius: '12',
                        padding: '8px 12px', background: '#fafafa',
                    }}>
                        <textarea
                            ref={inputRef}
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="输入消息、修改需求或粘贴上下文...(Enter 发送，Shift+Enter 换行)"
                            rows={1}
                            style={{
                                flex: 1, border: 'none', outline: 'none', resize: 'none',
                                background: 'transparent', fontSize: '13', fontFamily: 'inherit',
                                minHeight: '22', maxHeight: '120', lineHeight: '1.5',
                            }}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!inputText.trim() || isLoading}
                            style={{
                                width: '34', height: '34', borderRadius: '50%',
                                border: 'none', background: inputText.trim() ? '#1a73e8' : '#c5d8f7',
                                color: '#fff', cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: '0', transition: 'background .2s',
                            }}
                        >
                            {ICONS.send}
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '6', marginTop: 8 }}>
                        <button style={{ padding: '4px 10px', border: '1px solid #dadce0', borderRadius: '14', background: '#fff', fontSize: '11', color: '#5f6368', cursor: 'pointer' }}>思考</button>
                        <button style={{ padding: '4px 10px', border: '1px solid #dadce0', borderRadius: '14', background: '#fff', fontSize: '11', color: '#5f6368', cursor: 'pointer' }}>选择积木</button>
                        <button style={{ padding: '4px 10px', border: '1px solid #dadce0', borderRadius: '14', background: '#fff', fontSize: '11', color: '#5f6368', cursor: 'pointer' }}>添加文件</button>
                    </div>
                </div>
            </div>

            {/* ── 设置弹窗 ── */}
            {showSettings && <AISettingsModal
                agents={agents}
                currentModelId={currentModelId}
                settings={settings}
                onSaveAgent={handleSaveAgent}
                onDeleteAgent={handleDeleteAgentCallback}
                onSwitchModel={handleSwitchModel}
                onUpdateSettings={(s) => { setSettingsState(s); if (Store) Store.saveSettings(s); }}
                onClose={() => setShowSettings(false)}
            />}
        </div>
    );
}

// ─── 设置弹窗组件 ───
function AISettingsModal({ agents, currentModelId, settings, onSaveAgent, onDeleteAgent, onSwitchModel, onUpdateSettings, onClose }) {
    const [activeTab, setActiveTab] = useState('model'); // model | about
    const [editingAgent, setEditingAgent] = useState(null);
    const [newAgent, setNewAgent] = useState({
        name: '', provider: 'openai', baseUrl: 'https://api.openai.com/v1',
        apiKey: '', models: [],
    });
    const [newModelName, setNewModelName] = useState('');
    const [newModelId, setNewModelId] = useState('');

    const providerOptions = Store ? Store.PROVIDER_OPTIONS : [];

    const handleProviderChange = (provider) => {
        const found = providerOptions.find(p => p.value === provider);
        setNewAgent(prev => ({
            ...prev,
            provider,
            baseUrl: found ? found.defaultUrl : '',
        }));
    };

    const handleAddModel = () => {
        if (!newModelName || !newModelId) return;
        setNewAgent(prev => ({
            ...prev,
            models: [...(prev.models || []), {
                id: 'model-' + Date.now(),
                name: newModelName,
                modelId: newModelId,
            }],
        }));
        setNewModelName('');
        setNewModelId('');
    };

    const handleSaveNewAgent = () => {
        if (!newAgent.name || !newAgent.baseUrl) return;
        onSaveAgent(newAgent);
        setNewAgent({ name: '', provider: 'openai', baseUrl: 'https://api.openai.com/v1', apiKey: '', models: [] });
    };

    const allModels = Store ? Store.getAllFlattenedModels() : [];

    return (
        <div onClick={onClose} style={{
            position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
            background: 'rgba(0,0,0,.35)', zIndex: '10001', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
        }}>
            <div onClick={e => e.stopPropagation()} style={{
                width: '620', maxHeight: '80vh', background: '#fff',
                borderRadius: '12', boxShadow: '0 8px 40px rgba(0,0,0,.2)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}>
                {/* 头部 */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8eaed', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: '600', fontSize: 15 }}>扩展编辑AI 设置</span>
                    <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18', color: '#999' }}>×</button>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* 左侧标签 */}
                    <div style={{ width: '140', borderRight: '1px solid #e8eaed', padding: '8px 0' }}>
                        <button onClick={() => setActiveTab('model')} style={{
                            width: '100%', padding: '10px 16px', textAlign: 'left', border: 'none',
                            background: activeTab === 'model' ? '#e8f0fe' : 'transparent',
                            color: activeTab === 'model' ? '#1a73e8' : '#333',
                            cursor: 'pointer', fontSize: '13', display: 'flex', alignItems: 'center', gap: '8',
                        }}>
                            🤖 模型
                        </button>
                        <button onClick={() => setActiveTab('about')} style={{
                            width: '100%', padding: '10px 16px', textAlign: 'left', border: 'none',
                            background: activeTab === 'about' ? '#e8f0fe' : 'transparent',
                            color: activeTab === 'about' ? '#1a73e8' : '#333',
                            cursor: 'pointer', fontSize: '13', display: 'flex', alignItems: 'center', gap: '8',
                        }}>
                            ℹ️ 关于
                        </button>
                    </div>

                    {/* 右侧内容 */}
                    <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
                        {activeTab === 'model' && (
                            <>
                                {/* 添加 Agent */}
                                <div style={{ marginBottom: '24' }}>
                                    <div style={{ fontWeight: '600', fontSize: '14', marginBottom: 8 }}>添加 Agent</div>
                                    <div style={{ fontSize: '12', color: '#666', marginBottom: '12' }}>一个 Agent 可以包含多个模型，顶部模型选择栏会展开显示这些模型。</div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12', marginBottom: '12' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12', color: '#5f6368', marginBottom: 4 }}>名称</label>
                                            <input value={newAgent.name} onChange={e => setNewAgent(p => ({ ...p, name: e.target.value }))} placeholder="例如 我的 OpenAI"
                                                style={{ width: '100%', padding: '7px 10px', border: '1px solid #dadce0', borderRadius: '6', fontSize: '13', boxSizing: 'border-box' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '12', color: '#5f6368', marginBottom: 4 }}>供应商</label>
                                            <select value={newAgent.provider} onChange={e => handleProviderChange(e.target.value)}
                                                style={{ width: '100%', padding: '7px 10px', border: '1px solid #dadce0', borderRadius: '6', fontSize: '13', boxSizing: 'border-box' }}>
                                                {providerOptions.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '12' }}>
                                        <label style={{ display: 'block', fontSize: '12', color: '#5f6368', marginBottom: 4 }}>Base URL</label>
                                        <input value={newAgent.baseUrl} onChange={e => setNewAgent(p => ({ ...p, baseUrl: e.target.value }))} placeholder="https://api.openai.com/v1"
                                            style={{ width: '100%', padding: '7px 10px', border: '1px solid #dadce0', borderRadius: '6', fontSize: '13', boxSizing: 'border-box' }} />
                                    </div>

                                    <div style={{ marginBottom: '12' }}>
                                        <label style={{ display: 'block', fontSize: '12', color: '#5f6368', marginBottom: 4 }}>API Key</label>
                                        <input type="password" value={newAgent.apiKey} onChange={e => setNewAgent(p => ({ ...p, apiKey: e.target.value }))} placeholder="sk-..."
                                            style={{ width: '100%', padding: '7px 10px', border: '1px solid #dadce0', borderRadius: '6', fontSize: '13', boxSizing: 'border-box' }} />
                                    </div>

                                    {/* 模型列表 */}
                                    <div style={{ marginBottom: '12' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                            <label style={{ fontSize: '12', color: '#5f6368', fontWeight: 600 }}>模型列表</label>
                                            <button onClick={handleAddModel} style={{ padding: '4px 10px', border: '1px solid #dadce0', borderRadius: '6', background: '#fff', fontSize: '11', cursor: 'pointer' }}>添加模型</button>
                                        </div>
                                        <div style={{ fontSize: '11', color: '#666', marginBottom: 8 }}>配置 API Key 后会自动通过 API 获取模型列表；也可以继续手动输入自定义模型 ID。</div>
                                        
                                        {(newAgent.models || []).map(m => (
                                            <div key={m.id} style={{ display: 'flex', gap: '8', marginBottom: '6', alignItems: 'center' }}>
                                                <input value={m.name} readOnly style={{ flex: 1, padding: '5px 8px', border: '1px solid #dadce0', borderRadius: '4', fontSize: '12', background: '#f8f9fa' }} />
                                                <input value={m.modelId} readOnly style={{ flex: 1, padding: '5px 8px', border: '1px solid #dadce0', borderRadius: '4', fontSize: '12', background: '#f8f9fa' }} />
                                                <button onClick={() => setNewAgent(p => ({ ...p, models: p.models.filter(x => x.id !== m.id) }))} style={{ padding: '4px 8px', border: '1px solid #dadce0', borderRadius: '4', background: '#fff', fontSize: '11', cursor: 'pointer', color: '#d93025' }}>删除</button>
                                            </div>
                                        ))}

                                        {/* 新模型输入 */}
                                        <div style={{ display: 'flex', gap: '8', marginTop: 8 }}>
                                            <input value={newModelName} onChange={e => setNewModelName(e.target.value)} placeholder="模型 ID 输入框支持从已获取列表选择..."
                                                style={{ flex: 1, padding: '5px 8px', border: '1px solid #dadce0', borderRadius: '4', fontSize: '12', boxSizing: 'border-box' }} />
                                            <input value={newModelId} onChange={e => setNewModelId(e.target.value)} placeholder="gpt-4o"
                                                style={{ flex: 1, padding: '5px 8px', border: '1px solid #dadce0', borderRadius: '4', fontSize: '12', boxSizing: 'border-box' }} />
                                            <span style={{ fontSize: '11', color: '#888', alignSelf: 'center', whiteSpace: 'nowrap' }}>Max Tokens</span>
                                        </div>
                                        <div style={{ fontSize: '11', color: '#666', marginTop: 4 }}>配置只保存在本地储存中。</div>
                                    </div>

                                    <button onClick={handleSaveNewAgent} style={{
                                        padding: '7px 16px', background: '#1a73e8', color: '#fff',
                                        border: 'none', borderRadius: '6', cursor: 'pointer', fontSize: '13', fontWeight: '500',
                                    }}>创建 Agent</button>
                                </div>

                                {/* 已配置 Agent 列表 */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12' }}>
                                        <div>
                                            <div style={{ fontWeight: '600', fontSize: 14 }}>已配置 Agent</div>
                                            <div style={{ fontSize: '11', color: '#666', marginTop: 2 }}>至少需要一个 Agent。删除后新模型会自动出现在模型的列表中。</div>
                                        </div>
                                    </div>

                                    {agents.map(agent => (
                                        <div key={agent.id} style={{
                                            border: '1px solid #e8eaed', borderRadius: '8', padding: '12px', marginBottom: '10',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                <div>
                                                    <div style={{ fontWeight: '600', fontSize: 13 }}>{agent.name}</div>
                                                    <div style={{ fontSize: '11', color: '#666', marginTop: 2 }}>{agent.provider} · {agent.baseUrl || '(未设置)'}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button onClick={() => { setEditingAgent(agent); setNewAgent(agent); }} style={{ padding: '3px 8px', border: '1px solid #dadce0', borderRadius: '4', background: '#fff', fontSize: '11', cursor: 'pointer' }}>编辑</button>
                                                    <button onClick={() => onDeleteAgent(agent.id)} style={{ padding: '3px 8px', border: '1px solid #dadce0', borderRadius: '4', background: '#fff', fontSize: '11', cursor: 'pointer', color: '#d93025' }}>删除</button>
                                                </div>
                                            </div>
                                            {(agent.models || []).map(m => (
                                                <div key={m.id} style={{ fontSize: '11', color: '#444', marginTop: '4', paddingLeft: 8 }}>• {m.name} ({m.modelId})</div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {activeTab === 'about' && (
                            <div>
                                <div style={{ fontWeight: '600', fontSize: '14', marginBottom: 8 }}>关于 扩展编辑AI（原 Gandi 插件 AI Assistant）</div>
                                <div style={{ fontSize: '12', color: '#666', marginBottom: '16' }}>插件作者、授权协议与源码仓库信息。</div>

                                <div style={{ marginBottom: '16' }}>
                                    <div style={{ fontSize: '12', fontWeight: '600', marginBottom: 6 }}>作者</div>
                                    <div style={{ display: 'flex', gap: '6', flexWrap: 'wrap' }}>
                                        {['白猫@CCW', '酷可@CCW', 'PPN-design', 'RyaninCn11'].map(name => (
                                            <span key={name} style={{ padding: '4px 10px', border: '1px solid #dadce0', borderRadius: '6', fontSize: 12 }}>{name}</span>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16' }}>
                                    <div style={{ fontSize: '12', fontWeight: '600', marginBottom: 6 }}>开源协议</div>
                                    <div style={{ fontSize: '12', color: '#333' }}>GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)</div>
                                </div>

                                <div>
                                    <div style={{ fontSize: '12', fontWeight: '600', marginBottom: 6 }}>开源地址</div>
                                    <a href="https://github.com/little-starts/gandi-plugins" target="_blank" rel="noopener noreferrer" style={{
                                        display: 'inline-flex', alignItems: 'center', gap: '4',
                                        padding: '6px 14px', border: '1px solid #dadce0', borderRadius: '6',
                                        fontSize: '12', color: '#1a73e8', textDecoration: 'none',
                                    }}>GitHub 仓库</a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
