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
        function fadeInNewImages() {
            const images = document.querySelectorAll('.grid-item img');
            images.forEach(img => {
                if (!img.style.transition) {
                    img.style.opacity = 0;
                    img.style.transition = 'opacity 0.5s ease-in-out';
                    img.onload = () => { img.style.opacity = 1; };
                }
            });
        }
        initializeMasonry();
        fadeInNewImages();
        setTimeout(function () {
            updateImageSources();
        }, 1000);
    });
}());


