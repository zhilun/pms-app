import React, { useState, useRef, useEffect } from 'react';

const removeDiacritics = (str) => {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '');
};

export const SearchableSelect = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  required = false,
  displayKey = 'name',
  renderOption = null,
  onOpenAddNew = null,
  addNewButtonLabel = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const filteredOptions = options.filter(option => {
    const searchStr = searchTerm.toLowerCase();
    const searchStrNoDiacritics = removeDiacritics(searchStr).toLowerCase();

    const displayText = typeof option === 'string' ? option : option[displayKey];
    const displayTextNoDiacritics = removeDiacritics(displayText).toLowerCase();

    const additionalText = option.company ? option.company.toLowerCase() : '';
    const additionalTextNoDiacritics = removeDiacritics(additionalText).toLowerCase();

    return displayText.toLowerCase().includes(searchStr) ||
           displayTextNoDiacritics.includes(searchStrNoDiacritics) ||
           additionalText.includes(searchStr) ||
           additionalTextNoDiacritics.includes(searchStrNoDiacritics);
  });

  const selectedOption = options.find(opt => {
    const optValue = typeof opt === 'string' ? opt : opt[displayKey];
    return optValue === value;
  });

  const handleSelect = (option) => {
    const selectedValue = typeof option === 'string' ? option : option[displayKey];
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      inputRef.current?.focus();
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label className="text-xs font-semibold text-gray-600">
            {label}
            {required && ' (*)'}
          </label>
          {onOpenAddNew && addNewButtonLabel && (
            <button
              type="button"
              onClick={onOpenAddNew}
              className="text-xs text-blue-600 font-medium hover:text-blue-700"
            >
              {addNewButtonLabel}
            </button>
          )}
        </div>
      )}

      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 outline-none text-sm bg-white cursor-pointer flex items-center justify-between"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder={isOpen ? placeholder : (selectedOption ? '' : placeholder)}
          value={isOpen ? searchTerm : ''}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 outline-none text-sm bg-transparent"
          required={required && !value}
        />
        {!isOpen && selectedOption && (
          <span className="text-gray-900 font-medium text-sm">
            {typeof selectedOption === 'string'
              ? selectedOption
              : `${selectedOption[displayKey]} ${selectedOption.company ? `(${selectedOption.company})` : ''}`}
          </span>
        )}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-50 max-h-64 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(option)}
                className={`p-2.5 cursor-pointer text-sm transition-colors ${
                  value === (typeof option === 'string' ? option : option[displayKey])
                    ? 'bg-blue-100 text-blue-900 font-semibold'
                    : 'hover:bg-gray-100 text-gray-900'
                }`}
              >
                {renderOption ? renderOption(option) : (
                  typeof option === 'string'
                    ? option
                    : `${option[displayKey]} ${option.company ? `(${option.company})` : ''}`
                )}
              </div>
            ))
          ) : (
            <div className="p-3 text-gray-500 text-center text-sm">
              Không có kết quả phù hợp
            </div>
          )}
        </div>
      )}
    </div>
  );
};
