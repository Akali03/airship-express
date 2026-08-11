// 'use client';

// interface TablePaginationProps {
//     currentPage: number;
//     totalPages: number;
//     totalItems: number;
//     itemsPerPage: number;
//     onPageChange: (page: number) => void;
// }

// export function TablePagination({
//     currentPage,
//     totalPages,
//     totalItems,
//     itemsPerPage,
//     onPageChange
// }: TablePaginationProps) {
//     const startItem = (currentPage - 1) * itemsPerPage + 1;
//     const endItem = Math.min(currentPage * itemsPerPage, totalItems);

//     // Generate page numbers to display
//     const getPageNumbers = () => {
//         const pages = [];
//         const maxVisible = 5;

//         if (totalPages <= maxVisible) {
//             for (let i = 1; i <= totalPages; i++) {
//                 pages.push(i);
//             }
//         } else {
//             pages.push(1);
//             if (currentPage > 3) pages.push('...');

//             const start = Math.max(2, currentPage - 1);
//             const end = Math.min(totalPages - 1, currentPage + 1);

//             for (let i = start; i <= end; i++) {
//                 pages.push(i);
//             }

//             if (currentPage < totalPages - 2) pages.push('...');
//             pages.push(totalPages);
//         }

//         return pages;
//     };

//     return (
//         <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
//             <span className="text-sm text-slate-500">
//                 Showing {startItem} to {endItem} of {totalItems} items
//             </span>
//             <div className="flex gap-1">
//                 <button
//                     className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
//                     onClick={() => onPageChange(Math.max(1, currentPage - 1))}
//                     disabled={currentPage === 1}
//                 >
//                     <i className="fas fa-chevron-left text-xs"></i> Prev
//                 </button>

//                 {getPageNumbers().map((page, index) => (
//                     page === '...' ? (
//                         <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-xs text-slate-400">...</span>
//                     ) : (
//                         <button
//                             key={page}
//                             className={`px-3 py-1.5 text-xs border rounded-lg transition-all ${currentPage === page
//                                 ? 'bg-pink-50 border-pink-200 text-pink-600 font-medium'
//                                 : 'bg-white border-slate-200 hover:bg-slate-50'
//                                 }`}
//                             onClick={() => onPageChange(page as number)}
//                         >
//                             {page}
//                         </button>
//                     )
//                 ))}

//                 <button
//                     className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
//                     onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
//                     disabled={currentPage === totalPages}
//                 >
//                     Next <i className="fas fa-chevron-right text-xs"></i>
//                 </button>
//             </div>
//         </div>
//     );
// }