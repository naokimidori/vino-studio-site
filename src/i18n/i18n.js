/**
 * i18n 国际化核心引擎
 * 负责语言切换、文本替换、localStorage 持久化
 */
import zh from './zh.js';
import en from './en.js';
import ja from './ja.js';

/* 支持的语言列表 */
const languages = { zh, en, ja };
const langMeta = [
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

const STORAGE_KEY = 'vino-lang';
let currentLang = 'zh';

/**
 * 获取当前语言代码
 */
export function getCurrentLang() {
    return currentLang;
}

/**
 * 获取支持的语言列表
 */
export function getLangMeta() {
    return langMeta;
}

/**
 * 翻译函数：根据 key 获取当前语言的文本
 */
export function t(key) {
    return languages[currentLang]?.[key] ?? languages.zh[key] ?? key;
}

/**
 * 设置并应用语言
 */
export function setLanguage(lang) {
    if (!languages[lang]) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    applyTranslations();
    updateLangSwitcherUI();
}

/**
 * 初始化 i18n 系统
 * 读取 localStorage 或浏览器语言偏好，并应用翻译
 */
export function initI18n() {
    // 优先从 localStorage 读取
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && languages[saved]) {
        currentLang = saved;
    } else {
        // 尝试检测浏览器语言
        const browserLang = navigator.language?.toLowerCase() || '';
        if (browserLang.startsWith('ja')) {
            currentLang = 'ja';
        } else if (browserLang.startsWith('en')) {
            currentLang = 'en';
        } else {
            currentLang = 'zh';
        }
    }

    applyTranslations();
    initLangSwitcher();
}

/**
 * 应用所有翻译到 DOM
 */
function applyTranslations() {
    // 更新 html lang 属性
    document.documentElement.lang = languages[currentLang].lang;

    // 更新 SEO 标签
    document.title = t('meta.title');
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = t('meta.description');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = t('meta.ogTitle');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = t('meta.ogDescription');

    // 替换带有 data-i18n 属性的文本内容
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        const translated = t(key);
        // 如果元素有子元素（如 svg），只替换文本节点
        if (el.childElementCount > 0) {
            // 查找第一个文本节点或 span
            const textSpan = el.querySelector('.i18n-text');
            if (textSpan) {
                textSpan.textContent = translated;
            } else {
                // 替换直接文本节点
                for (const node of el.childNodes) {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                        node.textContent = translated;
                        break;
                    }
                }
            }
        } else {
            el.textContent = translated;
        }
    });

    // 替换 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
    });

    // 替换 aria-label
    document.querySelectorAll('[data-i18n-label]').forEach((el) => {
        el.setAttribute('aria-label', t(el.getAttribute('data-i18n-label')));
    });
}

/**
 * 初始化语言切换器
 */
function initLangSwitcher() {
    const switcher = document.getElementById('langSwitcher');
    if (!switcher) return;

    const btn = switcher.querySelector('.lang-switcher__btn');
    const dropdown = switcher.querySelector('.lang-switcher__dropdown');

    // 点击按钮切换下拉
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        switcher.classList.toggle('open');
    });

    // 点击语言选项
    dropdown.querySelectorAll('.lang-option').forEach((option) => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const lang = option.getAttribute('data-lang');
            setLanguage(lang);
            switcher.classList.remove('open');
        });
    });

    // 点击页面其他区域关闭下拉
    document.addEventListener('click', () => {
        switcher.classList.remove('open');
    });

    // 初始化 UI 状态
    updateLangSwitcherUI();
}

/**
 * 更新语言切换器的 UI 显示
 */
function updateLangSwitcherUI() {
    const switcher = document.getElementById('langSwitcher');
    if (!switcher) return;

    const btnLabel = switcher.querySelector('.lang-switcher__current');
    const meta = langMeta.find((m) => m.code === currentLang);
    if (btnLabel && meta) {
        btnLabel.textContent = `${meta.flag} ${meta.label}`;
    }

    // 高亮当前语言
    switcher.querySelectorAll('.lang-option').forEach((option) => {
        option.classList.toggle('active', option.getAttribute('data-lang') === currentLang);
    });
}
