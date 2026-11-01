"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { getAllSearchableItems } from '../constants/pathMap';

interface SearchItem {
  id: string;
  label: string;
  path: string;
}

export default function SearchBox() {
  const { language, t } = useLanguage();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // 获取所有可搜索项
  const searchableItems = getAllSearchableItems(language);

  // 处理输入变化，更新搜索建议
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim().length > 0) {
      // 匹配所有包含查询词的项目（忽略大小写）
      const filteredItems = searchableItems.filter(item => 
        item.label.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredItems.slice(0, 7)); // 最多显示7个建议
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    
    setSelectedIndex(-1);
  };

  // 处理键盘导航
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions) {
      // 向下箭头
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } 
      // 向上箭头
      else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
      } 
      // 回车选择
      else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSuggestionClick(suggestions[selectedIndex]);
      }
      // ESC关闭下拉菜单
      else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  // 点击建议项导航到相应页面
  const handleSuggestionClick = (item: SearchItem) => {
    router.push(item.path);
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  // 搜索表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 如果有选中的建议，直接使用
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      handleSuggestionClick(suggestions[selectedIndex]);
      return;
    }
    
    // 没有选中建议但有匹配项，使用第一个匹配的建议
    if (suggestions.length > 0) {
      handleSuggestionClick(suggestions[0]);
      return;
    }

    // 如果没有建议但输入了查询，跳转到搜索页
    if (query.trim()) {
      router.push(`/search?keyword=${encodeURIComponent(query.trim())}`);
      setQuery('');
      setShowSuggestions(false);
    }
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex-1 max-w-xl">
      <motion.form
        onSubmit={handleSubmit}
        className="relative"
        whileHover={{ scale: 1.02 }}
      >
        <input
          ref={inputRef}
          type="text"
          className="w-full pl-6 pr-12 py-3 rounded-full bg-gradient-to-r from-white/5 to-white/3
                    text-black placeholder-gray-400 focus:outline-none focus:ring-2
                    focus:ring-purple-400/50 backdrop-blur-lg shadow-xl"
          placeholder={t("検索キーワードを入力...")}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setSuggestions.length > 0 && setShowSuggestions(true)}
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full
                    bg-gradient-to-br from-blue-400 to-purple-400 hover:shadow-[0_0_12px_2px_rgba(104,117,245,0.3)]
                    transition-all"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
        </button>
      </motion.form>

      {/* 下拉联想菜单 */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            className="absolute left-0 right-0 mt-2 bg-gray-900 bg-opacity-95 backdrop-blur-lg 
                      shadow-lg rounded-lg overflow-hidden z-50 border border-gray-700"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <ul className="py-2 max-h-[300px] overflow-y-auto">
              {suggestions.map((item, index) => (
                <motion.li
                  key={item.id}
                  className={`px-4 py-2 cursor-pointer transition-colors ${
                    selectedIndex === index 
                      ? 'bg-blue-500 bg-opacity-30 text-white' 
                      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  }`}
                  onClick={() => handleSuggestionClick(item)}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    {item.label}
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 