import React from 'react';
import styles from './StyledInput.module.css';

interface StyledInputProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}

const StyledInput: React.FC<StyledInputProps> = ({
  name,
  label,
  value,
  onChange,
  type = 'text',
  required = true
}) => {
  return (
    <div className={styles.formControl}>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
      />
      <label>
        {label.split('').map((char, idx) => (
          <span key={idx} style={{ transitionDelay: `${idx * 50}ms` }}>
            {char}
          </span>
        ))}
      </label>
    </div>
  );
};

export default StyledInput; 