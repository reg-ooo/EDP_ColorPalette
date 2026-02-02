// DOM ELEMENTS
const generateBtn = document.getElementById("generate-btn");
const paletteContainer = document.querySelector(".palette-container");
const togglePaletteBtn = document.getElementById("toggle-palette-btn");
const paletteLabelSpan = document.getElementById("palette-label");
const saveBtn = document.getElementById("save-btn");
const deleteBtn = document.getElementById("delete-btn");

saveBtn.addEventListener("click", savePalette);

let currentColors = [];
let analogousScheme = true;

generatePalette(); // initial palette on loads

generateBtn.addEventListener("click", () => {
    generatePalette();
});

togglePaletteBtn.addEventListener("click", () => {
    analogousScheme = !analogousScheme;
    paletteLabelSpan.textContent = analogousScheme ? "Switch Scheme - Analogous" : "Switch Scheme - Complementary";
    togglePaletteBtn.style.background = `linear-gradient(135deg, ${currentColors.join(", ")})`;
    generatePalette();
});

paletteContainer.addEventListener("click", (e) => {
    // find the closest copy button/icon in case the user clicks an inner <i> or child element
    const copyBtn = e.target.closest(".copy-btn");
    if (copyBtn) {
        const hexElement = copyBtn.previousElementSibling;
        const hexValue = hexElement ? hexElement.textContent : "";

        navigator.clipboard.writeText(hexValue)
        .then(() => {
            // prefer the icon element if present, otherwise use the button itself
            const icon = copyBtn.querySelector("i") || copyBtn;
            showCopySuccess(icon);
        })
        .catch((err) => console.log(err));
        return;
    }

    const colorEl = e.target.closest(".color");
    if (colorEl) {
        const details = colorEl.nextElementSibling;
        const hexEl = details ? details.querySelector(".hex-value") : null;
        const hexValue = hexEl ? hexEl.textContent : "";

        navigator.clipboard.writeText(hexValue)
        .then(() => {
            const copyBtnEl = details ? details.querySelector(".copy-btn") : null;
            const icon = copyBtnEl ? (copyBtnEl.querySelector("i") || copyBtnEl) : null;
            if (icon) showCopySuccess(icon);
        })
        .catch((err) => console.log(err));
    }
})

function showCopySuccess(element){
    if (!element) return;

    element.classList.remove("far", "fa-copy");
    element.classList.add("fa-solid", "fa-check");

    element.style.color = "#48bb78";

    // keep the check visible for 1.5s before reverting
    setTimeout(() => {
        element.classList.remove("fa-solid", "fa-check");
        element.classList.add("far", "fa-copy");

        element.style.color = "#111F35";
    }, 1500);
}

function generatePalette() {
    currentColors = [];
    const baseColor = generateRandomColor();
    currentColors.push(baseColor);
    const hsl = hexToHSL(baseColor);

    if (analogousScheme) {
        const analogousColors = analogousHSL(hsl.h, hsl.s, hsl.l);
        analogousColors.forEach(color => {
            const hexColor = hslToHex(color.h, color.s, color.l);
            currentColors.push(hexColor);
        });
    } else {
        const complementaryColor = complementaryHSL(hsl.h, hsl.s, hsl.l);
        const hexColor = hslToHex(complementaryColor.h, complementaryColor.s, complementaryColor.l);
        currentColors.push(hexColor);
    }

    updatePaletteDisplay(currentColors);
    updateBackground();
}

function generateRandomColor(){
    const letters = "0123456789ABCDEF";
    let color = "#";

    for(let i = 0; i < 6; i++){
        color += letters[Math.floor(Math.random() * 16)]; // generate number from 0 - 15
    }

    return color;
}

function updatePaletteDisplay(colors){
    paletteContainer.innerHTML = ""; // clear existing colors
    for(let i = 0; i < colors.length; i++){
        addColorBox();
    }
    const colorBoxes = document.querySelectorAll(".color-box")

    colorBoxes.forEach((box, index) => {
        const color = colors[index];
        const colorDiv = box.querySelector(".color");
        const hexValue = box.querySelector(".hex-value");

        colorDiv.style.backgroundColor = color;
        hexValue.textContent = color;
    })
}

function updateBackground(){
    const body = document.body;
    togglePaletteBtn.style.background = `linear-gradient(135deg, ${currentColors.join(", ")})`;
    generateBtn.style.background = `linear-gradient(45deg, ${currentColors.join(", ")})`;
    body.style.background = `linear-gradient(135deg, ${currentColors.join(", ")})`;     
    saveBtn.style.background = `linear-gradient(45deg, ${currentColors.join(", ")})`;
}

function analogousHSL(h, s, l) {
    return [
        { h: (h + 20) % 360, s: s, l: l },
        { h: (h + 40) % 360, s: s, l: l },
        { h: (h + 60) % 360, s: s, l: l },
        { h: (h + 80) % 360, s: s, l: l }
    ];
}

function complementaryHSL(h, s, l) {
  return {
    h: (h + 180) % 360,
    s: s,
    l: l
  };
}

function hexToHSL(hex){
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let delta = max - min;

    let l = (max + min) / 2; // lightness
    let s = 0; // saturation
    let h = 0; // hue

    if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1)); // to find the saturation based on the lightness

    switch (max) {
      case r:
        h = ((g - b) / delta) % 6;
        break;
      case g:
        h = (b - r) / delta + 2;
        break;
      case b:
        h = (r - g) / delta + 4;
        break;
    }

    h *= 60; // convert to degrees
    if (h < 0) h += 360; // ensure positive hue
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100), // convert to percentage
    l: Math.round(l * 100)
  };
}

function hslToHex(h, s, l) {
    s /= 100; // convert to decimal [0,1]
    l /= 100; // convert to decimal [0,1]
    let c = (1 - Math.abs(2 * l - 1)) * s; // chroma
    let x = c * (1 - Math.abs((h / 60) % 2 - 1)); // second largest component
    let m = l - c / 2; // match lightness
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
    }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    let hexR = r.toString(16).padStart(2, '0');
    let hexG = g.toString(16).padStart(2, '0');
    let hexB = b.toString(16).padStart(2, '0');

    return `#${hexR}${hexG}${hexB}`.toUpperCase();
}

function addColorBox(){
    const colorBox = document.createElement("div");
    const colorDiv = document.createElement("div");
    const colorInfo = document.createElement("div");

    const hexValueSpan = document.createElement("span");
    const icon = document.createElement("i");

    colorBox.classList.add("color-box");
    colorDiv.classList.add("color");
    colorInfo.classList.add("color-info");
    hexValueSpan.classList.add("hex-value");
    icon.classList.add("far", "fa-copy", "copy-btn");

    colorInfo.appendChild(hexValueSpan);
    colorInfo.appendChild(icon);
    colorBox.appendChild(colorDiv);
    colorBox.appendChild(colorInfo);
    paletteContainer.appendChild(colorBox);
}

function savePalette(){
    const savedColors = [];
    const colorBoxes = document.querySelectorAll(".color-box");

    colorBoxes.forEach(box => {
        const hexValue = box.querySelector(".hex-value").textContent;
        savedColors.push(hexValue);
    });

    const savedPalette = JSON.parse(localStorage.getItem("savedPalette")) || [];
    // make sures we dont save duplicate palettes
    if(savedPalette.some(palette => JSON.stringify(palette) === JSON.stringify(savedColors))){
        showDialog("This palette is already saved!", 'alert');
        return;
    }

    savedPalette.push(savedColors);
    localStorage.setItem("savedPalette", JSON.stringify(savedPalette));
    showDialog("Palette saved successfully!", 'alert');

    showSavedPalettes();
}

function showSavedPalettes(){
    const palettesList = document.querySelector(".palettes-list");
    palettesList.innerHTML = ""; // Clear existing palettes

    const savedPalette = JSON.parse(localStorage.getItem("savedPalette")) || [];
    savedPalette.forEach((colors, index) => {
        const paletteDiv = document.createElement("div");
        paletteDiv.classList.add("saved-palette");

        colors.forEach(color=> {
            const colorDiv = document.createElement("div");
            colorDiv.classList.add("saved-color");
            colorDiv.style.backgroundColor = color;
            paletteDiv.appendChild(colorDiv);
        });

        // Create delete button per saved palette
        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fa-solid", "fa-trash", "delete-palette-btn");
        deleteIcon.style.color = "#F00000";
        deleteIcon.style.fontSize = "20px";
        deleteIcon.title = "Delete this palette";

        deleteIcon.addEventListener("click", (e) => {
            e.stopPropagation();
            deletePalette(index);
        });

        paletteDiv.appendChild(deleteIcon);

        paletteDiv.addEventListener("click", () => {
            updatePaletteDisplay(colors);
            currentColors = colors;
            updateBackground();
            paletteLabelSpan.textContent = currentColors.length == 5 ? "Switch Scheme - Analogous" : "Switch Scheme - Complementary";
        });

        palettesList.appendChild(paletteDiv);
    });
}

function deletePalette(index){
    showDialog("Are you sure you want to delete this palette?", 'confirm', (confirmed) => {
        if (confirmed) { 
            const savedPalette = JSON.parse(localStorage.getItem("savedPalette")) || [];
            savedPalette.splice(index, 1);
            localStorage.setItem("savedPalette", JSON.stringify(savedPalette));
            showSavedPalettes();
        }
    });
}


// Dialog 
const overlay =  document.getElementById("overlay");
const closedModalButtons = document.querySelectorAll("[data-close-button]");

overlay.addEventListener("click", () => {
    const modals = document.querySelectorAll(".dialog-overlay");
    modals.forEach(modal => {
        closeModal(modal);
    });
});

closedModalButtons.forEach(button => {
    button.addEventListener("click", () => {
        const modal = button.closest(".dialog-overlay");
        closeModal(modal);
    });
});

function openModal(modal) {
    if (modal == null) return;
    modal.classList.add("active");
    overlay.classList.add("active");
}
function closeModal(modal) {
    if (modal == null) return;
    modal.classList.remove("active");
    overlay.classList.remove("active");
}

// Dialog Function
function showDialog(message, type = 'alert', callback) {
    const modal = document.getElementById("dialog-modal");
    const messageEl = modal.querySelector("#dialog-message");
    const confirmBtn = modal.querySelector("#dialog-confirm-btn");
    const cancelBtn = modal.querySelector("#dialog-cancel-btn");

    messageEl.textContent = message;

    if (type === "alert") {
        cancelBtn.style.display = "none";
        confirmBtn.textContent = "OK";
    } else {
        cancelBtn.style.display = "block";
        confirmBtn.textContent = "Yes";
        cancelBtn.textContent = "No";
    }

    openModal(modal);

    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    document.getElementById("dialog-confirm-btn").addEventListener("click", () => {
        closeModal(modal);
        if (callback) callback(true);
    });

    if (type === "confirm") {
        const newCancelBtn = cancelBtn.cloneNode(true);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        document.getElementById("dialog-cancel-btn").addEventListener("click", () => {
            closeModal(modal);
            if (callback) callback(false);
        });
    }
}

showSavedPalettes();
