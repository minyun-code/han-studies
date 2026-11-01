module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Noto Sans JP", "var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        serif: ["Noto Serif JP", "serif"], // 日本明朝体
        hanserif: ["WenYue GuDian MingChao", "serif"], // 复古宋体
        kaishu: ["Ma Shan Zheng", "cursive"], // 毛笔书法风格
        aoyagireisyo: ["AoyagiReisyo", "sans-serif"],
        kouzangyousho: ["KouzanGyousho", "sans-serif"],
      },
      colors: {
        "jiangnan-blue": "#4a7a8c",   // 江南水乡青
        "cinnabar-red": "#d64f44",    // 朱砂红
        "ink-black": "#333333",       // 墨色
        "silk-gold": "#c2a562",       // 绢金色
      },
      
      keyframes : {
        enhancedFloat: {
          '0%': { transform: 'translateY(0) rotate(0deg) scale(1)', opacity: '0.8' },
          '30%': { transform: 'translateY(-50px) rotate(90deg) scale(0.8)', opacity: '0.6' },
          '60%': { transform: 'translateY(-100px) rotate(180deg) scale(0.6)', opacity: '0.4' },
          '100%': { transform: 'translateY(-160px) rotate(360deg) scale(0.3)', opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': {
            filter: 'blur(4px) brightness(1)',
            transform: 'scale(1)',
          },
          '50%': {
            filter: 'blur(6px) brightness(1.8)',
            transform: 'scale(1.4)',
          },
        },
        trailMove :{
          from: {
            transform: 'translateX(-100%)',
          },
          to: {
            transform: 'translateX(200%)',
          },  
          
        },
        lightSweep: {
          '0%': {
            transform: 'translateX(-100%) skewX(-15deg)',
          },
          '100%': {
            transform: 'translateX(200%) skewX(-15deg)',
          },
        },
        particleFlow: {
          '0%': {
            transform: 'translate(0, 0)',
            opacity: '0',
          },
          '20%': {
            opacity: '0.6',
          },
          '80%': {
            opacity: '0.4',
          },
          '100%': {
            transform: 'translate(var(--translate-x), var(--translate-y))',
            opacity: '0',
          },
        },
        lightPulse: {
          '0%': { opacity: '0.5', transform: 'scale(0.95)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
          '100%': { opacity: '0.5', transform: 'scale(0.95)' },
        },

        iconBounce: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
          '100%': { transform: 'translateY(0)' },
        },
        
        shine: {
          '0%': {
            transform: 'skewX(-30deg) translateX(-150%)',
          },
          '100%': {
            transform: 'skewX(-30deg) translateX(300%)',
          },
        },

      },
      
      animation: {
        trailMove: 'trailMove 3s linear infinite',
        shine: 'shine 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

