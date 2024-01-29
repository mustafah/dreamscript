//@ts-check

(function(){
    const vscode = acquireVsCodeApi();

    function initializeMasonry() {
        const grid = document.querySelector('.grid');
        imagesLoaded(grid, function() {
            // Initialize Masonry here
            new Masonry(grid, {
                itemSelector: '.grid-item',
                columnWidth: 200
            });
        });
    }

    window.initializeMasonry = initializeMasonry;

    document.addEventListener('DOMContentLoaded', (event) => {
        function updateImageSources() {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                let src = new URL(img.src);

                // Remove 'v' query parameter
                src.searchParams.delete('v');

                // Reassign the src to trigger a reload
                img.src = src.href;
            });
        }
        initializeMasonry();
        setTimeout(updateImageSources, 1000);
    });
}());


