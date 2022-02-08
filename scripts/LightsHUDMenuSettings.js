// Setting Menu for the custom lightData values.
export class LightsHUDMenuSettings extends FormApplication {
    lightType;
    
    
    constructor(lightType){
        super();
        this.lightType = lightType ?? "";
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
        let sData = super.getData();
        let LightDataObject = game.settings.get("LightsHUD", this.lightType);

        if(!(LightDataObject instanceof foundry.data.LightData)) {
            LightDataObject =  new foundry.data.LightData();
        }
        console.debug(sData)
        return {sData,LightDataObject};
    }


    ///** @override */
    _updateObject(event, CustomLightData) {
        //TODO repair LightData object Setting
        game.settings.set("LightsHUD", this.lightType , CustomLightData);
    }

    getExcludedProperties(){
        return this.excludedProperties;
    }

    
    
}

Handlebars.registerHelper('expandObject', function(object) {

    if (typeof object !== 'object')
        return;

    function iterateObject (object){
        let htmlValue = "";
        for (const [key,value] of Object.entries(object)){
            if (typeof value === 'object'){
                htmlValue += ` <fieldset><legend>${key}</legend>
                               ${iterateObject(value)}
                               </fieldset>`;
                
                continue;
            }
            htmlValue += `<label for="${key}">${key}</label>`;
            if (key === "color"){
                htmlValue += `<input class="line" name="${key}" type=text value="${value}"></input>`;
                continue;
            }
            htmlValue += `<input class="line" name="${key}" type=text value="${value}"></input>`;
        };
        console.log(htmlValue)
        return htmlValue;
    }
    
    return iterateObject(object);
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