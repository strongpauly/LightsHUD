// Setting Menu for the custom lightData values.
export class LightsHUDMenuSettings extends FormApplication {
    
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
      }

    getData() {
        let sData = super.getData();
        let LightDataObject = game.settings.get("LightsHUD", "lightspell");


        if (typeof LightDataObject !== "LightData") {
            LightDataObject =  new foundry.data.LightData();
        }

        return {sData,LightDataObject};
    }
    
    _updateObject(event, CustomLightData) {
        const data = expandObject(CustomLightData);
        game.settings.set("LightsHUD", "lightspell" , data);
    }
}