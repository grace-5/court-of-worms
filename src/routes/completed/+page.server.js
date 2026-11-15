import fs from "node:fs/promises";
import path from "node:path";

const dataDir = path.join(process.cwd(), "src/routes/data");

export async function load() {
    const madlibsRaw = await fs.readFile(
        path.join(dataDir, "madlibs.json"),
        "utf-8"
    );

    const scriptRaw = await fs.readFile(
        path.join(dataDir, "script.json"),
        "utf-8"
    );

    const gameDataRaw = await fs.readFile(
        path.join(dataDir, "game_data.json"),
        "utf-8"
    );

    const madlibs = JSON.parse(madlibsRaw);
    const script = JSON.parse(scriptRaw);
    const gameData = JSON.parse(gameDataRaw);

    // Combine both data sources
    const allMadlibs = {
        ...madlibs,
        ...gameData
    };

    const completedScript = {
        ...script,
        sections: script.sections.map(section => ({
            ...section,
            paragraphs: section.paragraphs.map(paragraph =>
                paragraph.replace(/\{(\w+)\}/g, (match, key) => {
                    const value = allMadlibs[key]?.value;

                    if (value == null || value.trim() === "") {
                        console.warn(`Missing Mad Lib value: ${key}`);
                        return `[${key}]`;
                    }

                    return value;
                })
            )
        }))
    };

    return {
        script: completedScript
    };
}