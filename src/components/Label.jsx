'use client';
import React from 'react';

const Label = () => {
  return (
    <div className="label-wrapper">
      <p className="label-text">
        Powered by <span className="label-name">Marcos Beltrán</span>
      </p>

      <style jsx>{`
        .label-wrapper {
          width: fit-content;
          background-color: #25cad2;
          text-align: center;
          position: fixed;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          padding: 0.5rem 1rem .3rem;
          border-radius: .6rem .6rem 0 0;
        }

        .label-text {
          font-family: 'Inter', sans-serif;
          font-size: 0.75rem;
          color: #ffffffff;
          margin: 0;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .label-name {
          font-weight: 600;
          /* Ya no tiene estilos de hover de link ni cursor pointer */
        }
      `}</style>
    </div>
  );
};

export default Label;