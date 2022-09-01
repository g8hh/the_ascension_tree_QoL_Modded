class Player {
    constructor() {
        this.reset();
        // Explicitly don't reset settings in the reset() function
        this.animations = true;
        this.singleclick = false;
        this.zoomModifier = 0.5;
        this.AutoUpgrade = {unlocked:false,activated:false,interval:0};
        this.AutoAscension = {unlocked:false,activated:false,interval:0};
        this.AutoAscension_Zero = {unlocked:false,activated:false,interval:0};
    }

    reset(seed) {
        clearInterval(AutoAscensionInterval);
        clearInterval(AutoUpgradeInterval);
        clearInterval(AutoZeroInterval);
        this.AutoUpgrade = {unlocked:false,activated:false,interval:0};
        this.AutoAscension = {unlocked:false,activated:false,interval:0};
        this.AutoAscension_Zero = {unlocked:false,activated:false,interval:0};
        document.getElementById("autoupgrades-toggle").disabled = !this.AutoUpgrade.unlocked;
        document.getElementById("autoupgrades-toggle").innerText = this.AutoUpgrade.unlocked ? (this.AutoUpgrade.activated?("Enabled\nCurrent: "+this.AutoUpgrade.interval+"ms"):"Disabled") :"Unlock at 1e15 Points"
        document.getElementById("autoascension-toggle").disabled = !this.AutoAscension.unlocked;
        document.getElementById("autoascension-toggle").innerText = this.AutoAscension.unlocked ? (this.AutoAscension.activated?("Enabled\nCurrent: "+this.AutoAscension.interval+"ms"):"Disabled") :"Unlock at 1e30 Points"
        document.getElementById("autozero-toggle").disabled = !this.AutoAscension_Zero.unlocked;
        document.getElementById("autozero-toggle").innerText = this.AutoAscension_Zero.unlocked ? (this.AutoAscension_Zero.activated?("Enabled\nCurrent: "+this.AutoAscension_Zero.interval+"ms"):"Disabled") :"Unlock at 1e45 Points"
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
        return data;
    }

    load(data) {
        clearInterval();
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
        this.AutoUpgrade = data.length > 8 ? data[8]: {unlocked:false,activated:false,interval:0};
        this.AutoAscension = data.length > 8 ? data[9]: {unlocked:false,activated:false,interval:0};
        this.AutoAscension_Zero = data.length > 8 ? data[10]: {unlocked:false,activated:false,interval:0};
        document.getElementById("animations-toggle").innerText = this.animations ? "Enabled" : "Disabled";
        document.getElementById("singleclick-toggle").innerText = this.singleclick ? "Single Click" : "Double Click";
        if (Object.entries(zoomOptions).find(([key, value]) => value === this.zoomModifier) !== undefined)
            document.getElementById("zoomModifier").value =
                Object.entries(zoomOptions).find(([key, value]) => value === this.zoomModifier)[0];
        document.getElementById("seedDisplay").innerText = `Seed: ${this.seed}`;
        document.getElementById("seedDisplay").className = this.incompleteSeed ? 'incompleteSeed' : '';

        document.getElementById("autoupgrades-toggle").disabled = !this.AutoUpgrade.unlocked;
        document.getElementById("autoupgrades-toggle").innerText = this.AutoUpgrade.unlocked ? (this.AutoUpgrade.activated?("Enabled\nCurrent: "+this.AutoUpgrade.interval+"ms"):"Disabled") :"Unlock at 1e15 Points"
        document.getElementById("autoascension-toggle").disabled = !this.AutoAscension.unlocked;
        document.getElementById("autoascension-toggle").innerText = this.AutoAscension.unlocked ? (this.AutoAscension.activated?("Enabled\nCurrent: "+this.AutoAscension.interval+"ms"):"Disabled") :"Unlock at 1e30 Points"
        document.getElementById("autozero-toggle").disabled = !this.AutoAscension_Zero.unlocked;
        document.getElementById("autozero-toggle").innerText = this.AutoAscension_Zero.unlocked ? (this.AutoAscension_Zero.activated?("Enabled\nCurrent: "+this.AutoAscension_Zero.interval+"ms"):"Disabled") :"Unlock at 1e45 Points"

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

        if (player.AutoAscension.activated){
            AutoAscensionInterval = setInterval(() => {
                let node = document.querySelector(".ascensionAvailable");
                if (!node) return;
                node.click();
                player.current_layer.prestige();
            }, player.AutoAscension.interval)
        }
        else clearInterval(AutoAscensionInterval);

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

        requestAnimationFrame(() => {
            this.current_layer.selectLayer(true, true);
        });
    }
};

