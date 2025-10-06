# GhostChat Configuration Guide

## 🎯 **Basic Configuration Options**

### **Core Settings**
```javascript
initGhostChat({
    // REQUIRED: Your GhostChat license key
    licenseKey: 'pers-xxxx-xxxx-xxxx-xxxx',
    
    // REQUIRED: Your AI provider API key
    apiKey: 'sk-your-openai-key-here',
    
    // AI Provider & Model (default: 'openai:gpt-3.5-turbo')
    provider: 'openai:gpt-4',
    
    // Theme (default: 'minimal-light')
    theme: 'glassmorphism',
    
    // Widget position (default: 'bottom-right')
    position: 'bottom-right', // 'bottom-left', 'top-right', 'top-left'
    
    // Primary brand color (hex code)
    primaryColor: '#8B5CF6',
    
    // Welcome message
    welcomeMessage: 'Hi! How can I help you today? 🚀',
    
    // Input placeholder text
    placeholder: 'Type your message...',
    
    // Button text
    buttonText: 'Chat with us',
    
    // Enable/disable offline mode
    offlineMode: false
});
```

## 🌐 **Context Modes Configuration**

### **1. FAQ Mode**
Extracts questions and answers from your website content.

```javascript
initGhostChat({
    // ... basic config
    contextMode: 'faq',
    contextUrl: 'https://yoursite.com/faq.html'
});
```

**How it works:**
- Scans for heading patterns (`h2`, `h3`, `h4`, `dt`)
- Looks for question-answer pairs
- Creates structured FAQ data for the AI

**Example extracted context:**
```
Q: What is your return policy?
A: We offer 30-day returns for all products in original condition.

Q: Do you ship internationally?
A: Yes, we ship to over 50 countries worldwide.

Q: How long does shipping take?
A: Standard shipping takes 5-7 business days, express 2-3 days.
```

### **2. Summarize Mode**
Extracts main content from pages for general context.

```javascript
initGhostChat({
    // ... basic config
    contextMode: 'summarize',
    contextUrl: 'https://yoursite.com/about.html'
});
```

**How it works:**
- Extracts headings (`h1-h6`) and paragraphs (`p`)
- Removes navigation, footers, scripts
- Creates clean content summary

**Example extracted context:**
```
## About Our Company ##

We are a leading tech company founded in 2020 specializing in AI solutions. 
Our mission is to make artificial intelligence accessible to everyone.

## Our Team ##

We have over 50 employees across 3 countries with expertise in machine learning...

## Our Values ##

Innovation, transparency, and customer success drive everything we do...
```

### **3. Full Scrape Mode**
Crawls multiple pages for comprehensive understanding.

```javascript
initGhostChat({
    // ... basic config
    contextMode: 'full_scrape',
    contextUrl: 'https://yoursite.com'
});
```

**How it works:**
1. Scrapes the main page content
2. Finds all internal links (same domain)
3. Crawls up to 5 additional pages
4. Combines all content into comprehensive context

**Example workflow:**
```
Scraping: https://yoursite.com
Found 8 internal links...
Scraping: https://yoursite.com/services
Scraping: https://yoursite.com/pricing  
Scraping: https://yoursite.com/contact
Scraping: https://yoursite.com/blog
Scraping: https://yoursite.com/testimonials

Combined context: 15,243 characters
```

**Example extracted structure:**
```
--- Page: https://yoursite.com ---

## Welcome to Our Site ##
We provide the best AI solutions for businesses...

## Our Services ##
Custom AI development, consulting, and support...

--- Page: https://yoursite.com/services ---

## Custom Development ##
We build custom AI models tailored to your needs...

## Consulting Services ##
Our experts help you implement AI strategies...

--- Page: https://yoursite.com/pricing ---

## Basic Plan - $99/month ##
Includes 10,000 AI requests, basic support...

## Pro Plan - $299/month ##
Includes 50,000 AI requests, priority support...
```

## 🤖 **AI Provider Configurations**

### **OpenAI Providers**
```javascript
// GPT-3.5 Turbo (Fast, cost-effective)
provider: 'openai:gpt-3.5-turbo'

// GPT-4 (More capable, better reasoning)
provider: 'openai:gpt-4'

// GPT-4 Turbo (Latest, larger context)
provider: 'openai:gpt-4-turbo-preview'
```

### **Anthropic Providers**
```javascript
// Claude-3-Haiku (Fastest, cost-effective)
provider: 'anthropic:claude-3-haiku'

// Claude-3-Sonnet (Balanced speed & capability)
provider: 'anthropic:claude-3-sonnet'

// Claude-3-Opus (Most capable, best reasoning)
provider: 'anthropic:claude-3-opus'
```

### **Google Providers**
```javascript
// Gemini Pro (Google's advanced model)
provider: 'google:gemini-pro'
```

## 🎨 **Theme Configurations**

### **Available Themes**
```javascript
// Free Themes
theme: 'minimal-light'    // Clean light theme
theme: 'minimal-dark'     // Dark theme

// Premium Themes
theme: 'glassmorphism'    // Modern glass effect
theme: 'terminal-console' // Retro terminal style
theme: 'ghost-orb'        // Animated floating orb
```



## ⚙️ **Advanced Configuration**

### **Custom API Endpoints**
```javascript
initGhostChat({
    // ... basic config
    
    // Custom scraping API endpoint
    scrapingApiUrl: 'https://your-api.com/scrape'
});
```

### **Performance Optimization**
```javascript
initGhostChat({
    // ... basic config
    
    // Limit conversation history (default: 10 messages)
    maxHistory: 15,
    
    // Enable/disable typing indicators
    showTyping: true,
    
    // Auto-focus input when opened
    autoFocus: true
});
```

## 🔧 **Web Scraping Commands & API**

### **Custom Scraping Implementation**
If you want to run your own scraping:

```javascript
// Example scraping function
async function scrapeWebsite(url) {
    const response = await fetch('https://your-scraping-api.com/scrape', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ url: url })
    });
    
    const data = await response.json();
    return data.content;
}

// Use with GhostChat
initGhostChat({
    contextMode: 'full_scrape',
    contextUrl: 'https://yoursite.com',
    scrapingApiUrl: 'https://your-scraping-api.com/scrape'
});
```

## 📱 **Mobile Configuration**

### **Responsive Settings**
```javascript
initGhostChat({
    // ... basic config
    
    // Mobile-specific settings
    mobile: {
        fullScreen: true,      // Use full screen on mobile
        hideButtonText: true,  // Hide text, show icon only
        position: 'bottom-right'
    }
});
```

## 🎯 **Real-World Configuration Examples**

### **E-commerce Store**
```javascript
initGhostChat({
    licenseKey: 'pers-xxxx-xxxx-xxxx-xxxx',
    apiKey: 'sk-your-openai-key',
    provider: 'openai:gpt-4',
    theme: 'minimal-light',
    primaryColor: '#10B981',
    contextMode: 'faq',
    contextUrl: '/faq.html',
    welcomeMessage: 'Hi! I can help with products, shipping, and returns. What do you need?',
    placeholder: 'Ask about products, sizes, shipping...',
    buttonText: 'Store Help'
});
```

### **SaaS Company**
```javascript
initGhostChat({
    licenseKey: 'agcy-xxxx-xxxx-xxxx-xxxx',
    apiKey: 'your-anthropic-key',
    provider: 'anthropic:claude-3-sonnet',
    theme: 'glassmorphism',
    primaryColor: '#3B82F6',
    contextMode: 'full_scrape',
    contextUrl: 'https://your-saas.com',
    welcomeMessage: 'Hello! I can help with features, pricing, and setup. How can I assist?',
    placeholder: 'Ask about features, pricing, support...',
    buttonText: 'Get Help'
});
```

### **Agency Client Project**
```javascript
initGhostChat({
    licenseKey: 'agcy-xxxx-xxxx-xxxx-xxxx', // Same agency key for all clients
    apiKey: 'client-openai-key',
    provider: 'openai:gpt-4',
    theme: 'ghost-orb',
    primaryColor: '#8B5CF6',
    contextMode: 'summarize',
    contextUrl: 'https://client-website.com',
    welcomeMessage: 'Welcome to Client Name! How can I help you today?',
    placeholder: 'Ask me anything about our services...',
    buttonText: 'Chat with AI'
});
```

### **Blog/Content Site**
```javascript
initGhostChat({
    licenseKey: 'pers-xxxx-xxxx-xxxx-xxxx',
    apiKey: 'sk-your-openai-key',
    provider: 'openai:gpt-3.5-turbo',
    theme: 'minimal-dark',
    primaryColor: '#6B7280',
    contextMode: 'summarize',
    contextUrl: '/blog.html',
    welcomeMessage: 'Hi! I can help you find articles and answer questions. What are you looking for?',
    placeholder: 'Search articles or ask questions...',
    buttonText: 'Search Blog'
});
```

## 🔒 **Security Configuration**

### **Domain Restriction** (Premium Feature)
```javascript
initGhostChat({
    // ... basic config
    allowedDomains: ['yourdomain.com', 'sub.yourdomain.com']
});
```

### **Content Security**
```javascript
// Add to your website's CSP header
Content-Security-Policy: 
  "script-src 'self' https://yourdomain.com https://api.openai.com https://api.anthropic.com;"
```

## 📊 **Analytics & Tracking**

### **Event Tracking**
```javascript
// Listen to GhostChat events
document.addEventListener('ghostchat:message_sent', (e) => {
    console.log('Message sent:', e.detail);
    // Track with Google Analytics, etc.
});

document.addEventListener('ghostchat:widget_opened', (e) => {
    console.log('Widget opened');
    // Track engagement
});
```

## 🚨 **Error Handling & Debugging**

### **Debug Mode**
```javascript
// Add to see console logs
localStorage.setItem('ghostchat_debug', 'true');
```

### **Common Error Scenarios**
```javascript
// Invalid license key
initGhostChat({
    licenseKey: 'invalid-key', // → Falls back to free tier
    apiKey: 'valid-key'
});

// No API key
initGhostChat({
    licenseKey: 'valid-key',
    apiKey: null // → Offline mode with canned responses
});

// Invalid context URL
initGhostChat({
    contextMode: 'faq',
    contextUrl: 'file:///invalid-path' // → CORS error, context disabled
});
```

VISIT SITE: https://ghostchat.ct.ws
