import React, { useEffect, useState } from 'react';
import { useSpring } from 'motion/react';

interface DynamicPriceTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  id?: string;
}

export const DynamicPriceTicker: React.FC<DynamicPriceTickerProps> = ({
  value,
  prefix = '₦',
  suffix = '',
  className = '',
  id,
}) => {
  const spring = useSpring(value, { stiffness: 140, damping: 18 });
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (latest) => {
      const num = typeof latest === 'number' ? latest : parseFloat(String(latest)) || 0;
      setDisplayValue(Math.round(num));
    });
    return () => unsubscribe();
  }, [spring]);

  return (
    <span id={id} className={`inline-flex items-baseline font-price-display font-bold tabular-nums ${className}`}>
      {prefix && <span className="mr-0.5">{prefix}</span>}
      <span>{displayValue.toLocaleString()}</span>
      {suffix && <span className="ml-0.5 font-normal text-xs">{suffix}</span>}
    </span>
  );
};
