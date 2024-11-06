import React, { useState } from 'react';

function Paginator({ currentPage, totalItems, itemsPerPage, onPageChange }) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const handlePrev = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    return (
        <div className="pagenator">
            <div className="page-info">
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
            </div>
            <div className="pagination-controls">
                <button className="prev" onClick={handlePrev} disabled={currentPage === 1}>Prev</button>
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index}
                        className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                        onClick={() => onPageChange(index + 1)}
                    >
                        {index + 1}
                    </button>
                ))}
                <button className="next" onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
            </div>
        </div>
    );
}

export default Paginator;
