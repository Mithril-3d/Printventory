/**
 * Printventory i18n Localization Engine
 * Provides dynamic dictionary-based translation and auto-DOM replacement.
 */
(function () {
  'use strict';

  const STORAGE_KEY = 'printventory_lang';
  const DEFAULT_LANG = 'ja'; // デフォルトは日本語

  const I18N = {
    currentLang: DEFAULT_LANG,

    init() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && (saved === 'ja' || saved === 'en')) {
          this.currentLang = saved;
        } else {
          this.currentLang = DEFAULT_LANG;
          localStorage.setItem(STORAGE_KEY, DEFAULT_LANG);
        }
      } catch (e) {
        this.currentLang = DEFAULT_LANG;
      }

      this.applyTranslations();
      this.setupSettingsSelector();
    },

    setLanguage(lang) {
      if (lang !== 'ja' && lang !== 'en') return;
      this.currentLang = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {}

      try {
        if (window.electron && typeof window.electron.setSetting === 'function') {
          window.electron.setSetting('appLanguage', lang);
        }
      } catch (e) {}

      document.documentElement.lang = lang;
      this.applyTranslations();

      // イベント発行（UIの再描画が必要なコンポーネント向け）
      window.dispatchEvent(
        new CustomEvent('printventory:languagechange', { detail: { lang } })
      );
    },

    getLanguage() {
      return this.currentLang;
    },

    t(key, fallbackOrParams, params) {
      let fallback = '';
      let formatParams = null;

      if (typeof fallbackOrParams === 'string') {
        fallback = fallbackOrParams;
        formatParams = params || null;
      } else if (typeof fallbackOrParams === 'object' && fallbackOrParams !== null) {
        formatParams = fallbackOrParams;
      }

      const locales = window.PRINTVENTORY_LOCALES || {};
      const dict = locales[this.currentLang] || locales[DEFAULT_LANG] || {};
      let text = dict[key];

      if (text === undefined || text === null) {
        // 英語フォールバック
        const enDict = locales.en || {};
        text = enDict[key];
      }

      if (text === undefined || text === null) {
        text = fallback || key;
      }

      if (formatParams && typeof formatParams === 'object') {
        for (const [pKey, pVal] of Object.entries(formatParams)) {
          text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), pVal);
        }
      }

      return text;
    },

    applyTranslations(root) {
      const scope = root || document;

      // data-i18n : textContent
      scope.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (!key) return;
        const translated = this.t(key, el.textContent.trim());
        el.textContent = translated;
      });

      // data-i18n-html : innerHTML
      scope.querySelectorAll('[data-i18n-html]').forEach((el) => {
        const key = el.getAttribute('data-i18n-html');
        if (!key) return;
        const translated = this.t(key, el.innerHTML);
        el.innerHTML = translated;
      });

      // data-i18n-placeholder : placeholder
      scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (!key) return;
        const translated = this.t(key, el.getAttribute('placeholder') || '');
        el.setAttribute('placeholder', translated);
      });

      // data-i18n-title : title
      scope.querySelectorAll('[data-i18n-title]').forEach((el) => {
        const key = el.getAttribute('data-i18n-title');
        if (!key) return;
        const translated = this.t(key, el.getAttribute('title') || '');
        el.setAttribute('title', translated);
      });

      // data-i18n-aria : aria-label
      scope.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        const key = el.getAttribute('data-i18n-aria');
        if (!key) return;
        const translated = this.t(key, el.getAttribute('aria-label') || '');
        el.setAttribute('aria-label', translated);
      });
    },

    setupSettingsSelector() {
      const select = document.getElementById('ui-language-select');
      if (select) {
        select.value = this.currentLang;
        select.addEventListener('change', (e) => {
          this.setLanguage(e.target.value);
        });
      }
    }
  };

  // グローバル公開
  window.PrintventoryI18n = I18N;
  window.t = function (key, fallbackOrParams, params) {
    return I18N.t(key, fallbackOrParams, params);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18N.init());
  } else {
    I18N.init();
  }
})();
