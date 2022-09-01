function playerUpdate(delta) {
    player.layers[0].propagateBoost();
    if (!player.AutoUpgrade.unlocked&&player.layers[0].points.gte(1e15)){
        player.AutoUpgrade.unlocked = true;
        document.getElementById("autoupgrades-toggle").disabled = !player.AutoUpgrade.unlocked;
        document.getElementById("autoupgrades-toggle").innerText = player.AutoUpgrade.unlocked ? (player.AutoUpgrade.activated?("Enabled\nCurrent: "+player.AutoUpgrade.interval+"ms"):"Disabled") :"Unlock at 1e15 Points"
    }
    if (!player.AutoAscension.unlocked&&player.layers[0].points.gte(1e30)){
        player.AutoAscension.unlocked = true;
        document.getElementById("autoascension-toggle").disabled = !player.AutoAscension.unlocked;
        document.getElementById("autoascension-toggle").innerText = player.AutoAscension.unlocked ? (player.AutoAscension.activated?("Enabled\nCurrent: "+player.AutoAscension.interval+"ms"):"Disabled") :"Unlock at 1e30 Points"
    }
    if (!player.AutoAscension_Zero.unlocked&&player.layers[0].points.gte(1e45)){
        player.AutoAscension_Zero.unlocked = true;
        document.getElementById("autozero-toggle").disabled = !player.AutoAscension_Zero.unlocked;
        document.getElementById("autozero-toggle").innerText = player.AutoAscension_Zero.unlocked ? (player.AutoAscension_Zero.activated?("Enabled\nCurrent: "+player.AutoAscension_Zero.interval+"ms"):"Disabled") :"Unlock at 1e45 Points"
    }
    if (!player.AutoAscension_More.unlocked&&player.layers[0].points.gte(1e70)){
        player.AutoAscension_More.unlocked = true;
        document.getElementById("automore-toggle").disabled = !player.AutoAscension_More.unlocked;
        document.getElementById("automore-toggle").innerText = player.AutoAscension_More.unlocked ? (player.AutoAscension_More.activated?("Enabled\nCurrent: "+player.AutoAscension_More.interval+"ms\nTrigger: "+player.AutoAscension_More.multi+"x"):"Disabled") :"Unlock at 1e70 Points"
    }
    for (let layer of player.layers) {
        layer.processTimedelta(delta);
    }
}