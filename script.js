document.addEventListener('DOMContentLoaded', function() {
    const toggleLeftSidebar = document.getElementById('toggle-left-sidebar');
    const sidebarLeft = document.getElementById('sidebar-left');

    toggleLeftSidebar.addEventListener('click', function() {
        sidebarLeft.classList.toggle('active');
        toggleLeftSidebar.classList.toggle('active');
    });

    function updateClock() {
        const now = new Date();
        const clock = document.getElementById('clock');
        const date = document.getElementById('date');

        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        clock.textContent = `${hours}:${minutes}`;

        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        const weekday = now.toLocaleString('default', { weekday: 'short' });
        date.textContent = `${day}/${month}/${year} ${weekday}`;
    }

    updateClock();
    setInterval(updateClock, 1000);

    const whiteboardApp = document.getElementById('whiteboard-app');
    const whiteboardContainer = document.getElementById('whiteboard-container');
    const closeWhiteboardButton = document.getElementById('close-whiteboard');

    whiteboardApp.addEventListener('click', function() {
        whiteboardContainer.style.display = 'flex';
    });

    closeWhiteboardButton.addEventListener('click', function() {
        whiteboardContainer.style.display = 'flex';
        location.reload(); // Reload the page when closing the whiteboard
    });

    const fileManagerApp = document.getElementById('file-manager-app');
    const fileManagerContainer = document.getElementById('file-manager-container');
    const closeFileManagerButton = document.getElementById('close-file-manager');

    fileManagerApp.addEventListener('click', function() {
        fileManagerContainer.style.display = 'flex';
    });

    closeFileManagerButton.addEventListener('click', function() {
        fileManagerContainer.style.display = 'none';
        location.reload(); // Reload the page when closing the file manager
    });

    const mirroringApp = document.getElementById('mirroring-app');
    const mirroringContainer = document.getElementById('mirroring-container');
    const closeMirroringButton = document.getElementById('close-mirroring');

    mirroringApp.addEventListener('click', function() {
        mirroringContainer.style.display = 'flex';
    });

    closeMirroringButton.addEventListener('click', function() {
        mirroringContainer.style.display = 'none';
        location.reload(); // Reload the page when closing the mirroring
    });

    const applicationApp = document.getElementById('application-app');
    const applicationContainer = document.getElementById('application-container');
    const closeApplicationButton = document.getElementById('close-application');

    applicationApp.addEventListener('click', function() {
        applicationContainer.style.display = 'flex';
    });

    closeApplicationButton.addEventListener('click', function() {
        applicationContainer.style.display = 'none';
        location.reload(); // Reload the page when closing the application
    });


    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    const writeButton = document.getElementById('write-button');
    const eraseButton = document.getElementById('erase-button');
    const undoButton = document.getElementById('undo-button');
    const redoButton = document.getElementById('redo-button');

    let isDrawing = false;
    let isErasing = false;
    let history = [];
    let redoStack = [];

    // Adjust canvas size to match CSS and vice versa
    canvas.width = 900; // Adjust width as needed
    canvas.height = 450; // Adjust height as needed

    // Function to start drawing or erasing
    function startDrawing(e) {
        e.preventDefault(); // Prevent default behavior for touch events
        if (isWritingMode() || isErasing) {
            isDrawing = true;
            ctx.beginPath();

            if (e.type === 'touchstart') {
                const touch = e.touches[0];
                ctx.moveTo(touch.clientX - canvas.getBoundingClientRect().left, touch.clientY - canvas.getBoundingClientRect().top);
            } else {
                ctx.moveTo(e.offsetX, e.offsetY);
            }
        }
    }

    // Function to draw or erase
    function draw(e) {
        e.preventDefault(); // Prevent default behavior for touch events
        if (isDrawing && (isWritingMode() || isErasing)) {
            let offsetX, offsetY;

            if (e.type === 'touchmove') {
                const touch = e.touches[0];
                offsetX = touch.clientX - canvas.getBoundingClientRect().left;
                offsetY = touch.clientY - canvas.getBoundingClientRect().top;
            } else {
                offsetX = e.offsetX;
                offsetY = e.offsetY;
            }

            // Adjust line width for erasing
            ctx.lineWidth = isErasing ? 40 : 5;
            ctx.lineCap = 'round';
            ctx.strokeStyle = isErasing ? '#fff' : '#000';

            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY);
        }
    }

    // Function to end drawing or erasing
    function endDrawing() {
        isDrawing = false;
        ctx.closePath();
        saveState(); // Save state after drawing or erasing ends
    }

    // Event listeners for mouse events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endDrawing);
    canvas.addEventListener('mouseleave', endDrawing);

    // Event listeners for touch events
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', endDrawing);

    // Function to handle cursor change based on write mode
    writeButton.addEventListener('click', function() {
        writeButton.classList.toggle('active');
        canvas.style.cursor = writeButton.classList.contains('active') ? 'crosshair' : 'default';

        // Turn off erase mode when switching to write mode
        if (writeButton.classList.contains('active')) {
            isErasing = false;
            eraseButton.classList.remove('active');
        }
    });

    // Function to handle erase mode
    eraseButton.addEventListener('click', function() {
        isErasing = !isErasing;
        eraseButton.classList.toggle('active', isErasing);
        canvas.style.cursor = isErasing ? 'crosshair' : 'default';

        // Turn off write mode when switching to erase mode
        if (isErasing) {
            writeButton.classList.remove('active');
        }
    });

    // Function to check if in write mode
    function isWritingMode() {
        return writeButton.classList.contains('active');
    }

    // Save canvas state to history
    function saveState() {
        let currentState = canvas.toDataURL();
        history.push(currentState);
        redoStack = []; // Clear redo stack whenever a new action is made
    }

    // Undo the last action
    undoButton.addEventListener('click', function() {
        if (history.length > 0) {
            redoStack.push(history.pop());
            restoreCanvas();
        }
    });

    // Redo the last undone action
    redoButton.addEventListener('click', function() {
        if (redoStack.length > 0) {
            history.push(redoStack.pop());
            restoreCanvas();
        }
    });

    // Function to restore canvas state
    function restoreCanvas() {
        if (history.length > 0) {
            let img = new Image();
            img.src = history[history.length - 1];
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
        }
    }

    const clearButton = document.getElementById('add-button');

    // Event listener for the clear button
    clearButton.addEventListener('click', function() {
        clearCanvas();
    });

    // Function to clear the canvas
    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        history = []; // Clear history
        redoStack = []; // Clear redo stack
    }
});

