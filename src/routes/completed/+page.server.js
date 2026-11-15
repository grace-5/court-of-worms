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

    const madlibs = JSON.parse(madlibsRaw);
    const script = JSON.parse(scriptRaw);

    const completedScript = {
        ...script,
        sections: script.sections.map(section => ({
            ...section,
            paragraphs: section.paragraphs.map(paragraph =>
                paragraph.replace(/\{(\w+)\}/g, (match, key) => {
                    return madlibs[key]?.value ?? match;
                })
            )
        }))
    };

    return {
        script: completedScript
    };
}