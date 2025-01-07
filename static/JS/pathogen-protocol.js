const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const events = document.getElementById('events');
const stats = document.getElementById('stats');
const policyContainer = document.getElementById('policies')
const lose_ui = document.getElementById('lose')

const tooltip = document.getElementById('tooltip')
const tooltip_head = document.getElementById('tooltip-head')
const tooltip_desc = document.getElementById('tooltip-desc')

var areas;
var intervalId

canvas.width = 800;
canvas.height = 800;

let money = 5;
let population = 0;
let happiness = 100;
let day = 1;

let research1 = null
let research2 = null

let musicGainNode;

const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function fadeIn(gainNode, duration) {
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + duration);
}

function fadeOut(gainNode, duration) {
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + duration);
    setTimeout(() => {
        gainNode.disconnect();
    }, duration * 1000);
}

function playAudio() {
    return fetch('static/AUDIO/pathogen-protocol-background-music.mp3')
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            const source = audioContext.createBufferSource();
            const gainNode = audioContext.createGain();

            source.buffer = audioBuffer;
            source.loop = true;
            source.connect(gainNode);
            gainNode.connect(audioContext.destination);

            source.start();

            fadeIn(gainNode, 2);

            return gainNode;
        });
}

function stopAudio(gainNode) {
    if (gainNode) {
        fadeOut(gainNode, 2);
    }
}


function send_event_alert(text, color) {
    events.innerHTML += `<p class="event-text" style="color: ${color ? color : "white"};">Day ${day}: ${text}</p>`;

    events.scrollTop = events.scrollHeight;
}

function fetchJSONData(file_path) {
    return fetch(file_path)
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP Error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            return data;
        })
        .catch((err) => {
            console.error("Unable to fetch data:", err);
            return null;
        });
}

async function getAreas() {
    const data = await fetchJSONData('../static/JSON/pathogen-protocol.json');
    if (data) {
        return data.areas;
    } else {
        console.error("Failed to retrieve areas");
        return null;
    }
}

async function getPolicies() {
    const data = await fetchJSONData('../static/JSON/pathogen-protocol.json');
    if (data) {
        return data.policies;
    } else {
        console.error("Failed to retrieve policies");
        return null;
    }
}

let lastEventDay = 0;

async function getEvents() {
    const data = await fetchJSONData('../static/JSON/pathogen-protocol.json');
    if (data) {
        return data.events;
    } else {
        console.error("Failed to retrieve events");
        return null;
    }
}

function checkAndApplyEvents(events) {
    if (day - lastEventDay < 5 && day > 5) {
        return;
    }

    const eligibleEvents = events.filter(event => {
        try {
            return eval(event.condition);
        } catch (error) {
            console.error(`Error evaluating condition for event ${event.name}:`, error);
            return false;
        }
    });

    if (eligibleEvents.length > 0) {
        const event = eligibleEvents[Math.floor(Math.random() * eligibleEvents.length)];

        if (event.effect.money !== undefined) {
            money += event.effect.money;
        }
        if (event.effect.happiness !== undefined) {
            happiness += event.effect.happiness;
        }
        if (event.effect.viralRate !== undefined) {
            areas.forEach(area => function () {
                area.viralRate += event.effect.viralRate;
                area.viralRate = Math.max(0, area.viralRate)
            });
        }

        send_event_alert(`${event.name}: ${event.description}\n${event.effect.money ? event.effect.money > 0 ? `\nMoney increased by ${event.effect.money}` : `\nMoney decreased by ${Math.abs(event.effect.money)}` : ""}${event.effect.happiness ? event.effect.happiness >= 0 ? `\nHappiness increased by ${event.effect.happiness}` : `\nHappiness decreased by ${Math.abs(event.effect.happiness)}` : ""}${event.effect.viralRate ? event.effect.viralRate >= 0 ? `\nInfection Rates increased by ${event.effect.viralRate}%` : `\nInfection Rates decreased by ${Math.abs(event.effect.viralRate)}%` : ""}`);

        lastEventDay = day;
    }
}

function drawMap(areas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    areas.forEach(area => {
        if (area.population == 0) {
            ctx.fillStyle = 'grey'
        } else if (area.viralRate == 0) {
            ctx.fillStyle = 'green';
        } else if (area.viralRate >= 0 && area.viralRate < 40) {
            ctx.fillStyle = 'yellow';
        } else if (area.viralRate >= 40 && area.viralRate < 80) {
            ctx.fillStyle = 'orange';
        } else if (area.viralRate >= 80) {
            ctx.fillStyle = 'red';
        }
        ctx.beginPath();
        ctx.arc(area.x, area.y, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();

        ctx.fillStyle = 'black';
        ctx.font = "1.5rem Arial";
        ctx.fillText(area.name, area.x, area.y + 50);
        ctx.fillText(`Population: ${area.population}`, area.x - 10, area.y + 70);
    });
}

function addPolicies(policies, reseaching1, reseaching2) {
    let researchedPolicies = policies.filter((policy) => policy.researched);

    researchedPolicies.forEach((policy) => {
        const policyDiv = document.createElement('div');
        policyDiv.style.backgroundColor = 'cornflowerblue';
        policyDiv.style.width = '80%';
        policyDiv.style.margin = '20px auto';
        policyDiv.style.border = '4px solid green';
        policyDiv.id = `policy_${policy.id}`;
        policyDiv.innerHTML =
            `
            <p style="font-size: 1.5rem; color: white; font-family: Arial, Helvetica, sans-serif; text-align: center; margin:10px">
                <b>${policy.name}</b>
            </p>
            <p style="font-size: 1rem; color: black; font-family: Arial, Helvetica, sans-serif; text-align: center; margin: 10px">
                <b>${policy.description}</b>
            </p>
            `;

        if (policy.using) {
            policyDiv.style.border = "4px solid blue"
        }

        policyDiv.addEventListener('mouseover', function (event) {
            tooltip_head.innerText = `Cost: ${policy.cost}`;
            tooltip_desc.innerText = `Happiness: ${policy.happiness}\nEffectiveness: ${policy.effectiveness}`;
            tooltip.style.visibility = 'visible';
        });

        policyDiv.addEventListener('mousemove', function (event) {
            tooltip.style.top = `${event.clientY + 10}px`;
            tooltip.style.left = `${event.clientX + 10}px`;
        });

        policyDiv.addEventListener('mouseleave', function (event) {
            tooltip.style.visibility = 'hidden';
        });

        policyDiv.addEventListener('click', function (event) {
            if (policy.researched) {
                if (day < 5) {
                    send_event_alert("You can only implement policies after Day 5.");
                    return;
                }
                if (money >= policy.cost) {
                    money -= policy.cost;
                    policy.using = true
                    send_event_alert(`${policy.name} has been implemented.`, "lightblue");
                    happiness += policy.happiness
                    policyDiv.style.border = '4px solid blue';
                    stats.innerHTML = `Day: ${day} &emsp; Population: ${population} &emsp; Happiness: ${happiness} &emsp; Money: ${money}`;
                } else {
                    send_event_alert("You are too poor to buy this.");
                }
                return;
            }

            const completeResearch = () => {
                policy.researched = true;
                policyDiv.style.border = '4px solid green';
                send_event_alert(`${policy.name} research completed!`, "orange");
                research1 = research1 === policy ? null : research1;
                research2 = research2 === policy ? null : research2;
            };

            if (!research1) {
                research1 = policy;
                policyDiv.style.border = '4px solid orange';
                send_event_alert(`Research started on ${policy.name}`, "orange");
                setTimeout(completeResearch, 49500);
            } else if (!research2) {
                research2 = policy;
                policyDiv.style.border = '4px solid orange';
                send_event_alert(`Research started on ${policy.name}`, "orange");
                setTimeout(completeResearch, 49500);
            } else {
                send_event_alert("You can only research 2 policies at once.");
            }
        });

        policyContainer.appendChild(policyDiv);
    });

    let unresearchedPolicies = policies.filter((policy) => !policy.researched);

    unresearchedPolicies.forEach((policy) => {
        const policyDiv = document.createElement('div');
        policyDiv.style.backgroundColor = 'cornflowerblue';
        policyDiv.style.width = '80%';
        policyDiv.style.margin = '20px auto';
        policyDiv.id = `policy_${policy.id}`;
        policyDiv.innerHTML = `
            <p style="font-size: 1.5rem; color: white; font-family: Arial, Helvetica, sans-serif; text-align: center; margin:10px">
                <b>${policy.name}</b>
            </p>
            <p style="font-size: 1rem; color: black; font-family: Arial, Helvetica, sans-serif; text-align: center; margin: 10px">
                <b>${policy.description}</b>
            </p>`;

        if (policy == reseaching1 || policy == reseaching2) {
            policyDiv.style.border = "4px solid orange"
        }

        policyContainer.appendChild(policyDiv);
        policyDiv.addEventListener('mouseover', function (event) {
            tooltip_head.innerText = `Cost: ${policy.cost}`;
            tooltip_desc.innerText = `Happiness: ${policy.happiness}\nEffectiveness: ${policy.effectiveness}`;
            tooltip.style.visibility = 'visible';
        });

        policyDiv.addEventListener('mousemove', function (event) {
            tooltip.style.top = `${event.clientY + 10}px`;
            tooltip.style.left = `${event.clientX + 10}px`;
        });

        policyDiv.addEventListener('mouseleave', function (event) {
            tooltip.style.visibility = 'hidden';
        });

        policyDiv.addEventListener('click', function (event) {
            if (policy.researched) {
                if (day < 5) {
                    send_event_alert("You can only implement policies after Day 5.");
                    return;
                }
                if (policy.using) return send_event_alert('You have already implemented this policy...')
                if (money >= policy.cost && !policy.using) {
                    money -= policy.cost;
                    policy.using = true
                    send_event_alert(`${policy.name} has been implemented.`, "lightblue");
                    happiness += policy.happiness

                    policyDiv.style.border = '4px solid blue';
                    stats.innerHTML = `Day: ${day} &emsp; Population: ${population} &emsp; Happiness: ${happiness} &emsp; Money: ${money}`;
                } else {
                    send_event_alert("You are too poor to buy this.");
                }
                return;
            }

            const completeResearch = () => {
                policy.researched = true;
                policyDiv.style.border = '4px solid green';
                send_event_alert(`${policy.name} research completed!`, "orange");
                research1 = research1 === policy ? null : research1;
                research2 = research2 === policy ? null : research2;
            };

            if (!research1) {
                research1 = policy;
                policyDiv.style.border = '4px solid orange';
                send_event_alert(`Research started on ${policy.name}`, "orange");
                setTimeout(completeResearch, 49500);
            } else if (!research2) {
                research2 = policy;
                policyDiv.style.border = '4px solid orange';
                send_event_alert(`Research started on ${policy.name}`, "orange");
                setTimeout(completeResearch, 49500);
            } else {
                send_event_alert("You can only research 2 policies at once.");
            }
        });

        policyContainer.appendChild(policyDiv);
    });
}

function calculateVirusRate(areas) {
    let infectedCount = areas.filter(area => area.infected).length;
    let averageViralRate = areas.filter(area => area.infected).reduce((sum, area) => sum + area.viralRate, 0) / (infectedCount || 1);

    return 20 + infectedCount * 2 + averageViralRate * 0.5;
}

function calculateSeverityImpact(areas) {
    let infectedAreas = areas.filter(area => area.infected);
    let totalViralRate = infectedAreas.reduce((sum, area) => sum + area.viralRate, 0);
    let averageViralRate = infectedAreas.length > 0 ? totalViralRate / infectedAreas.length : 0;

    return parseFloat((averageViralRate * 0.05).toFixed(2));
}

function infect_random_area(chance, areas) {
    if (Math.random() * 100 > chance) return;
    let uninfectedAreas = areas.filter(area => !area.infected && area.population > 0);
    if (uninfectedAreas.length > 0) {
        let randomArea = uninfectedAreas[Math.floor(Math.random() * uninfectedAreas.length)];
        randomArea.infected = true;
        randomArea.viralRate = 5
        send_event_alert(`${randomArea.name} has been infected!`, "yellow");
    }
}

function drawEndMessage(message, color) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = "6rem Arial";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function checkGameStatus() {
    let extinctCount = areas.filter(area => area.population === 0).length;
    let allHealed = areas.every(area => !area.infected);

    if (extinctCount >= 1) {
        drawEndMessage("You lost", "red");
        return true;
    }

    if (money < 0) {
        drawEndMessage("You lost", "red");
        return true;
    }

    if (happiness < 5) {
        drawEndMessage("You lost", "red");
        return true;
    }

    if (allHealed && day > 1) {
        drawEndMessage("You win", "green");
        return true;
    }

    return false;
}

function policyUsing(policyId) {
    const policy = policies.find(p => p.id === policyId);
    return policy ? policy.using : false;
}

async function gameLoop() {
    if (!areas || checkGameStatus()) return stopAudio(musicGainNode);

    let chance = calculateVirusRate(areas);

    day++;
    infect_random_area(chance, areas);

    let events = await getEvents();
    if (events) {
        checkAndApplyEvents(events);
    }

    let pop = 0;

    areas.forEach(area => {
        pop += area.population;
        let totalEffectiveness = 0;

        policies.forEach(policy => {
            if (policy.using) {
                totalEffectiveness += (policy.effectiveness * 0.25) * (1 - area.viralRate / 100);
            }
        });

        if (area.infected && area.population > 0) {
            if (totalEffectiveness > 0) {
                area.viralRate -= totalEffectiveness / (6 + area.viralRate / 50);
                area.viralRate = Math.max(0, area.viralRate)
            } else {
                area.viralRate += Math.max(3, 6 - totalEffectiveness) * (1.5 + area.viralRate / 100);
            }

            if (area.viralRate <= 0) {
                area.infected = false;
                send_event_alert(`${area.name} has been healed!`, "lightgreen");
                money += 10
            } else {
                area.population = Math.max(0, area.population - Math.floor(Math.random() * 1000 * area.viralRate / 50));
            }
            if (area.population == 0) {
                area.infected = false
                send_event_alert(`${area.name} has gone extinct...`, "red");
            }
        } else if (!area.infected) {
            area.population += Math.floor(Math.random() * 500);
        }
    });

    let infectedAreas = areas.filter(area => area.infected);
    let severityImpact = calculateSeverityImpact(areas);

    population = pop;
    happiness -= Math.round(severityImpact);

    money += Math.round(10 - infectedAreas.length - severityImpact);

    stats.innerHTML = `Day: ${day} &emsp; Population: ${population} &emsp; Happiness: ${happiness} &emsp; Money: ${money}`;
    drawMap(areas);

    policyContainer.innerHTML = ``;
    addPolicies(policies, research1, research2);

    if (happiness <= 0) {
        lose();
    }
}

async function init() {
    areas = await getAreas();
    policies = await getPolicies();
    if (areas && areas.length > 0 && policies && policies.length > 0) {

        playAudio().then(gainNode => {
            musicGainNode = gainNode;
        });

        let pop = 0;

        areas.forEach(area => {
            pop += area.population;
            if (area.infected) {
                area.population = Math.max(0, area.population - Math.floor(Math.random() * 500));
            } else {
                area.population += Math.floor(Math.random() * 500);
            }
        });

        let infectedAreas = areas.filter(area => area.infected);

        population = pop;
        happiness -= Math.round(0.5 * infectedAreas.length * 100) / 100;

        stats.innerHTML = `Day: ${day} &emsp; Population: ${population} &emsp; Happiness: ${happiness} &emsp; Money: ${money}`;

        send_event_alert("Welcome to Pathogen Protocol!");
        send_event_alert("A new virus has been found. Scientists are actively working to find the cure.")
        infect_random_area(100, areas);
        drawMap(areas);
        addPolicies(policies)

        canvas.addEventListener('mousemove', function (event) {
            const rect = canvas.getBoundingClientRect();

            const x = ((event.clientX - rect.left) / rect.width) * canvas.width;
            const y = ((event.clientY - rect.top) / rect.height) * canvas.height;

            let hoveredArea = null;

            areas.forEach((area) => {
                const boxSize = 20;
                if (
                    x >= area.x - boxSize &&
                    x <= area.x + boxSize &&
                    y >= area.y - boxSize &&
                    y <= area.y + boxSize
                ) {
                    hoveredArea = area;
                }
            });

            if (hoveredArea) {
                tooltip.style.left = `${event.clientX + 15}px`;
                tooltip.style.top = `${event.clientY + 15}px`;
                tooltip.style.visibility = 'visible';

                tooltip_head.innerText = `${hoveredArea.name}`;
                tooltip_desc.innerText = `Population: ${hoveredArea.population}\nViral Rate: ${Math.round(hoveredArea.viralRate)}%\nDeaths: ${hoveredArea.deaths || 0}`;
            } else {
                tooltip.style.visibility = 'hidden';
            }
        });

        intervalId = setInterval(gameLoop, 5000);
    }
}

const buttonWidth = 300;
const buttonHeight = 100;
const buttonX = canvas.width / 2 - buttonWidth / 2;
const buttonY = canvas.height / 2 - buttonHeight / 2;

ctx.fillStyle = '#4CAF50';
ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

ctx.strokeStyle = '#388E3C';
ctx.lineWidth = 3;
ctx.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);

ctx.fillStyle = 'white';
ctx.font = '3rem Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('Play', canvas.width / 2, canvas.height / 2);

canvas.addEventListener('click', function () {
    init()
}, { once: true })
