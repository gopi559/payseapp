import React, { useState, useRef, useEffect } from 'react'

const PasscodeInput = ({ length = 6, onComplete, error }) => {
  const [digits, setDigits] = useState(Array(length).fill(''))
  const inputRefs = useRef([])
  
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])
  
  const handleChange = (index, value) => {
    if (!/^\d$/.test(value) && value !== '') return
    
    const newDigits = [...digits]
    newDigits[index] = value
    setDigits(newDigits)
    
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
    
    if (newDigits.every((d) => d !== '') && onComplete) {
      onComplete(newDigits.join(''))
    }
  }
  
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }
  
  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, length)
    const newDigits = Array(length).fill('')
    
    pastedData.split('').forEach((char, i) => {
      if (i < length && /^\d$/.test(char)) {
        newDigits[i] = char
      }
    })
    
    setDigits(newDigits)
    
    if (newDigits.every((d) => d !== '') && onComplete) {
      onComplete(newDigits.join(''))
    } else {
      const nextEmptyIndex = newDigits.findIndex((d) => d === '')
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus()
      }
    }
  }
  
  return (
    <div className="w-full">
      <div className="flex justify-center gap-3 mb-4">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className={`
              w-14 h-14 text-center text-2xl font-bold rounded-lg border-2
              ${error ? 'border-red-500' : 'border-brand-primary'}
              focus:outline-none focus:ring-2 focus:ring-brand-primary
              ${digits[index] ? 'bg-brand-surfaceMuted' : 'bg-white'}
            `}
          />
        ))}
      </div>
      {error && (
        <p className="text-center text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  )
}

export default PasscodeInput

