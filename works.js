
document.addEventListener("DOMContentLoaded", async function () {
    const grid = document.getElementById("works-grid");

    if (!grid) {
        console.error("作品を表示する場所 #works-grid が見つかりません。");
        return;
    }

    try {
        const response = await fetch("./works.csv");

        if (!response.ok) {
            throw new Error("works.csvを読み込めませんでした。");
        }

        const csvText = await response.text();
        const works = parseCSV(csvText);

        if (works.length === 0) {
            grid.innerHTML = '<p class="works-message">作品はまだ登録されていません。</p>';
            return;
        }

        grid.innerHTML = "";

        works.forEach(function (work, index) {
            if (!work.title || !work.image) return;

            const card = document.createElement("article");
            card.className = "work-card";
            card.style.setProperty("--card-index", index);

            const link = document.createElement("a");
            link.className = "work-link";
            link.href = work.link || "#";
            link.setAttribute("aria-label", work.title);

            const imageWrap = document.createElement("div");
            imageWrap.className = "work-image";

            const img = document.createElement("img");
            img.src = work.image;
            img.alt = work.title;
            img.loading = "lazy";

            img.onerror = function () {
                imageWrap.classList.add("image-error");
                img.remove();

                const placeholder = document.createElement("span");
                placeholder.textContent = "IMAGE NOT FOUND";
                imageWrap.appendChild(placeholder);

                console.error("画像が見つかりません:", work.image);
            };

            const number = document.createElement("span");
            number.className = "work-number";
            number.textContent = String(index + 1).padStart(2, "0");

            const info = document.createElement("div");
            info.className = "work-info";

            const title = document.createElement("h3");
            title.textContent = work.title;

            const description = document.createElement("p");
            description.textContent = work.description || "";

            const arrow = document.createElement("span");
            arrow.className = "work-arrow";
            arrow.textContent = "↗";
            arrow.setAttribute("aria-hidden", "true");

            imageWrap.appendChild(img);
            imageWrap.appendChild(number);

            info.appendChild(title);
            info.appendChild(description);
            info.appendChild(arrow);

            link.appendChild(imageWrap);
            link.appendChild(info);
            card.appendChild(link);

            grid.appendChild(card);
        });

    } catch (error) {
        console.error("作品の読み込みエラー:", error);
        grid.innerHTML =
            '<p class="works-message">作品を読み込めませんでした。works.csvと画像の保存場所を確認してください。</p>';
    }
});

function parseCSV(text) {
    const rows = [];
    let row = [];
    let value = "";
    let quoted = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const next = text[i + 1];

        if (char === '"' && quoted && next === '"') {
            value += '"';
            i++;
        } else if (char === '"') {
            quoted = !quoted;
        } else if (char === "," && !quoted) {
            row.push(value.trim());
            value = "";
        } else if ((char === "\n" || char === "\r") && !quoted) {
            if (char === "\r" && next === "\n") i++;

            row.push(value.trim());

            if (row.some(cell => cell !== "")) {
                rows.push(row);
            }

            row = [];
            value = "";
        } else {
            value += char;
        }
    }

    row.push(value.trim());

    if (row.some(cell => cell !== "")) {
        rows.push(row);
    }

    if (rows.length < 2) return [];

    const headers = rows[0].map(header =>
        header.replace(/^\uFEFF/, "").trim().toLowerCase()
    );

    return rows.slice(1).map(function (cells) {
        const item = {};

        headers.forEach(function (header, index) {
            item[header] = (cells[index] || "").trim();
        });

        return item;
    });
}
