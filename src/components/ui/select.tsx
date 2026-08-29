'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import gsap from 'gsap';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  error?: string;
  options: Option[];
  value?: string;
  defaultValue?: string;
  onChange?: (e: { target: { value: string; name?: string } }) => void;
  name?: string;
  id?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  value,
  defaultValue,
  onChange,
  name,
  id,
  placeholder = 'Select option...',
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || (options[0]?.value ?? ''));
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && dropdownRef.current) {
      gsap.fromTo(
        dropdownRef.current,
        { opacity: 0, y: -6, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    setIsOpen(false);
    if (onChange) {
      onChange({ target: { value: optionValue, name } });
    }
  };

  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div ref={containerRef} className="w-full flex flex-col gap-1.5 relative">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-slate-700">
          {label}
        </label>
      )}

      {/* Hidden Native Select for Form Compatibility */}
      <select
        id={selectId}
        name={name}
        value={selectedValue}
        onChange={(e) => handleSelect(e.target.value)}
        className="sr-only"
        tabIndex={-1}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Custom Animated Select Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={twMerge(
          clsx(
            'w-full px-3 py-2 text-sm bg-white border border-slate-300 text-slate-900 flex items-center justify-between transition-colors cursor-pointer focus:outline-none',
            isOpen && 'border-[#008080]',
            error && 'border-red-500',
            disabled && 'bg-slate-100 cursor-not-allowed opacity-60',
            className
          )
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#008080]' : ''
          }`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-slate-300 shadow-xl max-h-60 overflow-y-auto"
        >
          {options.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`px-3 py-2 text-sm flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#008080] text-white font-bold'
                    : 'text-slate-800 hover:bg-slate-100 hover:text-[#008080]'
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="w-4 h-4" />}
              </div>
            );
          })}
        </div>
      )}

      {error && <span className="text-xs text-red-600 font-medium">{error}</span>}
    </div>
  );
};
