const aiNames = [
    "Nova", "Sentinel", "Apex", "Goliath", "Phantom", "Spectre",
    "Zephyr", "Vortex", "Crux", "Echo", "Hydra", "Titan", "Rogue",
    "Blaze", "Fury", "Shadow", "Comet", "Ares"
];

function getRandomAIName() {
    return aiNames[Math.floor(Math.random() * aiNames.length)];
}