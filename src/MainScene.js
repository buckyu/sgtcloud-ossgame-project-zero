var MainScene = cc.Scene.extend({

    ctor: function () {
        this._super();
        this.setName('main');
        // init the widgets and layout them

        this.battlePanel = new BattlePanel(this);
        //tab container in the bottom
        this.tabContainer = new TabContainer(this.battlePanel);
        this.tabContainer.setName('tab');
        this.tabContainer.setPosition(0, 0);
        this.addChild(this.tabContainer, 100);

        //battle panel in the middle
        this.battlePanel.setPosition(0, this.tabContainer.height);
        this.addChild(this.battlePanel);

        //top panel on the top
        this.topPanel = new TopPanel(this);
        this.topPanel.setName('top');
        this.topPanel.setPosition(0, this.tabContainer.height + this.battlePanel.height);
        this.addChild(this.topPanel);
        this.topPanel.refreshAll();

        this.tabContainer.showMenuLayer('main');

        // floating buff tips on the top of tab container

        var buffListNode = ccs.csLoader.createNode(res.buff_list_json);
        buffListNode.setPosition(this.battlePanel.buffList.getPosition());
        //buffListNode.setPosition((width-buffListNode.width)/2,(height-buffListNode.width)/2);
        this.battlePanel.addChild(buffListNode, 5000);
        var buffList = buffListNode.getChildByName('buff_list');
        buffList.setTouchEnabled(false);
        window.tip = new Tip(this);
        this.arentResultTip=new ArenaResultTip(this);
        (function (w) {
            w.taskPanel=new TaskPanel();
            var buffArr = [];
            customEventHelper.bindListener(EVENT.FIGHT_ARENA_BATTLE, function () {
                buffList.setVisible(false);
            });
            w.showBufferList=function(){
                buffList.setVisible(true);
            };
            function refeshBuffLayer() {
                buffList.removeAllChildren(false);
                for (var i = 0; i < buffArr.length; i++) {
                    var buff = buffArr[i];
                    var height = buff.height;
                    buff.setPositionY(height * i);
                    buffList.addChild(buff);
                }
            }
            function toggleBufflayer(time, text, icon, cb) {
                var buffLayer = new BuffLayer();
                buffLayer.setIcon(icon);
                buffLayer.setText(text);
                buffLayer.setTime(time);
                buffArr.push(buffLayer.root);
                //buffList.addChild(buffLayer.root);
                //buffList.jumpToBottom();
                refeshBuffLayer();
                var remaining = time - 1;
                //customEventHelper.sendEvent(EVENT.UPGRADE_HERO_ATTACK);
                buffLayer.root.schedule(function () {
                    if (remaining > 0) {
                        buffLayer.setTime(remaining);
                        remaining--;
                    } else {
                        var index = this.getPositionY() / this.height;
                        buffArr.splice(index, 1);
                        refeshBuffLayer();
                        this.unschedule(this.__instanceId);
                        //customEventHelper.sendEvent(EVENT.UPGRADE_HERO_ATTACK);
                        if (typeof cb === 'function')cb();
                        this.cleanup();
                    }
                }, 1, time, 1, buffLayer.root.__instanceId);
            }

            w.toggleBufflayer = toggleBufflayer;
        })(window);
    },
    onEnter: function () {
        this._super();
        //验证角色签到数据，未签到则直接打开签到面板
        Network.checkIn_createByValidate(false/*function (result) {
            if(result){
                Network.openCheckInPanel(true);
            }
        }.bind(this)*/);
        customEventHelper.sendEvent(EVENT.UPGRADE_HERO_ATTACK);

        var guideLayer = new sz.GuideLayer(this, guideConfig);
        this.addChild(guideLayer, 1000);
    }
});
