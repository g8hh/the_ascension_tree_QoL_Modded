class Player {
    constructor() {
        this.reset();
        // Explicitly don't reset settings in the reset() function
        this.animations = true;
        this.singleclick = false;
        this.zoomModifier = 0.5;
        this.AutoUpgrade = { unlocked: false, activated: false, interval: 0 };
        this.AutoAscension = { unlocked: false, activated: false, interval: 0 };
        this.AutoAscension_Zero = { unlocked: false, activated: false, interval: 0 };
        this.AutoAscension_More = { unlocked: false, activated: false, interval: 0, multi: 1000 };
        this.last_auto_id_upg = 0;
        this.last_auto_id_asc = 0;
        this.last_auto_id_zero = 0;
        this.last_auto_id_more = 0;
    }

    reset(seed) {
        clearInterval(AutoAscensionInterval);
        clearInterval(AutoUpgradeInterval);
        clearInterval(AutoZeroInterval);
        clearInterval(AutoMoreInterval);
        this.AutoUpgrade = { unlocked: false, activated: false, interval: 0 };
        this.AutoAscension = { unlocked: false, activated: false, interval: 0 };
        this.AutoAscension_Zero = { unlocked: false, activated: false, interval: 0 };
        this.AutoAscension_More = { unlocked: false, activated: false, interval: 0, multi: 1000 };
        this.last_auto_id_upg = 0;
        this.last_auto_id_asc = 0;
        this.last_auto_id_zero = 0;
        this.last_auto_id_more = 0;
        document.getElementById("autoupgrades-toggle").disabled = !this.AutoUpgrade.unlocked;
        document.getElementById("autoupgrades-toggle").innerText = this.AutoUpgrade.unlocked ? (this.AutoUpgrade.activated ? ("Enabled\nCurrent: " + this.AutoUpgrade.interval + "ms") : "Disabled") : "Unlock at 1e15 Points"
        document.getElementById("autoascension-toggle").disabled = !this.AutoAscension.unlocked;
        document.getElementById("autoascension-toggle").innerText = this.AutoAscension.unlocked ? (this.AutoAscension.activated ? ("Enabled\nCurrent: " + this.AutoAscension.interval + "ms") : "Disabled") : "Unlock at 1e30 Points"
        document.getElementById("autozero-toggle").disabled = !this.AutoAscension_Zero.unlocked;
        document.getElementById("autozero-toggle").innerText = this.AutoAscension_Zero.unlocked ? (this.AutoAscension_Zero.activated ? ("Enabled\nCurrent: " + this.AutoAscension_Zero.interval + "ms") : "Disabled") : "Unlock at 1e45 Points"
        document.getElementById("automore-toggle").disabled = !this.AutoAscension_More.unlocked;
        document.getElementById("automore-toggle").innerText = this.AutoAscension_More.unlocked ? (this.AutoAscension_More.activated ? ("Enabled\nCurrent: " + this.AutoAscension_More.interval + "ms\nTrigger: " + this.AutoAscension_More.multi + "x") : "Disabled") : "Unlock at 1e70 Points"
        this.last_time_ts = Date.now();

        this.seed = seed || Math.floor(Math.random() * 4294967296);
        this.incompleteSeed = false;
        document.getElementById("seedDisplay").innerText = `Seed: ${this.seed}`;
        document.getElementById("seedDisplay").className = '';

        if (this.layers) {
            for (let layer of this.layers) {
                layer.el.remove();
            }
        }
        this.layers = [];
        this.layers.push(new Layer(this.seed));

        this.current_layer = this.layers[0];
    }

    save() {
        let data = [];
        data.push(this.last_time_ts);

        let layer_data = [];
        for (let layer of this.layers) {
            layer_data.push(layer.save());
        }
        data.push(layer_data);

        data.push(this.current_layer.id);

        data.push(this.animations);
        data.push(this.singleclick);
        data.push(this.zoomModifier);
        data.push(this.seed);
        data.push(this.incompleteSeed);
        data.push(this.AutoUpgrade);
        data.push(this.AutoAscension);
        data.push(this.AutoAscension_Zero);
        data.push(this.AutoAscension_More);
        return data;
    }

    load(data) {
        clearInterval(AutoUpgradeInterval);
        clearInterval(AutoAscensionInterval);
        clearInterval(AutoZeroInterval);
        clearInterval(AutoMoreInterval);
        this.last_time_ts = data[0];

        if (data.length > 7) {
            this.seed = data[6];
            this.incompleteSeed = data[7];
        } else if (data.length > 6) {
            this.seed = data[6];
            this.incompleteSeed = true;
        } else {
            this.seed = Math.floor(Math.random() * 4294967296);
            this.incompleteSeed = true;
        }

        for (let layer of this.layers) {
            layer.el.remove();
        }
        this.layers = [];
        for (let layer of data[1]) {
            this.layers.push(new Layer(this.seed));
            this.layers[this.layers.length - 1].load(this, layer);
        }

        this.current_layer = this.layers[data[2]];
        this.animations = data.length > 3 ? data[3] : true;
        this.singleclick = data.length > 4 ? data[4] : false;
        this.zoomModifier = data.length > 5 ? data[5] : 0.5;
        this.AutoUpgrade = data.length > 8 ? data[8] : { unlocked: false, activated: false, interval: 0 };
        this.AutoAscension = data.length > 8 ? data[9] : { unlocked: false, activated: false, interval: 0 };
        this.AutoAscension_Zero = data.length > 8 ? data[10] : { unlocked: false, activated: false, interval: 0 };
        this.AutoAscension_More = data.length > 11 ? data[11] : { unlocked: false, activated: false, interval: 0, multi: 1000 };
        document.getElementById("animations-toggle").innerText = this.animations ? "Enabled" : "Disabled";
        document.getElementById("singleclick-toggle").innerText = this.singleclick ? "Single Click" : "Double Click";
        if (Object.entries(zoomOptions).find(([key, value]) => value === this.zoomModifier) !== undefined)
            document.getElementById("zoomModifier").value =
                Object.entries(zoomOptions).find(([key, value]) => value === this.zoomModifier)[0];
        document.getElementById("seedDisplay").innerText = `Seed: ${this.seed}`;
        document.getElementById("seedDisplay").className = this.incompleteSeed ? 'incompleteSeed' : '';

        document.getElementById("autoupgrades-toggle").disabled = !this.AutoUpgrade.unlocked;
        document.getElementById("autoupgrades-toggle").innerText = this.AutoUpgrade.unlocked ? (this.AutoUpgrade.activated ? ("Enabled\nCurrent: " + this.AutoUpgrade.interval + "ms") : "Disabled") : "Unlock at 1e15 Points"
        document.getElementById("autoascension-toggle").disabled = !this.AutoAscension.unlocked;
        document.getElementById("autoascension-toggle").innerText = this.AutoAscension.unlocked ? (this.AutoAscension.activated ? ("Enabled\nCurrent: " + this.AutoAscension.interval + "ms") : "Disabled") : "Unlock at 1e30 Points"
        document.getElementById("autozero-toggle").disabled = !this.AutoAscension_Zero.unlocked;
        document.getElementById("autozero-toggle").innerText = this.AutoAscension_Zero.unlocked ? (this.AutoAscension_Zero.activated ? ("Enabled\nCurrent: " + this.AutoAscension_Zero.interval + "ms") : "Disabled") : "Unlock at 1e45 Points"
        document.getElementById("automore-toggle").disabled = !this.AutoAscension_More.unlocked;
        document.getElementById("automore-toggle").innerText = this.AutoAscension_More.unlocked ? (this.AutoAscension_More.activated ? ("Enabled\nCurrent: " + this.AutoAscension_More.interval + "ms\nTrigger: " + this.AutoAscension_More.multi + "x") : "Disabled") : "Unlock at 1e70 Points"

        if (player.AutoUpgrade.activated) {
            clearInterval(AutoUpgradeInterval);
            AutoUpgradeInterval = setInterval(() => {
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
            }, player.AutoUpgrade.interval)
        }
        else clearInterval(AutoUpgradeInterval);

        if (player.AutoAscension.activated) {
            clearInterval(AutoAscensionInterval);
            AutoAscensionInterval = setInterval(() => {
                let node = document.querySelector(".ascensionAvailable");
                if (!node) return;
                for (let layer in player.layers) {
                    let intlayer = parseInt(layer)
                    if (player.layers[(intlayer + player.last_auto_id_asc) % player.layers.length].ascensionAvailable()) {
                        player.layers[(intlayer + player.last_auto_id_asc) % player.layers.length].prestige();
                        player.last_auto_id_asc = (intlayer + player.last_auto_id_asc) % player.layers.length;
                        break;
                    }
                }
            }, player.AutoAscension.interval)
        }
        else clearInterval(AutoAscensionInterval);

        if (player.AutoAscension_Zero.activated) {
            clearInterval(AutoZeroInterval);
            AutoZeroInterval = setInterval(() => {
                for (let layer in player.layers) {
                    let intlayer = parseInt(layer)
                    if (player.layers[(intlayer + player.last_auto_id_zero) % player.layers.length].calculateProduction().lte(0) && player.layers[(intlayer + player.last_auto_id_zero) % player.layers.length].canPrestige()) {
                        player.layers[(intlayer + player.last_auto_id_zero) % player.layers.length].prestige();
                        player.last_auto_id_zero = (intlayer + player.last_auto_id_zero) % player.layers.length;
                        break;
                    }
                };
            }, player.AutoAscension_Zero.interval)
        }
        else clearInterval(AutoZeroInterval);

        if (player.AutoAscension_More.activated) {
            clearInterval(AutoMoreInterval);
            AutoMoreInterval = setInterval(() => {
                for (let layer in player.layers) {
                    let intlayer = parseInt(layer)
                    if (player.layers[(intlayer + player.last_auto_id_more) % player.layers.length].points.times(player.AutoAscension_More.multi).lt(player.layers[(intlayer + player.last_auto_id_more) % player.layers.length].prestigeGain()) && !player.layers[(intlayer + player.last_auto_id_more) % player.layers.length].right_branch) {
                        player.layers[(intlayer + player.last_auto_id_more) % player.layers.length].prestige();
                        player.last_auto_id_more = (intlayer + player.last_auto_id_more) % player.layers.length;
                        break;
                    }
                };
            }, player.AutoAscension_More.interval)
        }
        else clearInterval(AutoMoreInterval);

        requestAnimationFrame(() => {
            this.current_layer.selectLayer(true, true);
        });
    }
};

