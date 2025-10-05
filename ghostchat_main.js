/**
 * GhostChat - Embeddable AI Chat Widget (Premium Build)
 * Version: 1.0.0
 * License: Commercial - Requires valid license key
 * 
 * This is the full-featured version with license validation,
 * multiple AI providers, context modes, and premium themes.
 */

(function(window) {
  'use strict';

  // Configuration constants
  var TIERS = {
    FREE: 'free',
    PERSONAL: 'personal',
    AGENCY: 'agency'
  };

  var THEMES = {
    FREE: ['minimal-light', 'minimal-dark'],
    PERSONAL: ['minimal-light', 'minimal-dark', 'glassmorphism', 'terminal-console'],
    AGENCY: ['minimal-light', 'minimal-dark', 'glassmorphism', 'terminal-console', 'ghost-orb']
  };

  var PROVIDERS = {
    FREE: ['openai:gpt-3.5'],
    PERSONAL: ['openai:gpt-3.5', 'openai:gpt-4', 'anthropic:claude'],
    AGENCY: ['openai:gpt-3.5', 'openai:gpt-4', 'openai:gpt-4-turbo', 'anthropic:claude', 
             'anthropic:claude-opus', 'google:gemini', 'ollama', 'webllm']
  };

  var CONTEXT_MODES = {
    PERSONAL: ['faq', 'summarize'],
    AGENCY: ['faq', 'summarize', 'full_scrape']
  };

  // Global state
  var ghostChatState = {
    initialized: false,
    tier: TIERS.FREE,
    licenseKey: null,
    licenseValid: false,
    config: {},
    messages: [],
    contextData: null,
    widgetOpen: false,
    licenseApiUrl: 'https://your-license-server.com/api/validate-license' // Configure this
  };

  /**
   * Main initialization function
   * @param {Object} options - Configuration options
   */
  function initGhostChat(options) {
    if (ghostChatState.initialized) {
      console.warn('[GhostChat] Already initialized');
      return;
    }

    // Merge default options
    ghostChatState.config = mergeOptions({
      licenseKey: null,
      theme: 'minimal-light',
      provider: 'openai:gpt-3.5',
      apiKey: null,
      contextMode: null,
      contextUrl: null,
      position: 'bottom-right',
      primaryColor: '#4F46E5',
      welcomeMessage: 'Hi! How can I help you today?',
      placeholder: 'Type your message...',
      licenseApiUrl: null,
      buttonText: 'Chat with us',
      offlineMode: false
    }, options);

    // Override license API URL if provided
    if (ghostChatState.config.licenseApiUrl) {
      ghostChatState.licenseApiUrl = ghostChatState.config.licenseApiUrl;
    }

    // Validate license if provided
    if (ghostChatState.config.licenseKey) {
      validateLicense(ghostChatState.config.licenseKey, function(isValid, tier) {
        if (isValid) {
          ghostChatState.licenseValid = true;
          ghostChatState.tier = tier;
          console.log('[GhostChat] License validated: ' + tier + ' tier');
        } else {
          console.warn('[GhostChat] Invalid license - falling back to FREE tier');
          ghostChatState.tier = TIERS.FREE;
        }
        
        // Enforce tier restrictions
        enforceTierRestrictions();
        
        // Load context if configured
        if (ghostChatState.config.contextMode && ghostChatState.config.contextUrl) {
          loadContext(ghostChatState.config.contextMode, ghostChatState.config.contextUrl);
        }
        
        // Render the widget
        renderWidget();
        ghostChatState.initialized = true;
      });
    } else {
      // No license key - use FREE tier
      console.log('[GhostChat] No license key - using FREE tier');
      ghostChatState.tier = TIERS.FREE;
      enforceTierRestrictions();
      renderWidget();
      ghostChatState.initialized = true;
    }
  }

  /**
   * Validate license key via remote API
   * @param {string} key - License key
   * @param {Function} callback - Callback(isValid, tier)
   */
  function validateLicense(key, callback) {
    if (!key) {
      callback(false, TIERS.FREE);
      return;
    }

    // Make API call to validate license
    var xhr = new XMLHttpRequest();
    xhr.open('POST', ghostChatState.licenseApiUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var response = JSON.parse(xhr.responseText);
            if (response.valid && response.tier) {
              callback(true, response.tier);
            } else {
              callback(false, TIERS.FREE);
            }
          } catch (e) {
            console.error('[GhostChat] License validation error:', e);
            callback(false, TIERS.FREE);
          }
        } else {
          console.error('[GhostChat] License API error:', xhr.status);
          callback(false, TIERS.FREE);
        }
      }
    };

    xhr.onerror = function() {
      console.error('[GhostChat] License API connection failed');
      callback(false, TIERS.FREE);
    };

    xhr.send(JSON.stringify({ licenseKey: key }));
  }

  /**
   * Enforce tier restrictions on theme, provider, and context mode
   */
  function enforceTierRestrictions() {
    var tier = ghostChatState.tier;
    var config = ghostChatState.config;

    // Enforce theme restrictions
    var allowedThemes = THEMES[tier.toUpperCase()] || THEMES.FREE;
    if (allowedThemes.indexOf(config.theme) === -1) {
      console.warn('[GhostChat] Theme "' + config.theme + '" not allowed for ' + tier + ' tier. Using minimal-light.');
      config.theme = 'minimal-light';
    }

    // Enforce provider restrictions
    var allowedProviders = PROVIDERS[tier.toUpperCase()] || PROVIDERS.FREE;
    if (allowedProviders.indexOf(config.provider) === -1) {
      console.warn('[GhostChat] Provider "' + config.provider + '" not allowed for ' + tier + ' tier. Using openai:gpt-3.5.');
      config.provider = 'openai:gpt-3.5';
    }

    // Enforce context mode restrictions
    if (config.contextMode) {
      if (tier === TIERS.FREE) {
        console.warn('[GhostChat] Context modes not available in FREE tier');
        config.contextMode = null;
      } else {
        var allowedModes = CONTEXT_MODES[tier.toUpperCase()] || [];
        if (allowedModes.indexOf(config.contextMode) === -1) {
          console.warn('[GhostChat] Context mode "' + config.contextMode + '" not allowed for ' + tier + ' tier');
          config.contextMode = null;
        }
      }
    }
  }

  /**
   * Load contextual data based on mode
   * @param {string} mode - Context mode: faq, summarize, or full_scrape
   * @param {string} url - URL to fetch content from
   */
  function loadContext(mode, url) {
    if (!mode || !url) return;

    console.log('[GhostChat] Loading context: ' + mode + ' from ' + url);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var content = xhr.responseText;
        
        switch(mode) {
          case 'faq':
            ghostChatState.contextData = extractFAQ(content);
            break;
          case 'summarize':
            ghostChatState.contextData = extractContent(content);
            break;
          case 'full_scrape':
            fullScrape(url, content);
            break;
        }
        
        console.log('[GhostChat] Context loaded successfully');
      }
    };

    xhr.onerror = function() {
      console.error('[GhostChat] Failed to load context from ' + url);
    };

    xhr.send();
  }

  /**
   * Full scrape mode - crawl internal links (1 level deep)
   * @param {string} baseUrl - Base URL
   * @param {string} initialContent - Initial page content
   */
  function fullScrape(baseUrl, initialContent) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(initialContent, 'text/html');
    var baseDomain = new URL(baseUrl).hostname;
    
    // Extract content from initial page
    var allContent = extractContent(initialContent);
    
    // Find all internal links
    var links = doc.querySelectorAll('a[href]');
    var internalLinks = [];
    
    for (var i = 0; i < links.length; i++) {
      var href = links[i].getAttribute('href');
      try {
        var linkUrl = new URL(href, baseUrl);
        if (linkUrl.hostname === baseDomain && internalLinks.indexOf(linkUrl.href) === -1) {
          internalLinks.push(linkUrl.href);
        }
      } catch (e) {
        // Invalid URL, skip
      }
    }
    
    // Limit to first 5 links to avoid overload
    internalLinks = internalLinks.slice(0, 5);
    
    var completed = 0;
    var total = internalLinks.length;
    
    if (total === 0) {
      ghostChatState.contextData = allContent;
      return;
    }
    
    console.log('[GhostChat] Scraping ' + total + ' internal pages...');
    
    // Crawl each link
    for (var j = 0; j < internalLinks.length; j++) {
      (function(linkUrl) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', linkUrl, true);
        
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              allContent += '\n\n--- Page: ' + linkUrl + ' ---\n\n';
              allContent += extractContent(xhr.responseText);
            }
            
            completed++;
            if (completed === total) {
              ghostChatState.contextData = allContent;
              console.log('[GhostChat] Full scrape completed');
            }
          }
        };
        
        xhr.onerror = function() {
          completed++;
          if (completed === total) {
            ghostChatState.contextData = allContent;
          }
        };
        
        xhr.send();
      })(internalLinks[j]);
    }
  }

  /**
   * Extract FAQ content from HTML
   * @param {string} html - HTML content
   * @return {string} Extracted FAQ text
   */
  function extractFAQ(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var faqText = '';

    // Look for common FAQ patterns
    var headings = doc.querySelectorAll('h2, h3, h4, dt');
    for (var i = 0; i < headings.length; i++) {
      var heading = headings[i];
      var nextElement = heading.nextElementSibling;
      
      if (nextElement && (nextElement.tagName === 'P' || nextElement.tagName === 'DD')) {
        faqText += 'Q: ' + heading.textContent.trim() + '\n';
        faqText += 'A: ' + nextElement.textContent.trim() + '\n\n';
      }
    }

    return faqText || extractContent(html);
  }

  /**
   * Extract main content from HTML
   * @param {string} html - HTML content
   * @return {string} Extracted content
   */
  function extractContent(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');
    var content = '';

    // Extract headings and paragraphs
    var elements = doc.querySelectorAll('h1, h2, h3, p');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var text = el.textContent.trim();
      if (text) {
        content += text + '\n\n';
      }
    }

    return content;
  }

  /**
   * Render the chat widget UI
   */
  function renderWidget() {
    var theme = ghostChatState.config.theme;
    var position = ghostChatState.config.position;

    // Create widget container
    var container = document.createElement('div');
    container.id = 'ghostchat-widget';
    container.className = 'ghostchat-container ghostchat-' + theme + ' ghostchat-' + position;
    
    // Add styles
    injectStyles(theme);

    // Create widget HTML
    container.innerHTML = 
      '<div class="ghostchat-button" id="ghostchat-button">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
          '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>' +
        '</svg>' +
        '<span>' + ghostChatState.config.buttonText + '</span>' +
      '</div>' +
      '<div class="ghostchat-window" id="ghostchat-window" style="display: none;">' +
        '<div class="ghostchat-header">' +
          '<div class="ghostchat-header-title">Chat</div>' +
          '<button class="ghostchat-close" id="ghostchat-close">×</button>' +
        '</div>' +
        '<div class="ghostchat-messages" id="ghostchat-messages">' +
          '<div class="ghostchat-message ghostchat-message-bot">' +
            '<div class="ghostchat-message-content">' + ghostChatState.config.welcomeMessage + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="ghostchat-input-container">' +
          '<input type="text" class="ghostchat-input" id="ghostchat-input" placeholder="' + 
            ghostChatState.config.placeholder + '" />' +
          '<button class="ghostchat-send" id="ghostchat-send">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
              '<line x1="22" y1="2" x2="11" y2="13"></line>' +
              '<polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>' +
            '</svg>' +
          '</button>' +
        '</div>' +
        '<div class="ghostchat-footer">' +
          'Powered by GhostChat • ' + ghostChatState.tier.toUpperCase() + ' tier' +
        '</div>' +
      '</div>';

    document.body.appendChild(container);

    // Attach event listeners
    attachEventListeners();
  }

  /**
   * Inject CSS styles for the widget
   * @param {string} theme - Theme name
   */
  function injectStyles(theme) {
    if (document.getElementById('ghostchat-styles')) return;

    var primaryColor = ghostChatState.config.primaryColor;
    
    var css = `
      .ghostchat-container {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: fixed;
        z-index: 9999;
      }
      .ghostchat-bottom-right {
        bottom: 20px;
        right: 20px;
      }
      .ghostchat-bottom-left {
        bottom: 20px;
        left: 20px;
      }
      .ghostchat-button {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: ${primaryColor};
        color: white;
        border-radius: 25px;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .ghostchat-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      }
      .ghostchat-window {
        width: 380px;
        height: 600px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      @media (max-width: 480px) {
        .ghostchat-window {
          width: 100vw;
          height: 100vh;
          max-width: 100vw;
          max-height: 100vh;
          border-radius: 0;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        .ghostchat-button span {
          display: none;
        }
        .ghostchat-button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          padding: 0;
          justify-content: center;
        }
      }
      .ghostchat-header {
        background: ${primaryColor};
        color: white;
        padding: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .ghostchat-header-title {
        font-weight: 600;
        font-size: 16px;
      }
      .ghostchat-close {
        background: none;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        line-height: 1;
        padding: 0;
        width: 28px;
        height: 28px;
      }
      .ghostchat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .ghostchat-message {
        display: flex;
        max-width: 80%;
      }
      .ghostchat-message-bot {
        align-self: flex-start;
      }
      .ghostchat-message-user {
        align-self: flex-end;
      }
      .ghostchat-message-content {
        padding: 10px 14px;
        border-radius: 12px;
        line-height: 1.4;
        font-size: 14px;
      }
      .ghostchat-message-bot .ghostchat-message-content {
        background: #f3f4f6;
        color: #1f2937;
      }
      .ghostchat-message-user .ghostchat-message-content {
        background: ${primaryColor};
        color: white;
      }
      .ghostchat-input-container {
        display: flex;
        padding: 16px;
        border-top: 1px solid #e5e7eb;
        gap: 8px;
      }
      .ghostchat-input {
        flex: 1;
        padding: 10px 14px;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
      }
      .ghostchat-input:focus {
        border-color: ${primaryColor};
      }
      .ghostchat-send {
        padding: 10px 14px;
        background: ${primaryColor};
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .ghostchat-send:hover {
        opacity: 0.9;
      }
      .ghostchat-footer {
        padding: 12px;
        text-align: center;
        font-size: 11px;
        color: #9ca3af;
        border-top: 1px solid #e5e7eb;
      }
      .ghostchat-message-loading {
        opacity: 0.7;
      }
      .ghostchat-message-loading .ghostchat-message-content {
        display: flex;
        gap: 4px;
        padding: 14px 18px;
      }
      .ghostchat-loading-dot {
        width: 8px;
        height: 8px;
        background: #9ca3af;
        border-radius: 50%;
        animation: loadingDot 1.4s infinite ease-in-out;
      }
      .ghostchat-loading-dot:nth-child(1) {
        animation-delay: -0.32s;
      }
      .ghostchat-loading-dot:nth-child(2) {
        animation-delay: -0.16s;
      }
      @keyframes loadingDot {
        0%, 80%, 100% {
          transform: scale(0.8);
          opacity: 0.5;
        }
        40% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `;

    // Add theme-specific styles
    if (theme === 'minimal-dark') {
      css += `
        .ghostchat-minimal-dark .ghostchat-window {
          background: #1f2937;
        }
        .ghostchat-minimal-dark .ghostchat-message-bot .ghostchat-message-content {
          background: #374151;
          color: #f9fafb;
        }
        .ghostchat-minimal-dark .ghostchat-input {
          background: #374151;
          border-color: #4b5563;
          color: white;
        }
        .ghostchat-minimal-dark .ghostchat-input-container {
          border-top-color: #374151;
        }
        .ghostchat-minimal-dark .ghostchat-footer {
          border-top-color: #374151;
          color: #6b7280;
        }
      `;
    }

    if (theme === 'glassmorphism') {
      css += `
        .ghostchat-glassmorphism .ghostchat-window {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .ghostchat-glassmorphism .ghostchat-header {
          background: rgba(79, 70, 229, 0.8);
          backdrop-filter: blur(10px);
        }
        .ghostchat-glassmorphism .ghostchat-message-bot .ghostchat-message-content {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(5px);
        }
        .ghostchat-glassmorphism .ghostchat-input-container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }
        .ghostchat-glassmorphism .ghostchat-input {
          background: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.3);
        }
      `;
    }

    if (theme === 'terminal-console') {
      css += `
        .ghostchat-terminal-console .ghostchat-window {
          background: #000;
          font-family: 'Courier New', monospace;
        }
        .ghostchat-terminal-console .ghostchat-header {
          background: #0f0;
          color: #000;
        }
        .ghostchat-terminal-console .ghostchat-message-bot .ghostchat-message-content {
          background: transparent;
          color: #0f0;
          border: 1px solid #0f0;
        }
        .ghostchat-terminal-console .ghostchat-message-user .ghostchat-message-content {
          background: transparent;
          color: #0ff;
          border: 1px solid #0ff;
        }
        .ghostchat-terminal-console .ghostchat-input {
          background: #000;
          border-color: #0f0;
          color: #0f0;
        }
        .ghostchat-terminal-console .ghostchat-input-container {
          border-top-color: #0f0;
        }
        .ghostchat-terminal-console .ghostchat-footer {
          border-top-color: #0f0;
          color: #0f0;
        }
      `;
    }

    if (theme === 'ghost-orb') {
      css += `
        .ghostchat-ghost-orb .ghostchat-button {
          border-radius: 50%;
          width: 60px;
          height: 60px;
          padding: 0;
          justify-content: center;
          background: linear-gradient(135deg, ${primaryColor}, #8b5cf6);
          animation: ghostOrb 3s ease-in-out infinite;
        }
        .ghostchat-ghost-orb .ghostchat-button span {
          display: none;
        }
        @keyframes ghostOrb {
          0%, 100% { transform: translateY(0); box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
          50% { transform: translateY(-10px); box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
        }
      `;
    }

    var styleEl = document.createElement('style');
    styleEl.id = 'ghostchat-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
  }

  /**
   * Attach event listeners to UI elements
   */
  function attachEventListeners() {
    var button = document.getElementById('ghostchat-button');
    var closeBtn = document.getElementById('ghostchat-close');
    var sendBtn = document.getElementById('ghostchat-send');
    var input = document.getElementById('ghostchat-input');
    var chatWindow = document.getElementById('ghostchat-window');

    button.addEventListener('click', function() {
      toggleWidget();
    });

    closeBtn.addEventListener('click', function() {
      toggleWidget();
    });

    sendBtn.addEventListener('click', function() {
      sendMessage();
    });

    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }

  /**
   * Toggle widget open/close
   */
  function toggleWidget() {
    var chatWindow = document.getElementById('ghostchat-window');
    var button = document.getElementById('ghostchat-button');
    
    ghostChatState.widgetOpen = !ghostChatState.widgetOpen;
    
    if (ghostChatState.widgetOpen) {
      chatWindow.style.display = 'flex';
      button.style.display = 'none';
    } else {
      chatWindow.style.display = 'none';
      button.style.display = 'flex';
    }
  }

  /**
   * Send a message from the user
   */
  function sendMessage() {
    var input = document.getElementById('ghostchat-input');
    var message = input.value.trim();
    
    if (!message) return;

    // Add user message to UI
    addMessage(message, 'user');
    input.value = '';

    // Send to AI
    sendMessageToAI(message);
  }

  /**
   * Add a message to the chat UI
   * @param {string} content - Message content
   * @param {string} sender - 'user' or 'bot'
   */
  function addMessage(content, sender) {
    var messagesContainer = document.getElementById('ghostchat-messages');
    var messageDiv = document.createElement('div');
    messageDiv.className = 'ghostchat-message ghostchat-message-' + sender;
    
    var contentDiv = document.createElement('div');
    contentDiv.className = 'ghostchat-message-content';
    contentDiv.textContent = content;
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Store in state
    ghostChatState.messages.push({
      role: sender === 'user' ? 'user' : 'assistant',
      content: content
    });
  }

  /**
   * Send message to AI provider
   * @param {string} message - User message
   */
  function sendMessageToAI(message) {
    var provider = ghostChatState.config.provider;
    var apiKey = ghostChatState.config.apiKey;

    if (!apiKey) {
      // Offline mode - provide canned responses or email capture
      handleOfflineMode(message);
      return;
    }

    // Add loading indicator
    addLoadingMessage();

    // Build system context
    var systemContext = '';
    if (ghostChatState.contextData) {
      systemContext = 'Context information:\n\n' + ghostChatState.contextData + '\n\n';
    }

    // Call appropriate provider
    if (provider.startsWith('openai:')) {
      callOpenAI(message, systemContext, apiKey);
    } else if (provider.startsWith('anthropic:')) {
      callAnthropic(message, systemContext, apiKey);
    } else if (provider.startsWith('google:')) {
      callGemini(message, systemContext, apiKey);
    } else {
      removeLoadingMessage();
      addMessage('Provider not yet implemented: ' + provider, 'bot');
    }
  }

  /**
   * Handle offline mode when no API key is provided
   * @param {string} message - User message
   */
  function handleOfflineMode(message) {
    var lowerMessage = message.toLowerCase();
    var response = '';

    // Simple keyword-based canned responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response = 'Hello! I\'m currently in offline mode. Please provide an API key to enable AI responses.';
    } else if (lowerMessage.includes('help')) {
      response = 'I\'d love to help! However, I need an API key to provide intelligent responses. Please configure your OpenAI API key.';
    } else if (lowerMessage.includes('email') || lowerMessage.includes('contact')) {
      response = 'Thank you for your interest! To get in touch with us, please email support@example.com or visit our contact page.';
    } else if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      response = 'For pricing information, please visit our pricing page or contact our sales team.';
    } else {
      response = 'Thank you for your message. I\'m currently in offline mode and cannot provide AI-powered responses. Please configure an API key or leave your email and we\'ll get back to you.';
    }

    setTimeout(function() {
      addMessage(response, 'bot');
    }, 500);
  }

  /**
   * Add loading message indicator
   */
  function addLoadingMessage() {
    var messagesContainer = document.getElementById('ghostchat-messages');
    var messageDiv = document.createElement('div');
    messageDiv.className = 'ghostchat-message ghostchat-message-bot ghostchat-message-loading';
    messageDiv.id = 'ghostchat-loading';
    
    var contentDiv = document.createElement('div');
    contentDiv.className = 'ghostchat-message-content';
    contentDiv.innerHTML = 
      '<span class="ghostchat-loading-dot"></span>' +
      '<span class="ghostchat-loading-dot"></span>' +
      '<span class="ghostchat-loading-dot"></span>';
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Remove loading message indicator
   */
  function removeLoadingMessage() {
    var loadingEl = document.getElementById('ghostchat-loading');
    if (loadingEl) {
      loadingEl.parentNode.removeChild(loadingEl);
    }
  }

 /**
 * Call OpenRouter API (replacing OpenAI logic)
 */
function callOpenAI(message, systemContext, apiKey) {
  var model = ghostChatState.config.provider.split(':')[1] || 'deepseek/deepseek-chat';

  var messages = [
    { role: 'system', content: systemContext + 'You are a helpful assistant.' }
  ].concat(ghostChatState.messages.slice(0, -1)).concat([
    { role: 'user', content: message }
  ]);

  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://openrouter.ai/api/v1/chat/completions', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', 'Bearer ' + apiKey);
  xhr.setRequestHeader('HTTP-Referer', window.location.origin); // Required by OpenRouter
  xhr.setRequestHeader('X-Title', 'GhostChat Widget');

  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4) {
      removeLoadingMessage();
      
      if (xhr.status === 200) {
        try {
          var response = JSON.parse(xhr.responseText);
          var reply = response.choices[0].message.content;
          addMessage(reply, 'bot');
        } catch (e) {
          addMessage('I apologize, but I encountered an error processing the response. Please try again.', 'bot');
          console.error('[GhostChat] Parse error:', e);
        }
      } else if (xhr.status === 401) {
        addMessage('Invalid OpenRouter API key.', 'bot');
      } else if (xhr.status === 429) {
        addMessage('Rate limit exceeded. Try again later.', 'bot');
      } else {
        addMessage('Error processing your request.', 'bot');
        console.error('[GhostChat] API error:', xhr.status, xhr.responseText);
      }
    }
  };

  xhr.onerror = function() {
    removeLoadingMessage();
    addMessage('Unable to connect to the AI service. Please check your internet connection.', 'bot');
  };

  xhr.send(JSON.stringify({
    model: model,
    messages: messages,
    temperature: 0.7,
    max_tokens: 500
  }));
}

  /**
   * Call Anthropic API
   */
  function callAnthropic(message, systemContext, apiKey) {
    var model = ghostChatState.config.provider.split(':')[1] || 'claude-3-sonnet-20240229';
    
    var messages = ghostChatState.messages.slice(0, -1).concat([
      { role: 'user', content: message }
    ]);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.anthropic.com/v1/messages', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('x-api-key', apiKey);
    xhr.setRequestHeader('anthropic-version', '2023-06-01');

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        removeLoadingMessage();
        
        if (xhr.status === 200) {
          try {
            var response = JSON.parse(xhr.responseText);
            var reply = response.content[0].text;
            addMessage(reply, 'bot');
          } catch (e) {
            addMessage('I apologize, but I encountered an error processing the response. Please try again.', 'bot');
            console.error('[GhostChat] Parse error:', e);
          }
        } else if (xhr.status === 401) {
          addMessage('Sorry, there seems to be an authentication issue. Please check your API key configuration.', 'bot');
          console.error('[GhostChat] API authentication failed');
        } else if (xhr.status === 429) {
          addMessage('I\'m receiving too many requests right now. Please wait a moment and try again.', 'bot');
          console.error('[GhostChat] Rate limit exceeded');
        } else {
          addMessage('I\'m having trouble connecting right now. Please try again later.', 'bot');
          console.error('[GhostChat] API error:', xhr.status, xhr.responseText);
        }
      }
    };

    xhr.onerror = function() {
      removeLoadingMessage();
      addMessage('Unable to connect to the AI service. Please check your internet connection.', 'bot');
      console.error('[GhostChat] Network error');
    };

    xhr.send(JSON.stringify({
      model: model,
      messages: messages,
      system: systemContext + 'You are a helpful assistant.',
      max_tokens: 1024
    }));
  }

  /**
   * Call Google Gemini API
   */
  function callGemini(message, systemContext, apiKey) {
    removeLoadingMessage();
    addMessage('Gemini provider coming soon', 'bot');
  }

  /**
   * Merge default options with user options
   */
  function mergeOptions(defaults, options) {
    var result = {};
    for (var key in defaults) {
      result[key] = defaults[key];
    }
    for (var key in options) {
      result[key] = options[key];
    }
    return result;
  }

  // Expose global function
  window.initGhostChat = initGhostChat;

})(window);
