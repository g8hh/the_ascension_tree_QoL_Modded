function playerUpdate(delta) {
    player.layers[0].propagateBoost();
    if (!player.AutoUpgrade.unlocked&&player.layers[0].points.gte(1e15)){
        player.AutoUpgrade.unlocked = true;
        player.UpdateSettingButton()
    }
    if (!player.AutoAscension.unlocked&&player.layers[0].points.gte(1e30)){
        player.AutoAscension.unlocked = true;
        player.UpdateSettingButton()
    }
    if (!player.AutoAscension_Zero.unlocked&&player.layers[0].points.gte(1e45)){
        player.AutoAscension_Zero.unlocked = true;
        player.UpdateSettingButton()
    }
    if (!player.AutoAscension_More.unlocked&&player.layers[0].points.gte(1e70)){
        player.AutoAscension_More.unlocked = true;
        player.UpdateSettingButton()
    }
    for (let layer of player.layers) {
        layer.processTimedelta(delta);
    }
}