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

    function updateButtonStates(metadata) {
        const buttons = document.querySelectorAll('.favorite-btn');
        buttons.forEach(button => {
            const imagePath = button.dataset.path;
            if (metadata[imagePath] && metadata[imagePath].favorite) {
                button.classList.add('favorited');
                button.textContent = '❤️';
            } else {
                button.textContent = '🤍';
            }
        });
    }

    document.addEventListener('DOMContentLoaded', (event) => {
        function updateImageSources() {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                let src = new URL(img.src);

                // Remove 'v' query parameter
                src.searchParams.delete('v');

                // Reassign the src to trigger a reload
                img.src = src.href;

                img.style.cursor = 'pointer';  // Add pointer cursor style
                img.addEventListener('click', () => {
                    vscode.postMessage({ command: 'openImage', path: src.pathname });
                });
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
        // // //
        function updateMetadata(imagePath, data) {
            // Send a message to your extension to update the metadata JSON file
            vscode.postMessage({ command: 'updateMetadata', path: imagePath, data: data });
        }
    
        document.addEventListener('click', event => {
            if (event.target.classList.contains('favorite-btn')) {
                const imagePath = event.target.dataset.path;
                const isFavorited = event.target.classList.toggle('favorited');
                updateMetadata(imagePath, { favorite: isFavorited });
                event.target.textContent = isFavorited ? '❤️' : '🤍';
            } else if (event.target.classList.contains('meta-btn')) {
                debugger
                const imagePath = event.target.dataset.path;
                vscode.postMessage({ command: 'createOrOpenMetadata', path: imagePath });
            }
        });

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.command) {
                case 'loadMetadata':
                    const metadata = message.data;
                    updateButtonStates(metadata);
                    break;
                // ... handle other messages
            }
        });
    });
}());

