// Setting Menu for the custom lightData values.
export class LightsHUDMenuSettings extends FormApplication {
    lightType;

    constructor(lightType){
        super();
        this.lightType = lightType ?? "";
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "LightsHUD Custom values";
        options.template = "modules/LightsHUD/templates/LightsHUDSettingsSubmenu.html";
        options.width = 500;
        return options;
    }
      get title() {
        return game.i18n.localize('LightsHUD Custom LightData Form');
    }

    activateListeners(html) {
        
        super.activateListeners(html);
        html.find('button').on('click', async (event) => {
            if (event.currentTarget?.dataset?.action === 'reset') {
                if (confirm("Do you want to restore default values?"))
                    game.settings.set("LightsHUD", this.lightType , {});
                    this.close();
            }
            // if (event.currentTarget?.dataset?.action === 'submit'){
            //     this._updateObject()
            // }
        });
    }

    setType(type){
        this.lightType = type;
    }

    ///** @override */
    getData() {
        let sData = super.getData().object;
        let LightDataObject = game.settings.get("LightsHUD", this.lightType);

        if (!this.isLightData(LightDataObject)) {
            LightDataObject =  new foundry.data.LightData();
        }

        let animation = LightDataObject.animation;
        delete LightDataObject.animation;
        let darkness = LightDataObject.darkness;
        delete LightDataObject.darkness;

        return {sData,LightDataObject,animation,darkness};
    }

    isLightData(LightDataObject) {
        if ("bright" in LightDataObject && "animation" in LightDataObject && "darkness" in LightDataObject)
            return true;
        return false;
    }

    ///** @override */
    _updateObject(event, CustomLightData, darkness, animation) {
        let modifiedObject = mergeObject(CustomLightData, animation, darkness);
        game.settings.set("LightsHUD", this.lightType , CustomLightData);
    }

    
}

Handlebars.registerHelper('isObject', function (value) {
    return typeof(value) != {};
})

export class LightSub extends LightsHUDMenuSettings{
    constructor(){
        super();
        this.lightType = "lightspell";
    }
}

export class LanternSub extends LightsHUDMenuSettings{
    constructor(){
        super();
        this.lightType = "lanternLight";
    }
}

export class TorchSub extends LightsHUDMenuSettings{
    constructor(){
        super();
        this.lightType = "torchLight";
    }
}