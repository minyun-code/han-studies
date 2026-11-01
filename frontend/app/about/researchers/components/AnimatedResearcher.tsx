"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { type Researchers } from "../types";
import "./breathing.css"; 

export function AnimatedResearcher({ researcher }: { researcher: Researchers }) {
  return (
    <motion.div
      key={researcher.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 15 }}
      whileHover={{ scale: 1.05, boxShadow: "0px 10px 25px rgba(0,0,0,0.15)" }}
      className="relative breathing-card backdrop-blur-sm border border-white/30 shadow-lg rounded-2xl p-6 flex flex-col items-center space-y-3 transition-all duration-300"
     
      
    >
  
      <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-1">
        {researcher.profileLink ? (
          <a
            href={researcher.profileLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline flex items-center"
          >
            {researcher.name}
            <ArrowUpRight className="w-4 h-4 ml-1 text-blue-500" />
          </a>
        ) : (
          researcher.name
        )}
      </h2>

      <p className="text-gray-500 text-sm">{researcher.nameKana}</p>

<div className="flex justify-center gap-2 mt-1">
  <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full shadow-sm">
    {researcher.title}
  </span>
  {researcher.researchField && (
    <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full shadow-sm">
      {researcher.researchField}
    </span>
  )}
</div>

<p className="text-gray-700 text-center mt-2">{researcher.department}</p>

    </motion.div>
  );
}
