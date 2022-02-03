
export class LightsHUDMenuSettings extends FormApplication {
    Sup;

    

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
        this.Sup = super.getData();
        return super.getData();
    }
    
    _updateObject(event, formData) {
        const data = expandObject(formData);
        game.settings.set("LightsHUD", "lightspell" , this.LDO);
    }

    


}