'use client';

import { useState, useEffect, useRef } from 'react';

interface PriceRangeSliderProps {
    min: number;
    max: number;
    onChange: (min: number, max: number) => void;
    initialMin?: number;
    initialMax?: number;
}

export function PriceRangeSlider({ min, max, onChange, initialMin, initialMax }: PriceRangeSliderProps) {
    const [minVal, setMinVal] = useState(initialMin || min);
    const [maxVal, setMaxVal] = useState(initialMax || max);
    const minValRef = useRef(minVal);
    const maxValRef = useRef(maxVal);
    const range = useRef<HTMLDivElement>(null);

    // Convertir en pourcentage
    const getPercent = (value: number) => Math.round(((value - min) / (max - min)) * 100);

    // Définir la largeur de la plage pour diminuer depuis le côté gauche
    useEffect(() => {
        const minPercent = getPercent(minVal);
        const maxPercent = getPercent(maxValRef.current);

        if (range.current) {
            range.current.style.left = `${minPercent}%`;
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minVal, getPercent]);

    // Définir la largeur de la plage pour diminuer depuis le côté droit
    useEffect(() => {
        const minPercent = getPercent(minValRef.current);
        const maxPercent = getPercent(maxVal);

        if (range.current) {
            range.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [maxVal, getPercent]);

    useEffect(() => {
        onChange(minVal, maxVal);
    }, [minVal, maxVal]);

    return (
        <div className="relative w-full h-12 flex items-center justify-center">
            <input
                type="range"
                min={min}
                max={max}
                value={minVal}
                onChange={(event) => {
                    const value = Math.min(Number(event.target.value), maxVal - 1);
                    setMinVal(value);
                    minValRef.current = value;
                }}
                className="thumb thumb--left pointer-events-none absolute h-0 w-full outline-none z-[3]"
                style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
            />
            <input
                type="range"
                min={min}
                max={max}
                value={maxVal}
                onChange={(event) => {
                    const value = Math.max(Number(event.target.value), minVal + 1);
                    setMaxVal(value);
                    maxValRef.current = value;
                }}
                className="thumb thumb--right pointer-events-none absolute h-0 w-full outline-none z-[4]"
            />

            <div className="relative w-full">
                <div className="absolute bg-gray-200 h-1.5 w-full rounded-full z-[1]" />
                <div
                    ref={range}
                    className="absolute bg-primary h-1.5 rounded-full z-[2] shadow-sm"
                />
                <div className="absolute left-0 top-5 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">{minVal}€</div>
                <div className="absolute right-0 top-5 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">{maxVal}€</div>
            </div>

            <style jsx>{`
                .thumb::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    -webkit-tap-highlight-color: transparent;
                    pointer-events: all;
                    height: 24px;
                    width: 24px;
                    border-radius: 50%;
                    background-color: white;
                    border: 2px solid #3b82f6;
                    cursor: pointer;
                    margin-top: 0px;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                    transition: transform 0.1s ease;
                }
                .thumb::-webkit-slider-thumb:hover {
                    transform: scale(1.1);
                }
                .thumb::-moz-range-thumb {
                    -webkit-appearance: none;
                    pointer-events: all;
                    height: 24px;
                    width: 24px;
                    border-radius: 50%;
                    background-color: white;
                    border: 2px solid #3b82f6;
                    cursor: pointer;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
                    transition: transform 0.1s ease;
                }
                .thumb::-moz-range-thumb:hover {
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
}
