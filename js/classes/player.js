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
        this.isChinese = false;
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
        
        this.UpdateSettingButton() //如果想要正常使用的话，得this
        this.StaticTranslation();
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
        data.push(this.isChinese);
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
        this.isChinese = data.length > 12 ? data[12] : false;

        if (Object.entries(zoomOptions).find(([key, value]) => value === this.zoomModifier) !== undefined)
            document.getElementById("zoomModifier").value =
                Object.entries(zoomOptions).find(([key, value]) => value === this.zoomModifier)[0];
        //document.getElementById("seedDisplay").innerText = this.isChinese?`种子: ${this.seed}`:`Seed: ${this.seed}`;
        document.getElementById("seedDisplay").className = this.incompleteSeed ? 'incompleteSeed' : '';


        if (player.AutoUpgrade.activated) {
            clearInterval(AutoUpgradeInterval);
            AutoUpgradeInterval = setInterval(UpgIntervalFunc, player.AutoUpgrade.interval)
        }
        else clearInterval(AutoUpgradeInterval);

        if (player.AutoAscension.activated) {
            clearInterval(AutoAscensionInterval);
            AutoAscensionInterval = setInterval(AscIntervalFunc, player.AutoAscension.interval)
        }
        else clearInterval(AutoAscensionInterval);

        if (player.AutoAscension_Zero.activated) {
            clearInterval(AutoZeroInterval);
            AutoZeroInterval = setInterval(ZeroIntervalFunc, player.AutoAscension_Zero.interval)
        }
        else clearInterval(AutoZeroInterval);

        if (player.AutoAscension_More.activated) {
            clearInterval(AutoMoreInterval);
            AutoMoreInterval = setInterval(MoreIntervalFunc, player.AutoAscension_More.interval)
        }
        else clearInterval(AutoMoreInterval);

        requestAnimationFrame(() => {
            this.current_layer.selectLayer(true, true);
        });

        this.UpdateSettingButton()
        this.StaticTranslation()
    }

    //translation
    UpdateSettingButton(){
        document.getElementById("autoupgrades-toggle").disabled = !this.AutoUpgrade.unlocked;
        document.getElementById("autoascension-toggle").disabled = !this.AutoAscension.unlocked;
        document.getElementById("autozero-toggle").disabled = !this.AutoAscension_Zero.unlocked;
        document.getElementById("automore-toggle").disabled = !this.AutoAscension_More.unlocked;
        document.getElementById("language-toggle").innerText = this.isChinese ? "简体中文" : "English";
        if (this.isChinese){
            document.getElementById("animations-toggle").innerText = this.animations ? "启用" : "禁用";
            document.getElementById("singleclick-toggle").innerText = this.singleclick ? "单击层" : "双击层";
            document.getElementById("autoupgrades-toggle").innerText = this.AutoUpgrade.unlocked ? (this.AutoUpgrade.activated?("启用\n当前间隔: "+this.AutoUpgrade.interval+"ms"):"禁用") :"达到 1e15 点数以解锁"
            document.getElementById("autoascension-toggle").innerText = this.AutoAscension.unlocked ? (this.AutoAscension.activated?("启用\n当前间隔: "+this.AutoAscension.interval+"ms"):"禁用") :"达到 1e30 点数以解锁"
            document.getElementById("autozero-toggle").innerText = this.AutoAscension_Zero.unlocked ? (this.AutoAscension_Zero.activated?("启用\n当前间隔: "+this.AutoAscension_Zero.interval+"ms"):"禁用") :"达到 1e45 点数以解锁"
            document.getElementById("automore-toggle").innerText = this.AutoAscension_More.unlocked ? (this.AutoAscension_More.activated?("启用\n当前间隔: "+this.AutoAscension_More.interval+"ms\n触发阈值: "+this.AutoAscension_More.multi+"x"):"Disabled") :"达到 1e70 点数以解锁"
        }
        else{
            document.getElementById("animations-toggle").innerText = this.animations ? "Enabled" : "Disabled";
            document.getElementById("singleclick-toggle").innerText = this.singleclick ? "Single Click" : "Double Click";
            document.getElementById("autoupgrades-toggle").innerText = this.AutoUpgrade.unlocked ? (this.AutoUpgrade.activated?("Enabled\nCurrent: "+this.AutoUpgrade.interval+"ms"):"Disabled") :"Unlock at 1e15 Points"
            document.getElementById("autoascension-toggle").innerText = this.AutoAscension.unlocked ? (this.AutoAscension.activated?("Enabled\nCurrent: "+this.AutoAscension.interval+"ms"):"Disabled") :"Unlock at 1e30 Points"
            document.getElementById("autozero-toggle").innerText = this.AutoAscension_Zero.unlocked ? (this.AutoAscension_Zero.activated?("Enabled\nCurrent: "+this.AutoAscension_Zero.interval+"ms"):"Disabled") :"Unlock at 1e45 Points"
            document.getElementById("automore-toggle").innerText = this.AutoAscension_More.unlocked ? (this.AutoAscension_More.activated?("Enabled\nCurrent: "+this.AutoAscension_More.interval+"ms\nTrigger: "+this.AutoAscension_More.multi+"x"):"Disabled") :"Unlock at 1e70 Points"
        }
        
    }
    StaticTranslation(){//静态界面的翻译
        //抓取所有文本的HTML组件
        let HeadPointContainer = document.getElementsByClassName("points")[0];//排头那个大大的点数
        let HeadPointgainContainer = document.getElementsByClassName("point-gain")[0];//排头下面那个获取多少点每秒
        let Settings_Container = document.getElementById("settings-container")//设置框
        let layer_container = document.getElementById('layer_info');//层信息排头
        let credit_container = document.getElementsByClassName("credits")[0];//作者信息
        let export_modal = document.getElementsByClassName("modal-container")[0].getElementsByClassName("modal")[0]//导出框
        let import_modal = document.getElementsByClassName("modal-container")[1].getElementsByClassName("modal")[0]//导入框
        let unlock_req_container = document.getElementsByClassName("unlock-req")//所有提示解锁下两层的那个框框
        if (this.isChinese){
            HeadPointContainer.childNodes[0].textContent = '你拥有 '
            HeadPointContainer.childNodes[2].textContent = ' 点数'
    
            HeadPointgainContainer.childNodes[2].textContent = '/秒)'
    
            Settings_Container.getElementsByClassName("settings-title")[0].textContent = "设置"
            Settings_Container.getElementsByClassName("settings")[0].childNodes[0].textContent = "聚焦缩放倍数:"
            Settings_Container.getElementsByClassName("settings")[1].childNodes[0].textContent = "动画:"
            Settings_Container.getElementsByClassName("settings")[2].childNodes[0].textContent = "聚焦层方式:"
            Settings_Container.getElementsByClassName("settings")[3].childNodes[0].textContent = "自动购买升级:"
            Settings_Container.getElementsByClassName("settings")[4].childNodes[0].textContent = "当下一个升级可用时自动飞升:"
            Settings_Container.getElementsByClassName("settings")[5].childNodes[0].textContent = "当层级无点数获得时自动飞升:"
            Settings_Container.getElementsByClassName("settings")[6].childNodes[0].textContent = "当飞升可获取点数达到条件时自动飞升:"
            Settings_Container.getElementsByClassName("settings")[7].innerText = "导出"
            Settings_Container.getElementsByClassName("settings")[8].innerText = "导入"
            document.getElementById("seedDisplay").innerText = `种子: ${this.seed}`
            Settings_Container.getElementsByClassName("settings")[9].innerText = "硬重置"
            Settings_Container.getElementsByClassName("settings")[10].childNodes[0].textContent = "语言:"
            Settings_Container.childNodes[26].textContent = "版本 2022-09-07"
    
            layer_container.getElementsByClassName("upgrade")[0].getElementsByClassName("upgrade-desc")[0].textContent = "本层的升级将不被重置"
            layer_container.getElementsByClassName("upgrade")[0].getElementsByClassName("upgrade-cost")[0].childNodes[0].textContent = "花费: "
            layer_container.getElementsByClassName("title")[0].textContent = "飞升树"
            layer_container.getElementsByClassName("points")[0].childNodes[0].textContent = '你拥有 '
            layer_container.getElementsByClassName("point-gain")[0].childNodes[2].textContent = '/秒)'
            layer_container.getElementsByClassName("upgrade")[1].getElementsByClassName("upgrade-desc")[0].textContent = "每秒获得100%的飞升可获得点数"
            layer_container.getElementsByClassName("upgrade")[1].getElementsByClassName("upgrade-cost")[0].childNodes[0].textContent = "花费: "
            layer_container.getElementsByClassName("boost-from")[0].childNodes[0].textContent = "受到来自更低层的 ×"
            layer_container.getElementsByClassName("boost-from")[0].childNodes[2].textContent = " 增益"
            layer_container.getElementsByClassName("boost-to")[0].childNodes[0].textContent = "给予更高层 ×"
            layer_container.getElementsByClassName("boost-to")[0].childNodes[2].textContent = " 增益"
            layer_container.getElementsByClassName("prestige")[0].getElementsByClassName("cannot-prestige")[0].childNodes[0].textContent = "飞升"
            layer_container.getElementsByClassName("prestige")[0].getElementsByClassName("cannot-prestige")[0].childNodes[2].textContent = "需要 "
            layer_container.getElementsByClassName("prestige")[0].getElementsByClassName("can-prestige")[0].childNodes[0].textContent = "飞升以获得 "
            layer_container.getElementsByClassName("prestige")[0].getElementsByClassName("next-at")[0].childNodes[1].textContent = "下一个点数将于 "
            layer_container.getElementsByClassName("prestige")[0].getElementsByClassName("next-at")[0].appendChild(document.createTextNode(' 时获得'))//这里加了一个child，记得下面删掉，index为5
            layer_container.getElementsByClassName("title")[1].textContent = "升级"
    
            credit_container.childNodes[0].textContent = "飞升树 QoL 模组版本由 cyxw 修改。模组树QQ群: 963150347"
            credit_container.childNodes[2].textContent = "想要游玩真正的壬类设计的层级吗？来试试 Semenar 的 "
            credit_container.childNodes[3].text = "物质维度"
            credit_container.childNodes[4].textContent = " , thepaperpilot 的 "
            credit_container.childNodes[5].text = "游戏开发树"
            credit_container.childNodes[6].textContent = " 或者 cyxw 的 "
            credit_container.childNodes[7].text = "阿卡树"
            credit_container.childNodes[8].textContent = " 。"
    
            export_modal.childNodes[1].textContent = "存档为下方文本框内的内容:"
            export_modal.childNodes[5].innerText = "复制到剪贴板"
    
            import_modal.childNodes[1].textContent = "在下方文本框内复制你的存档:"
            import_modal.childNodes[5].innerText = "粘贴剪贴板的内容"
            import_modal.childNodes[7].innerText = "导入"

            for (let index in unlock_req_container) {
                let intindex = parseInt(index)
                if (isNaN(intindex))continue;
                if (unlock_req_container[intindex].style.visibility != 'hidden')
                {let layer_final_goal = this.layers[parseInt(unlock_req_container[intindex].getAttribute("layerid"))].final_goal
                let layer_points_name = this.layers[parseInt(unlock_req_container[intindex].getAttribute("layerid"))].points_name
                unlock_req_container[intindex].textContent = `达到 ${formatNumber(layer_final_goal)} ${layer_points_name ? layer_points_name + " 点数" : "点数"} 以解锁`}
            }
        }
        else{
            HeadPointContainer.childNodes[0].textContent = 'You have '
            HeadPointContainer.childNodes[2].textContent = ' points'
    
            HeadPointgainContainer.childNodes[2].textContent = '/s)'
    
            Settings_Container.getElementsByClassName("settings-title")[0].textContent = "Settings"
            Settings_Container.getElementsByClassName("settings")[0].childNodes[0].textContent = "Focus zoom modifier:"
            Settings_Container.getElementsByClassName("settings")[1].childNodes[0].textContent = "Animations:"
            Settings_Container.getElementsByClassName("settings")[2].childNodes[0].textContent = "Focus layer on:"
            Settings_Container.getElementsByClassName("settings")[3].childNodes[0].textContent = "Auto buy upgrades:"
            Settings_Container.getElementsByClassName("settings")[4].childNodes[0].textContent = "Auto ascend when next upgrade avaliable:"
            Settings_Container.getElementsByClassName("settings")[5].childNodes[0].textContent = "Auto ascend when no layer currency gaining:"
            Settings_Container.getElementsByClassName("settings")[6].childNodes[0].textContent = "Auto ascend when prestige gain reaches condition:"
            Settings_Container.getElementsByClassName("settings")[7].innerText = "Export"
            Settings_Container.getElementsByClassName("settings")[8].innerText = "Import"
            document.getElementById("seedDisplay").innerText = `Seed: ${this.seed}`
            Settings_Container.getElementsByClassName("settings")[9].innerText = "Hard Reset"
            Settings_Container.getElementsByClassName("settings")[10].childNodes[0].textContent = "Language:"
            Settings_Container.childNodes[26].textContent = "Version 2022-09-07"
    
            layer_container.getElementsByClassName("upgrade")[0].getElementsByClassName("upgrade-desc")[0].textContent = "Upgrades on this layer are never reset"
            layer_container.getElementsByClassName("upgrade")[0].getElementsByClassName("upgrade-cost")[0].childNodes[0].textContent = "Cost:"
            layer_container.getElementsByClassName("title")[0].textContent = "The Ascension Tree"
            layer_container.getElementsByClassName("points")[0].childNodes[0].textContent = 'You have '
            layer_container.getElementsByClassName("point-gain")[0].childNodes[2].textContent = '/s)'
            layer_container.getElementsByClassName("upgrade")[1].getElementsByClassName("upgrade-desc")[0].textContent = "Get 100% of gain on ascension per second"
            layer_container.getElementsByClassName("upgrade")[1].getElementsByClassName("upgrade-cost")[0].childNodes[0].textContent = "Cost:"
            layer_container.getElementsByClassName("boost-from")[0].childNodes[0].textContent = "×"
            layer_container.getElementsByClassName("boost-from")[0].childNodes[2].textContent = " from lower layers"
            layer_container.getElementsByClassName("boost-to")[0].childNodes[0].textContent = "×"
            layer_container.getElementsByClassName("boost-to")[0].childNodes[2].textContent = " to higher layers"
            layer_container.getElementsByClassName("prestige")[0].getElementsByClassName("cannot-prestige")[0].childNodes[0].textContent = "Ascend"
            layer_container.getElementsByClassName("prestige")[0].getElementsByClassName("cannot-prestige")[0].childNodes[2].textContent = "Need "
            layer_container.getElementsByClassName("prestige")[0].getElementsByClassName("can-prestige")[0].childNodes[0].textContent = "Ascend for "
            layer_container.getElementsByClassName("prestige")[0].getElementsByClassName("next-at")[0].childNodes[1].textContent = "Next at "
            if (layer_container.getElementsByClassName("prestige")[0].getElementsByClassName("next-at")[0].childNodes.length >5) layer_container.getElementsByClassName("prestige")[0].getElementsByClassName("next-at")[0].removeChild(layer_container.getElementsByClassName("prestige")[0].getElementsByClassName("next-at")[0].childNodes[5])//删掉多余的子元素
            layer_container.getElementsByClassName("title")[1].textContent = "Upgrades"
    
            credit_container.childNodes[0].textContent = "QoL Modded Version by cyxw."
            credit_container.childNodes[2].textContent = "Want a game with human-generated layers? Check out "
            credit_container.childNodes[3].text = "Matter Dimensions"
            credit_container.childNodes[4].textContent = " by Semenar, "
            credit_container.childNodes[5].text = "Game Dev Tree"
            credit_container.childNodes[6].textContent = " by thepaperpilot or "
            credit_container.childNodes[7].text = "Arctree"
            credit_container.childNodes[8].textContent = " by cyxw."
    
            export_modal.childNodes[1].textContent = "The following textbox contains your save:"
            export_modal.childNodes[5].innerText = "Copy to clipboard"
    
            import_modal.childNodes[1].textContent = "Paste your save in the following textbox:"
            import_modal.childNodes[5].innerText = "Paste from clipboard"
            import_modal.childNodes[7].innerText = "Import"

            for (let index in unlock_req_container) {
                let intindex = parseInt(index)
                if (isNaN(intindex))continue;
                if (unlock_req_container[intindex].style.visibility != 'hidden')
                {let layer_final_goal = this.layers[parseInt(unlock_req_container[intindex].getAttribute("layerid"))].final_goal
                let layer_points_name = this.layers[parseInt(unlock_req_container[intindex].getAttribute("layerid"))].points_name
                unlock_req_container[intindex].textContent = `Get ${formatNumber(layer_final_goal)} ${layer_points_name ? layer_points_name + " points" : "points"} to unlock`;}
            }
        }
    }
};

