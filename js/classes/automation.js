function UpgIntervalFunc(){
    let node = document.querySelector(".purchaseAvailable");
    if (!node) return;
    for (let layer in player.layers) {
        let intlayer = parseInt(layer)
        if (player.layers[(intlayer + player.last_auto_id_upg) % player.layers.length].purchaseAvailable()) {
            player.layers[(intlayer + player.last_auto_id_upg) % player.layers.length].buyLeft();
            player.layers[(intlayer + player.last_auto_id_upg) % player.layers.length].buyRight();
            for (let upg in player.layers[(intlayer + player.last_auto_id_upg) % player.layers.length].upgrades)
                if (!player.layers[(intlayer + player.last_auto_id_upg) % player.layers.length].upgrades[upg].bought && player.layers[(intlayer + player.last_auto_id_upg) % player.layers.length].upgrades[upg].canBuy())
                    player.layers[(intlayer + player.last_auto_id_upg) % player.layers.length].upgrades[upg].buy();
            player.last_auto_id_upg = (intlayer + player.last_auto_id_upg) % player.layers.length;
            break;
        }
    }
}

function AscIntervalFunc(){
    let node = document.querySelector(".ascensionAvailable");
    if (!node) return;
    for (let layer in player.layers) {
        let intlayer = parseInt(layer)
        if (player.layers[(intlayer + player.last_auto_id_asc) % player.layers.length].ascensionAvailable()) {
            if(player.layers[(intlayer + player.last_auto_id_asc) % player.layers.length].parent_layer != undefined)
            {
                player.layers[player.layers[(intlayer + player.last_auto_id_asc) % player.layers.length].parent_layer.id].buyLeft();
                player.layers[player.layers[(intlayer + player.last_auto_id_asc) % player.layers.length].parent_layer.id].buyRight();
                if (player.layers[(intlayer + player.last_auto_id_asc) % player.layers.length].parent_layer.parent_layer != undefined)
                {
                    let tempid = player.layers[(intlayer + player.last_auto_id_asc) % player.layers.length].parent_layer.parent_layer.id
                    player.layers[tempid].buyLeft();
                    player.layers[tempid].buyRight();
                }
            }
            if (player.layers[(intlayer + player.last_auto_id_asc) % player.layers.length].canPrestige())
            player.layers[(intlayer + player.last_auto_id_asc) % player.layers.length].prestige();
            else return;
            player.last_auto_id_asc = (intlayer + player.last_auto_id_asc) % player.layers.length;
            break;
        }
    }
}

function ZeroIntervalFunc(){
    for (let layer in player.layers) {
        let intlayer = parseInt(layer)
        if (player.layers[(intlayer + player.last_auto_id_zero) % player.layers.length].calculateProduction().lte(0) && player.layers[(intlayer + player.last_auto_id_zero) % player.layers.length].canPrestige()) {
            if(player.layers[(intlayer + player.last_auto_id_zero) % player.layers.length].parent_layer != undefined)
            {
                player.layers[player.layers[(intlayer + player.last_auto_id_zero) % player.layers.length].parent_layer.id].buyLeft();
                player.layers[player.layers[(intlayer + player.last_auto_id_zero) % player.layers.length].parent_layer.id].buyRight();
                if (player.layers[(intlayer + player.last_auto_id_zero) % player.layers.length].parent_layer.parent_layer != undefined)
                {
                    let tempid = player.layers[(intlayer + player.last_auto_id_zero) % player.layers.length].parent_layer.parent_layer.id
                    player.layers[tempid].buyLeft();
                    player.layers[tempid].buyRight();
                }
            }
            if (player.layers[(intlayer + player.last_auto_id_zero) % player.layers.length].canPrestige())
            player.layers[(intlayer + player.last_auto_id_zero) % player.layers.length].prestige();
            else return;
            player.last_auto_id_zero = (intlayer + player.last_auto_id_zero) % player.layers.length;
            break;
        }
    };
}

function MoreIntervalFunc(){
    for (let layer in player.layers) {
        let intlayer = parseInt(layer)
        if (player.layers[(intlayer + player.last_auto_id_more) % player.layers.length].points.times(player.AutoAscension_More.multi).lt(player.layers[(intlayer + player.last_auto_id_more) % player.layers.length].prestigeGain()) && !player.layers[(intlayer + player.last_auto_id_more) % player.layers.length].right_branch) {
            if(player.layers[(intlayer + player.last_auto_id_more) % player.layers.length].parent_layer != undefined)
            {
                player.layers[player.layers[(intlayer + player.last_auto_id_more) % player.layers.length].parent_layer.id].buyLeft();
                player.layers[player.layers[(intlayer + player.last_auto_id_more) % player.layers.length].parent_layer.id].buyRight();
                if (player.layers[(intlayer + player.last_auto_id_more) % player.layers.length].parent_layer.parent_layer != undefined)
                {
                    let tempid = player.layers[(intlayer + player.last_auto_id_more) % player.layers.length].parent_layer.parent_layer.id
                    player.layers[tempid].buyLeft();
                    player.layers[tempid].buyRight();
                }
            }
            if (player.layers[(intlayer + player.last_auto_id_more) % player.layers.length].canPrestige())
            player.layers[(intlayer + player.last_auto_id_more) % player.layers.length].prestige();
            else return;
            player.last_auto_id_more = (intlayer + player.last_auto_id_more) % player.layers.length;
            break;
        }
    };
}