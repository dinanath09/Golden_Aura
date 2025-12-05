// src/components/Dropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Dropdown({ label = "Menu", items = [], align = "left" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((s) => !s)}
        className="px-3 py-2 rounded-md text-sm inline-flex items-center gap-1 text-white/95 hover:bg-white/10"
        aria-expanded={open}
      >
        {label}
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className={`absolute mt-2 w-64 bg-white rounded-lg shadow-lg text-zinc-800 p-3 ${
            align === "left" ? "left-0" : "right-0"
          }`}
        >
          <div className="grid grid-cols-3 gap-4">
            {items.map((group, gi) => (
              <div key={gi}>
                <div className="font-semibold mb-2">{group.title}</div>
                <ul className="space-y-1 text-sm">
                  {Array.isArray(group.items) &&
                    group.items.map((it, i) => {
                      // If item.href exists, use Link; else either skip or show non-clickable text
                      const href = it.href || it.to || null;
                      return (
                        <li key={i}>
                          {href ? (
                            <Link to={href} className="block px-2 py-1 hover:bg-zinc-50 rounded">
                              <div>{it.label}</div>
                              {it.sub && <div className="text-xs text-zinc-400">{it.sub}</div>}
                            </Link>
                          ) : (
                            <div className="px-2 py-1 text-zinc-600">{it.label}</div>
                          )}
                        </li>
                      );
                    })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
