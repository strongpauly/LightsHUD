// Setting Menu for the custom lightData values.
import { LightsHUDConsts } from "./consts.js"
export class LightsHUDMenuSettings extends FormApplication {
    
    lightType;
    LHCONSTS = new LightsHUDConsts();
    //TODO Add colorPicker

    constructor(lightType){
        super();
        this.lightType = lightType ?? "";
        console.clear();
    }

    static get defaultOptions() {
        const options = super.defaultOptions;
        options.id = "LightsHUDSubmenu";
        options.template = "modules/LightsHUD/templates/LightsHUDSettingsSubmenu.html";
        options.width = 500;
        return options;
    }
      get title() {
        return game.i18n.localize(`${this.lightType} Default Values`);
    }

    activateListeners(html) {
        
        super.activateListeners(html);
        html.find('button').on('click', async (event) => {
            if (event.currentTarget?.dataset?.action === 'reset') {
                if (confirm("Do you want to restore default values?"))
                    game.settings.set("LightsHUD", this.lightType , {});
                    this.close();
            }
        });
    }

    setType(type){
        this.lightType = type;
    }

    ///** @override */
    getData() {
        let sData;
        let LightDataObject;

        console.debug(this.LHCONSTS.animationTypes.map( (value) => {
            return value;
        }));
        try {
            sData = super.getData();
            LightDataObject = flattenObject(game.settings.get("LightsHUD", this.lightType));
            if (isObjectEmpty(LightDataObject))
                LightDataObject = flattenObject(new foundry.data.LightData());
            return {sData,LightDataObject};

        } catch (error) {
            console.error("Error getting data for setting", error);
        }
        
        
    }


    ///** @override */
    async _updateObject(event, customLightData) {
        try {
            let updatedLightData = expandObject(customLightData);
            return game.settings.set("LightsHUD", this.lightType , updatedLightData);    
        } catch (error) {
            console.error("Error updating setting", error);
        }
    }
    
}

Handlebars.registerHelper('type', function(value) {
    
    try{
        switch(typeof value){
            case "boolean" : {}
            case "string" : {}
            case "number" : {}
            case "boolean" : {}
            case "boolean" : {}
            default: return;       
        }
  
    }    
    catch (error) { console.error("Error in determining Type of value: ",error); }
    
    
});

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