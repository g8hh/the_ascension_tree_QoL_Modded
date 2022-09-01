var player = new Player();
var AutoUpgradeInterval;
var AutoAscensionInterval;
var AutoZeroInterval;
var AutoMoreInterval

let last_local_save = -1;

function gameLoop() {
    let current_time = Date.now();

    if (last_local_save < current_time - 1000) {
        if (last_local_save == -1) local_load();
        else local_save();
        last_local_save = current_time;
    }

    let delta = current_time - player.last_time_ts;
    player.last_time_ts = current_time;

    playerUpdate(delta);
    screenUpdate();

    setTimeout(gameLoop, 50);
}

var tree = document.getElementById("tree");
var panzoom = Panzoom(tree, { canvas: true, maxScale: 1e100, step: 1 })
tree.parentElement.addEventListener('wheel', panzoom.zoomWithWheel);

window.addEventListener("resize", () => player.current_layer.selectLayer(true, true));

var settingsContainer = document.getElementById("settings-container");
var zoomOptions = {
    "-3": .15,
    "-2": .2,
    "-1": .3,
    "0": .5,
    "1": 1,
    "2": 2,
    "3": 4
}
document.getElementById("zoomModifier").addEventListener("input", e => {
    player.zoomModifier = zoomOptions[e.currentTarget.value];
    player.current_layer.selectLayer();
});
document.getElementById("settings-toggle").addEventListener("click", () => {
    settingsContainer.style.visibility = settingsContainer.style.visibility === 'hidden' ? '' : 'hidden';
});
document.getElementById("animations-toggle").addEventListener("click", () => {
    player.animations = !player.animations;
    document.getElementById("animations-toggle").innerText = player.animations ? "Enabled" : "Disabled";
});
document.getElementById("singleclick-toggle").addEventListener("click", () => {
    player.singleclick = !player.singleclick;
    document.getElementById("singleclick-toggle").innerText = player.singleclick ? "Single Click" : "Double Click";
});
document.getElementById("hard-reset").addEventListener("click", () => {
    const input = window.prompt("Input a seed, or leave blank for a random one:");
    if (input === "") {
        hard_reset();
    } else {
        const inputNumber = parseInt(input);
        if (inputNumber !== NaN && inputNumber >= 0 && inputNumber < 2 ** 32) {
            hard_reset(Math.floor(inputNumber));
        }
    }
});

document.getElementById("autoupgrades-toggle").addEventListener("click", () => {
    let mininterval = new Decimal(60000).div(player.layers[0].points.max(1).log10().sub(15).max(1));
    mininterval = Math.max(Math.round(mininterval.toNumber()),100);
    const input = window.prompt("Input interval (ms). Leave blank to apply min interval available. Input zero or negative number to disable Autobuyer.\nCurrently min interval: "+mininterval+"ms")
    if (input === ""){
        player.AutoUpgrade.interval = mininterval;
        player.AutoUpgrade.activated = true;
    } else {
        const inputNumber = parseInt(input);
        if (inputNumber <= 0){
            player.AutoUpgrade.interval = 0;
            player.AutoUpgrade.activated = false;
        } else if (inputNumber !== NaN) {
            player.AutoUpgrade.interval = Math.max(inputNumber,mininterval);
            player.AutoUpgrade.activated = true;
        }
    }

    document.getElementById("autoupgrades-toggle").disabled = !player.AutoUpgrade.unlocked;
    document.getElementById("autoupgrades-toggle").innerText = player.AutoUpgrade.unlocked ? (player.AutoUpgrade.activated?("Enabled\nCurrent: "+player.AutoUpgrade.interval+"ms"):"Disabled") :"Unlock at 1e15 Points"

    if (player.AutoUpgrade.activated){
        AutoUpgradeInterval = setInterval(() => {
            let node = document.querySelector(".purchaseAvailable");
            if (!node) return;
            node.click();
            player.current_layer.buyLeft();
            player.current_layer.buyRight();
            document.querySelectorAll(".upgrade:not(.complete):not(:disabled)").forEach(n => n.click());
        }, player.AutoUpgrade.interval)
    }
    else clearInterval(AutoUpgradeInterval);
});

document.getElementById("autoascension-toggle").addEventListener("click",() => {
    let mininterval = new Decimal(5*60*1000).div(player.layers[0].points.max(1).log10().sub(30).pow(0.95).max(1));
    mininterval = Math.max(Math.round(mininterval.toNumber()),500);
    const input = window.prompt("Input interval (ms). Leave blank to apply min interval available. Input zero or negative number to disable Auto Ascension.\nCurrently min interval: "+mininterval+"ms")
    if (input === ""){
        player.AutoAscension.interval = mininterval;
        player.AutoAscension.activated = true;
    } else {
        const inputNumber = parseInt(input);
        if (inputNumber <= 0){
            player.AutoAscension.interval = 0;
            player.AutoAscension.activated = false;
        } else if (inputNumber !== NaN) {
            player.AutoAscension.interval = Math.max(inputNumber,mininterval);;
            player.AutoAscension.activated = true;
        }
    }

    document.getElementById("autoascension-toggle").disabled = !player.AutoAscension.unlocked;
    document.getElementById("autoascension-toggle").innerText = player.AutoAscension.unlocked ? (player.AutoAscension.activated?("Enabled\nCurrent: "+player.AutoAscension.interval+"ms"):"Disabled") :"Unlock at 1e30 Points"

    if (player.AutoAscension.activated){
        AutoAscensionInterval = setInterval(() => {
            let node = document.querySelector(".ascensionAvailable");
            if (!node) return;
            node.click();
            player.current_layer.prestige();
        }, player.AutoAscension.interval)
    }
    else clearInterval(AutoAscensionInterval);
});

document.getElementById("autozero-toggle").addEventListener("click",() => {
    let mininterval = new Decimal(7.5*60*1000).div(player.layers[0].points.max(1).log10().sub(45).pow(0.9).max(1));
    mininterval = Math.max(Math.round(mininterval.toNumber()),1000);
    const input = window.prompt("Input interval (ms). Leave blank to apply min interval available. Input zero or negative number to disable Auto Ascension for non-generation layers.\nCurrently min interval: "+mininterval+"ms")
    if (input === ""){
        player.AutoAscension_Zero.interval = mininterval;
        player.AutoAscension_Zero.activated = true;
    } else {
        const inputNumber = parseInt(input);
        if (inputNumber <= 0){
            player.AutoAscension_Zero.interval = 0;
            player.AutoAscension_Zero.activated = false;
        } else if (inputNumber !== NaN) {
            player.AutoAscension_Zero.interval = Math.max(inputNumber,mininterval);;
            player.AutoAscension_Zero.activated = true;
        }
    }

    document.getElementById("autozero-toggle").disabled = !player.AutoAscension_Zero.unlocked;
    document.getElementById("autozero-toggle").innerText = player.AutoAscension_Zero.unlocked ? (player.AutoAscension_Zero.activated?("Enabled\nCurrent: "+player.AutoAscension_Zero.interval+"ms"):"Disabled") :"Unlock at 1e45 Points"

    if (player.AutoAscension_Zero.activated){
        AutoZeroInterval = setInterval(() => {
            let foundbool = false;
            for (let layer in player.layers)
                if (player.layers[layer].calculateProduction().lte(0)&&player.layers[layer].canPrestige())
                {
                    player.layers[layer].selectLayer();
                    foundbool = true;
                    break;
                };
            if (foundbool) player.current_layer.prestige();
        }, player.AutoAscension_Zero.interval)
    }
    else clearInterval(AutoZeroInterval);
});

document.getElementById("automore-toggle").addEventListener("click",() => {
    let mininterval = new Decimal(10*60*1000).div(player.layers[0].points.max(1).log10().sub(70).pow(0.85).max(1));
    mininterval = Math.max(Math.round(mininterval.toNumber()),1000);
    const input = window.prompt("Input interval (ms). Leave blank to apply min interval available. Input zero or negative number to disable Auto Ascension for non-generation layers.\nCurrently min interval: "+mininterval+"ms")
    if (input === ""){
        player.AutoAscension_More.interval = mininterval;
        player.AutoAscension_More.activated = true;
    } else {
        const inputNumber = parseInt(input);
        if (inputNumber <= 0){
            player.AutoAscension_More.interval = 0;
            player.AutoAscension_More.activated = false;
        } else if (inputNumber !== NaN) {
            player.AutoAscension_More.interval = Math.max(inputNumber,mininterval);;
            player.AutoAscension_More.activated = true;
        }
    }
    const multiinput = window.prompt("Input trigger mult. At least 1.")
    if (multiinput === "") player.AutoAscension_More.multi = 1000;
    else{
        const multinum = parseInt(multiinput)
        if (multinum!==NaN) player.AutoAscension_More.multi = Math.max(multinum,1);
    }

    document.getElementById("automore-toggle").disabled = !player.AutoAscension_More.unlocked;
    document.getElementById("automore-toggle").innerText = player.AutoAscension_More.unlocked ? (player.AutoAscension_More.activated?("Enabled\nCurrent: "+player.AutoAscension_More.interval+"ms\nTrigger: "+player.AutoAscension_More.multi+"x"):"Disabled") :"Unlock at 1e70 Points"

    if (player.AutoAscension_More.activated){
        AutoMoreInterval = setInterval(() => {
            let foundbool = false;
            for (let layer in player.layers)
                if (player.layers[layer].points.times(player.AutoAscension_More.multi).lte(player.layers[layer].prestigeGain())&&!player.layers[layer].right_branch)
                {
                    player.layers[layer].selectLayer();
                    foundbool = true;
                    break;
                };
            if (foundbool) player.current_layer.prestige();
        }, player.AutoAscension_More.interval)
    }
    else clearInterval(AutoMoreInterval);
});

document.addEventListener('keydown', e => {
    if ((e.code === 'KeyW' || e.code === 'ArrowUp') && player.current_layer.parent_layer !== undefined) {
        player.current_layer.parent_layer.selectLayer(true);
    }
    if ((e.code === 'KeyA' || e.code === 'ArrowLeft') && player.current_layer.child_left !== undefined) {
        player.current_layer.child_left.selectLayer(true);
    }
    if ((e.code === 'KeyD' || e.code === 'ArrowRight') && player.current_layer.child_right !== undefined) {
        player.current_layer.child_right.selectLayer(true);
    }
    if (e.code === 'KeyP' && player.current_layer.canPrestige()) {
        player.current_layer.prestige();
    }
    if (e.code === 'KeyM') {
        for (let upgrade of Object.values(player.current_layer.upgrades)) {
            if (upgrade.bought) {
                continue;
            } else if (upgrade.canBuy()) {
                upgrade.buy();
            } else {
                break;
            }
        }
        player.current_layer.buyLeft();
        player.current_layer.buyRight();
    }
    if (e.code === 'Space' || e.code === 'ArrowDown') {
        player.current_layer.selectLayer(true);
    }
});

requestAnimationFrame(() => {
    player.current_layer.selectLayer(true, true);
    gameLoop();
});
