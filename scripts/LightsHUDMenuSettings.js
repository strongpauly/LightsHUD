// Setting Menu for the custom lightData values.
import { LightsHUDConsts } from "./consts.js";
const LHCONSTS = LightsHUDConsts;
export class LightsHUDMenuSettings extends FormApplication {
  lightType;

  constructor(lightType) {
    super();
    this.lightType = lightType ?? "";
    console.clear();
  }

  static get defaultOptions() {
    const options = super.defaultOptions;
    options.id = "LightsHUDSubmenu";
    options.template =
      "modules/LightsHUD/templates/LightsHUDSettingsSubmenu.html";
    options.width = 400;
    return options;
  }
  get title() {
    return game.i18n.localize(`${this.lightType} Default Values`);
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find("button").on("click", async (event) => {
      if (event.currentTarget?.dataset?.action === "reset") {
        if (confirm("Do you want to restore default values?"))
          game.settings.set("LightsHUD", this.lightType, {});
        this.close();
      }
    });
  }

  setType(type) {
    this.lightType = type;
  }

  getData() {
    let sData;
    let LightDataObject;
    let animTypes = LHCONSTS.animationTypes.toString();
   
    try {
      sData = super.getData();
      LightDataObject = flattenObject(
        game.settings.get("LightsHUD", this.lightType)
      );
      if (isObjectEmpty(LightDataObject))
        LightDataObject = flattenObject(new foundry.data.LightData());
      return { sData, LightDataObject, animTypes };
    } catch (error) {
      console.error("Error getting data for setting", error);
    }
  }

  async _updateObject(event, customLightData) {
    try {
      let updatedLightData = expandObject(customLightData);
      return game.settings.set("LightsHUD", this.lightType, updatedLightData);
    } catch (error) {
      console.error("Error updating setting", error);
    }
  }
}

//TODO Improve Setting Form
// This helper will help in defining the input types.
Handlebars.registerHelper("type", function (value) {
  try{
      return LHCONSTS.LightDataPropToInputType[value];
      
  } catch (error) {
    console.error("Error in determining Type of value: ", error);
  }
});

Handlebars.registerHelper("hasOptions", function (value) {
  try {
    if (value === "color")
      return `is="colorpicker-input" data-responsive-color placeholder="Click me to select color" `;
    if (value === "animation.type")
      return `placeholder="Refer to the available types at the bottom of this window."`;
  } catch (error) {
    console.error("Error in determining Type of value: ", error);
  }
});

export class LightSub extends LightsHUDMenuSettings {
  constructor() {
    super();
    this.lightType = "lightSpell";
  }
}

export class LanternSub extends LightsHUDMenuSettings {
  constructor() {
    super();
    this.lightType = "lanternLight";
  }
}

export class TorchSub extends LightsHUDMenuSettings {
  constructor() {
    super();
    this.lightType = "torchLight";
  }
}
