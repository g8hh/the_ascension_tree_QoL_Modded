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
    player.UpdateSettingButton()
});
document.getElementById("singleclick-toggle").addEventListener("click", () => {
    player.singleclick = !player.singleclick;
    player.UpdateSettingButton()
});
document.getElementById("hard-reset").addEventListener("click", () => {
    const input = window.prompt(player.isChinese?"输入一个种子, 或者留空来采用随机种子:":"Input a seed, or leave blank for a random one:");
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
    const input = window.prompt(player.isChinese?("输入自动购买时间间隔(单位毫秒)。留空自动采纳能采用的最小时间间隔。输入零或负数以关闭自动购买器。\n当前可用最小时间间隔: "+mininterval+"ms"):("Input interval (ms). Leave blank to apply min interval available. Input zero or negative number to disable Autobuyer.\nCurrently min interval: "+mininterval+"ms"))
    if (input === ""){
        player.AutoUpgrade.interval = mininterval;
        player.AutoUpgrade.activated = true;
    } else {
        const inputNumber = parseInt(input);
        if (inputNumber <= 0){
            player.AutoUpgrade.interval = 0;
            player.AutoUpgrade.activated = false;
        } else if (!isNaN(inputNumber)) {
            player.AutoUpgrade.interval = Math.max(inputNumber,mininterval);
            player.AutoUpgrade.activated = true;
        }
    }

    player.UpdateSettingButton()

    if (player.AutoUpgrade.activated){
        clearInterval(AutoUpgradeInterval)
        AutoUpgradeInterval = setInterval(UpgIntervalFunc, player.AutoUpgrade.interval)
    }
    else clearInterval(AutoUpgradeInterval);
});

document.getElementById("autoascension-toggle").addEventListener("click",() => {
    let mininterval = new Decimal(5*60*1000).div(player.layers[0].points.max(1).log10().sub(30).pow(0.95).max(1));
    mininterval = Math.max(Math.round(mininterval.toNumber()),500);
    const input = window.prompt(player.isChinese?("输入自动飞升时间间隔(单位毫秒)。留空自动采纳能采用的最小时间间隔。输入零或负数以关闭自动飞升器。\n当前可用最小时间间隔: "+mininterval+"ms"):("Input interval (ms). Leave blank to apply min interval available. Input zero or negative number to disable Autobuyer.\nCurrently min interval: "+mininterval+"ms"))
    if (input === ""){
        player.AutoAscension.interval = mininterval;
        player.AutoAscension.activated = true;
    } else {
        const inputNumber = parseInt(input);
        if (inputNumber <= 0){
            player.AutoAscension.interval = 0;
            player.AutoAscension.activated = false;
        } else if (!isNaN(inputNumber)) {
            player.AutoAscension.interval = Math.max(inputNumber,mininterval);;
            player.AutoAscension.activated = true;
        }
    }

    player.UpdateSettingButton()

    if (player.AutoAscension.activated){
        clearInterval(AutoAscensionInterval);
        AutoAscensionInterval = setInterval(AscIntervalFunc, player.AutoAscension.interval)
    }
    else clearInterval(AutoAscensionInterval);
});

document.getElementById("autozero-toggle").addEventListener("click",() => {
    let mininterval = new Decimal(7.5*60*1000).div(player.layers[0].points.max(1).log10().sub(45).pow(0.9).max(1));
    mininterval = Math.max(Math.round(mininterval.toNumber()),1000);
    const input = window.prompt(player.isChinese?("输入自动飞升时间间隔(单位毫秒)。留空自动采纳能采用的最小时间间隔。输入零或负数以关闭无点数产出层的自动飞升器。\n当前可用最小时间间隔: "+mininterval+"ms"):("Input interval (ms). Leave blank to apply min interval available. Input zero or negative number to disable Auto Ascension for non-generation layers.\nCurrently min interval: "+mininterval+"ms"))
    if (input === ""){
        player.AutoAscension_Zero.interval = mininterval;
        player.AutoAscension_Zero.activated = true;
    } else {
        const inputNumber = parseInt(input);
        if (inputNumber <= 0){
            player.AutoAscension_Zero.interval = 0;
            player.AutoAscension_Zero.activated = false;
        } else if (!isNaN(inputNumber)) {
            player.AutoAscension_Zero.interval = Math.max(inputNumber,mininterval);
            player.AutoAscension_Zero.activated = true;
        }
    }

    player.UpdateSettingButton()

    if (player.AutoAscension_Zero.activated){
        clearInterval(AutoZeroInterval);
        AutoZeroInterval = setInterval(ZeroIntervalFunc, player.AutoAscension_Zero.interval)
    }
    else clearInterval(AutoZeroInterval);
});

document.getElementById("automore-toggle").addEventListener("click",() => {
    let mininterval = new Decimal(10*60*1000).div(player.layers[0].points.max(1).log10().sub(70).pow(0.85).max(1));
    mininterval = Math.max(Math.round(mininterval.toNumber()),1000);
    const input = window.prompt(player.isChinese?("输入自动飞升时间间隔(单位毫秒)。留空自动采纳能采用的最小时间间隔。输入零或负数以关闭少点数产出层的自动飞升器。\n当前可用最小时间间隔: "+mininterval+"ms"):("Input interval (ms). Leave blank to apply min interval available. Input zero or negative number to disable Auto Ascension for less-prestige-gain layers.\nCurrently min interval: "+mininterval+"ms"))
    if (input === ""){
        player.AutoAscension_More.interval = mininterval;
        player.AutoAscension_More.activated = true;
    } else {
        const inputNumber = parseInt(input);
        if (inputNumber <= 0){
            player.AutoAscension_More.interval = 0;
            player.AutoAscension_More.activated = false;
        } else if (!isNaN(inputNumber)) {
            player.AutoAscension_More.interval = Math.max(inputNumber,mininterval);
            player.AutoAscension_More.activated = true;
        }
    }
    const multiinput = window.prompt(player.isChinese?"输入触发阈值。当飞升可获得点数达到当前层点数的阈值倍数时自动飞升。最少为0。":"Input trigger mult. This will determine Auto ascend when prestige gain reaches layer currency mults mult. At least 0.")
    const multinum = parseFloat(multiinput)
    if (!isNaN(multinum)) player.AutoAscension_More.multi = Math.max(multinum,0);
    

    player.UpdateSettingButton()

    if (player.AutoAscension_More.activated){
        clearInterval(AutoMoreInterval);
        AutoMoreInterval = setInterval(MoreIntervalFunc, player.AutoAscension_More.interval)
    }
    else clearInterval(AutoMoreInterval);
});

document.getElementById("language-toggle").addEventListener("click",()=>{
    player.isChinese = !player.isChinese;
    //所有不是每刻叫的闲杂人等全都在这里再更新一遍(qtmd)
    player.UpdateSettingButton();
    player.StaticTranslation();
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
