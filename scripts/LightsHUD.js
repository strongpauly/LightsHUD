import { LightDataExt } from "./LightDataExt.js";
// import { LightData } from foundry.data.LightData;
import { tokenInformations } from "./tokenInformations.js";
import * as LightsHUDSubs from "./LightsHUDMenuSettings.js";
class LightsHUD {
 
  static clBanner() {
    const title =
      " _     _       _     _       _   _ _   _ ____   \n" +
      "| |   (_) __ _| |__ | |_ ___| | | | | | |  _ \\  \n" +
      "| |   | |/ _` | '_ \\| __/ __| |_| | | | | | | | \n" +
      "| |___| | (_| | | | | |_\\__ \\  _  | |_| | |_| | \n" +
      "|_____|_|\\__, |_| |_|\\__|___/_| |_|\\___/|____/  \n" +
      "         |___/                                 \n";
    console.log("%c" + title, "color:orange");
  }

  static async addLightsHUDButtons(app, html, data) {

    let tokenInfoObject = app.object.data;
    let tokenInfo = new tokenInformations(tokenInfoObject);

    // Define all three buttons
    const tbuttonLight = $(
      `<div class="control-icon LightsHUD lightSpell" title="Toggle Light Spell"><i class="fas fa-sun"></i></div>`
    );
    const tbuttonLantern = $(
      `<div class="control-icon LightsHUD lantern" title="Toggle Lantern"><i class="fas fa-lightbulb"></i></div>`
    );
    const tbuttonTorch = $(
      `<div class="control-icon LightsHUD torch" title="Toggle Torch"><i class="fas fa-fire"></i></div>`
    );

    // Get the position of the column
    const position = game.settings.get("LightsHUD", "position");

    // Create the column
    const buttonsdiv = $(`<div class="col LightsHUD-column-${position}"></div>`);

    // Wrap the previous icons
    let newdiv = '<div class="LightsHUD-container"></div>';
    html.find(".col.left").before(newdiv);

    // Add the column
    html.find(".LightsHUD-container").prepend(buttonsdiv);

    // Get the status of the three types of lights

    let spellLight = new LightDataExt("light", "spell", false, app);
    let lanternLight = new LightDataExt("lantern", "consumable", false, app);
    let torchLight = new LightDataExt("torch", "consumable", false, app);

    let tokenD = app.object.document;
   
    let hasInventoryCheck = game.settings.get("LightsHUD","checkAvailability");
    let consumptionCheck = game.settings.get("LightsHUD","consumeItem");
      
    // Initial button state when the HUD comes up
    if (spellLight.state)   tbuttonLight.addClass("active");
    if (lanternLight.state) tbuttonLantern.addClass("active");
    if (torchLight.state)   tbuttonTorch.addClass("active");
    // Check the permissions to manage the lights
    
    if (!data.isGM && !game.settings.get("LightsHUD", "playerActivation")) {
      disableLightsHUDButton(tbuttonLight);
      disableLightsHUDButton(tbuttonLantern);
      disableLightsHUDButton(tbuttonTorch);
      return;
    }
      // If the a specific light is on, enable only that light otherwise enable all three of them
      if (spellLight.state) {
        enableLightsHUDButton(tbuttonLight);
        disableLightsHUDButton(tbuttonLantern);
        disableLightsHUDButton(tbuttonTorch);
      } else if (lanternLight.state) {
        disableLightsHUDButton(tbuttonLight);
        enableLightsHUDButton(tbuttonLantern);
        disableLightsHUDButton(tbuttonTorch);
      } else if (torchLight.state) {
        disableLightsHUDButton(tbuttonLight);
        disableLightsHUDButton(tbuttonLantern);
        enableLightsHUDButton(tbuttonTorch);
      } else enableButtonsPerSettings();

    

    // Returns true if the character can use the Light spell
    // This also returns true if the game system is not D&D 5e...
    function canCastLight() {
      let actor = game.actors.get(data.actorId);
      if (actor === undefined) return false;
      let hasLight = false;
      actor.data.items.forEach((item) => {
        if (item.type === "spell") {
          if (item.name === "Light") hasLight = true;
        }
      });
      return hasLight;
    }

    // Returns true if the character has a specific item in his inventory
    // This also returns true if the game system is not D&D 5e...
    function hasItem(itemToCheck) {
      let consumables; 

      if (game.system.id === "dnd5e"){
        consumables = tokenInfo.itemList.filter( (item) => ((item.type === "consumable") && (item.name.toLowerCase() === itemToCheck.toLowerCase()) && (item.data.quantity > 0))  ?? false);
      }
      if (game.system.id === "pf2e"){
        consumables = tokenInfo.itemList.filter( (item) => (item.type === "consumable" && item.name.toLowerCase() === itemToCheck.toLowerCase() && item.data.quantity.value > 0)  ?? false);
      }
      if (!consumables) return false;
        
      return consumables.length > 0 ? consumables : false;
    }
    
    async function consumeItem(item) {
      
      if (!item) return;
      try{
        let itemID = item[0]._id;
        let newQte;
        if (game.system.id === "dnd5e"){
          newQte = item[0].data.quantity - 1;
          if (tokenInfo.getLinked()){
              await game.actors.get(tokenInfo.getActorID()).updateEmbeddedDocuments("Item", [{"_id": itemID,"data.quantity": newQte,},]);  
          }else {
              await game.actors.tokens[tokenInfo.getTokenID()].updateEmbeddedDocuments("Item", [{"_id": itemID,"data.quantity": newQte,},]);  
          }}
        if (game.system.id === "pf2e"){
          newQte = item[0].data.quantity.value - 1;
          if (tokenInfo.getLinked()){
              await game.actors.get(tokenInfo.getActorID()).updateEmbeddedDocuments("Item", [{"_id": itemID,"data.quantity.value": newQte,},]);  
          }else {
              await game.actors.tokens[tokenInfo.getTokenID()].updateEmbeddedDocuments("Item", [{"_id": itemID,"data.quantity.value": newQte,},]);  
          }
        }
        return true;
      }
        catch (err) { 
        LightsHUD.log("Error during consumption:");
        LightsHUD.log(err);
        return false;
      }
    }
    
    function enableLightsHUDButton(tbutton) {
      // Remove the disabled status, if any
      tbutton.find("i").removeClass("fa-disabled");
      tbutton.addClass("active");
      // Install a click handler if one is not already bound
      if (!tbutton.hasClass("clickBound")) {
        tbutton.click(async (ev) => onButtonClick(ev, tbutton));
        tbutton.addClass("clickBound");
      }
    }
    // Visually and functionally disable a LightsHUD button
    function disableLightsHUDButton(tbutton) {
      tbutton.find("i").addClass("fa-disabled");
      tbutton.off("click");
      tbutton.removeClass("clickBound");
      tbutton.removeClass("active");
    }

    // Enable or disable buttons according to parameters
    function enableButtonsPerSettings() {

      let checkAvailability = game.settings.get("LightsHUD", "checkAvailability");
      let lantern = game.settings.get('LightsHUD', "lanternType.nameConsumableLantern").toLowerCase();
      let torch = game.settings.get('LightsHUD', "torchType.nameConsumableTorch").toLowerCase();

      let noCheck;// = game.system.id !== "dnd5e";
      if (!noCheck) noCheck = !checkAvailability;

      if (noCheck || canCastLight()) {
        enableLightsHUDButton(tbuttonLight);
      } else {
        disableLightsHUDButton(tbuttonLight);
      }

      if (noCheck || hasItem(lantern))
      {
        enableLightsHUDButton(tbuttonLantern);
      } else {
        disableLightsHUDButton(tbuttonLantern);
      }

      if (noCheck || hasItem(torch))
      {
        enableLightsHUDButton(tbuttonTorch);
      } else {
        disableLightsHUDButton(tbuttonTorch);
      }
    }

    async function onButtonClick(ev, tbutton) {
      ev.preventDefault();
      ev.stopPropagation();
      LightsHUD.log("On Button Click");
    
      // Are we dealing with the Light Button
      if (tbutton.hasClass("lightSpell")) {
        // Check if the token has the light spell on
        if (spellLight.state) {
          LightsHUD.log("Turn Off")
          // The token has the light spell on
          spellLight.state = false;
          await tokenD.setFlag("LightsHUD", spellLight._getFlagName(), false);
          tbuttonLight.removeClass("active");
          // Light is inactive, enable the relevant light sources according to parameters
          enableButtonsPerSettings();

          // Restore the initial light source
          updateTokenLighting(tokenD.getFlag("LightsHUD", "previousLightData"));
        } else {
          LightsHUD.log("Turn On")
          // The token does not have the light spell on
          spellLight.state = true;
          await tokenD.setFlag("LightsHUD", spellLight._getFlagName(), true);
          tbuttonLight.addClass("active");
          // Light is active, disable the other light sources
          disableLightsHUDButton(tbuttonLantern);
          disableLightsHUDButton(tbuttonTorch);
          // Store the lighting for later restoration
          await storeTokenLighting();
          // Enable the Light Source according to the type
          // "torch" / "pulse" / "chroma" / "wave" / "fog" / "sunburst" / "dome"
          // "emanation" / "hexa" / "ghost" / "energy" / "roiling" / "hole"
          
          let lightDataObject = tokenD.getFlag("LightsHUD","previousLightData") ?? LightsHUD.getLightDataFromSettings("lightspell");
          updateTokenLighting(lightDataObject);
          }
      }
      if (tbutton.hasClass("lantern")) { 
        let consumable = game.settings.get("LightsHUD","lanternType.nameConsumableLantern").toLowerCase() ?? false;
        let hasItemNow = hasItem(consumable);
        
          // Check if the token has the light spell on
          if (lanternLight.state) {
            // The token has the light spell on
            lanternLight.state = false;
            await tokenD.setFlag("LightsHUD", lanternLight._getFlagName(), false);
            // Light is inactive, enable the relevant light sources according to parameters
            enableButtonsPerSettings();
            // Restore the initial light source
            updateTokenLighting(
              tokenD.getFlag("LightsHUD", "InitialBrightRadius"),
              tokenD.getFlag("LightsHUD", "InitialDimRadius"),
              tokenD.getFlag("LightsHUD", "InitialLightColor"),
              tokenD.getFlag("LightsHUD", "InitialColorIntensity"),
              tokenD.getFlag("LightsHUD", "Initiallight.angle"),
              tokenD.getFlag("LightsHUD", "InitialAnimationType"),
              tokenD.getFlag("LightsHUD", "InitialAnimationSpeed"),
              tokenD.getFlag("LightsHUD", "InitialAnimationIntensity")
            );
            return;
          } 
          if ( !lanternLight.state && ((hasInventoryCheck && !hasItemNow))) return;
          if ( !lanternLight.state && ((consumptionCheck && !consumeItem(hasItemNow)))) return;
          if ( !lanternLight.state){
            disableLightsHUDButton(tbuttonTorch);
            disableLightsHUDButton(tbuttonLight);
            lanternLight.state = true;
            await tokenD.setFlag("LightsHUD", lanternLight._getFlagName(), true);

            // Store the lighting for later restoration
            await storeTokenLighting();
            // Enable the Light Source according to the type
            // "torch" / "pulse" / "chroma" / "wave" / "fog" / "sunburst" / "dome"
            // "emanation" / "hexa" / "ghost" / "energy" / "roiling" / "hole"
            let nBright = game.settings.get("LightsHUD", "lanternBrightRadius");
            let nDim = game.settings.get("LightsHUD", "lanternDimRadius");
            let nType = game.settings.get("LightsHUD", "lanternType");
            switch (nType) {
                case "Type0":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ffffff",
                    0.5,
                    360,
                    "none",
                    5,
                    5
                  );
                  break;
                case "Type1":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ffffff",
                    0.5,
                    360,
                    "torch",
                    5,
                    5
                  );
                  break;
                case "Type2":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ffffff",
                    0.5,
                    360,
                    "chroma",
                    5,
                    5
                  );
                  break;
                case "Type3":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ffffff",
                    0.5,
                    360,
                    "pulse",
                    5,
                    5
                  );
                  break;
                case "Type4":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ffffff",
                    0.5,
                    360,
                    "ghost",
                    5,
                    5
                  );
                  break;
                case "Type5":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ffffff",
                    0.5,
                    360,
                    "emanation",
                    5,
                    5
                  );
                  break;
                case "Type6":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ff0000",
                    0.5,
                    360,
                    "torch",
                    5,
                    5
                  );
                  break;
                case "Type7":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ff0000",
                    0.5,
                    360,
                    "chroma",
                    5,
                    5
                  );
                  break;
                case "Type8":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ff0000",
                    0.5,
                    360,
                    "pulse",
                    5,
                    5
                  );
                  break;
                case "Type9":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ff0000",
                    0.5,
                    360,
                    "ghost",
                    5,
                    5
                  );
                  break;
                case "Type10":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ff0000",
                    0.5,
                    360,
                    "emanation",
                    5,
                    5
                  );
                  break;
                case "Type11":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#00ff00",
                    0.5,
                    360,
                    "torch",
                    5,
                    5
                  );
                  break;
                case "Type12":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#00ff00",
                    0.5,
                    360,
                    "chroma",
                    5,
                    5
                  );
                  break;
                case "Type13":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#00ff00",
                    0.5,
                    360,
                    "pulse",
                    5,
                    5
                  );
                  break;
                case "Type14":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#00ff00",
                    0.5,
                    360,
                    "ghost",
                    5,
                    5
                  );
                  break;
                case "Type15":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#00ff00",
                    0.5,
                    360,
                    "emanation",
                    5,
                    5
                  );
                  break;
                case "TypeC":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    game.settings.get("LightsHUD", "customLightColor"),
                    game.settings.get("LightsHUD", "customLightColorIntensity"),
                    360,
                    game.settings.get("LightsHUD", "customlight.animationType"),
                    game.settings.get("LightsHUD", "customlight.animationSpeed"),
                    game.settings.get("LightsHUD", "customlight.animationIntensity")
                  );
                  break;
                }
              }
      }
      if (tbutton.hasClass("torch")) {
        let consumable = game.settings.get("LightsHUD","torchType.nameConsumableTorch").toLowerCase() ?? false;
        let hasItemNow = hasItem(consumable);
        
          // Check if the token has the light spell on
          if (torchLight.state) {
            // The token has the light spell on
            torchLight.state = false;
            await tokenD.setFlag("LightsHUD", torchLight._getFlagName(), false);
            // Light is inactive, enable the relevant light sources according to parameters
            enableButtonsPerSettings();
            // Restore the initial light source
            updateTokenLighting(
              tokenD.getFlag("LightsHUD", "InitialBrightRadius"),
              tokenD.getFlag("LightsHUD", "InitialDimRadius"),
              tokenD.getFlag("LightsHUD", "InitialLightColor"),
              tokenD.getFlag("LightsHUD", "InitialColorIntensity"),
              tokenD.getFlag("LightsHUD", "Initiallight.angle"),
              tokenD.getFlag("LightsHUD", "InitialAnimationType"),
              tokenD.getFlag("LightsHUD", "InitialAnimationSpeed"),
              tokenD.getFlag("LightsHUD", "InitialAnimationIntensity")
            );
            return;
          } 
          if ( !torchLight.state && ((hasInventoryCheck && !hasItemNow))) return;
          if ( !torchLight.state && ((consumptionCheck && !consumeItem(hasItemNow)))) return;
          if ( !torchLight.state){
            disableLightsHUDButton(tbuttonLantern);
            disableLightsHUDButton(tbuttonLight);
            torchLight.state = true;
            await tokenD.setFlag("LightsHUD", torchLight._getFlagName(), true);

            // Store the lighting for later restoration
            await storeTokenLighting();
            // Enable the Light Source according to the type
            // "torch" / "pulse" / "chroma" / "wave" / "fog" / "sunburst" / "dome"
            // "emanation" / "hexa" / "ghost" / "energy" / "roiling" / "hole"
            let nBright = game.settings.get("LightsHUD", "torchBrightRadius");
            let nDim = game.settings.get("LightsHUD", "torchDimRadius");
            let nType = game.settings.get("LightsHUD", "torchType");
            switch (nType) {
                case "Type0":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ffffff",
                    0.5,
                    360,
                    "none",
                    5,
                    5
                  );
                  break;
                case "Type1":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ffffff",
                    0.5,
                    360,
                    "torch",
                    5,
                    5
                  );
                  break;
                case "Type2":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ffffff",
                    0.5,
                    360,
                    "chroma",
                    5,
                    5
                  );
                  break;
                case "Type3":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ffffff",
                    0.5,
                    360,
                    "pulse",
                    5,
                    5
                  );
                  break;
                case "Type4":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ffffff",
                    0.5,
                    360,
                    "ghost",
                    5,
                    5
                  );
                  break;
                case "Type5":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ffffff",
                    0.5,
                    360,
                    "emanation",
                    5,
                    5
                  );
                  break;
                case "Type6":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ff0000",
                    0.5,
                    360,
                    "torch",
                    5,
                    5
                  );
                  break;
                case "Type7":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ff0000",
                    0.5,
                    360,
                    "chroma",
                    5,
                    5
                  );
                  break;
                case "Type8":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ff0000",
                    0.5,
                    360,
                    "pulse",
                    5,
                    5
                  );
                  break;
                case "Type9":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ff0000",
                    0.5,
                    360,
                    "ghost",
                    5,
                    5
                  );
                  break;
                case "Type10":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#ff0000",
                    0.5,
                    360,
                    "emanation",
                    5,
                    5
                  );
                  break;
                case "Type11":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#00ff00",
                    0.5,
                    360,
                    "torch",
                    5,
                    5
                  );
                  break;
                case "Type12":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#00ff00",
                    0.5,
                    360,
                    "chroma",
                    5,
                    5
                  );
                  break;
                case "Type13":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#00ff00",
                    0.5,
                    360,
                    "pulse",
                    5,
                    5
                  );
                  break;
                case "Type14":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#00ff00",
                    0.5,
                    360,
                    "ghost",
                    5,
                    5
                  );
                  break;
                case "Type15":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    "#00ff00",
                    0.5,
                    360,
                    "emanation",
                    5,
                    5
                  );
                  break;
                case "TypeC":
                  updateTokenLighting(
                    nBright,
                    nDim,
                    game.settings.get("LightsHUD", "customLightColor"),
                    game.settings.get("LightsHUD", "customLightColorIntensity"),
                    360,
                    game.settings.get("LightsHUD", "customlight.animationType"),
                    game.settings.get("LightsHUD", "customlight.animationSpeed"),
                    game.settings.get("LightsHUD", "customlight.animationIntensity")
                  );
                  break;
                }
              }
      }
    }
      
    
    
    // Update the relevant light parameters of a token
    function updateTokenLighting(lightDataObject){
      app.object.document.update({lightData:{lightDataObject}});
      LightsHUD.log("Update token with LightData")
      LightsHUD.log(lightDataObject)
    }

    // function updateTokenLighting(
    //   bright,
    //   dim,
    //   lightColor,
    //   colorIntensity,
    //   angle,
    //   animationType,
    //   animationSpeed,
    //   animationIntensity
    // ) {
    //   app.object.document.update({
    //     light: {
    //       bright: bright,
    //       dim: dim,
    //       alpha: colorIntensity ** 2,
    //       color: lightColor,
    //       angle: angle,
    //       animation: {
    //         type: animationType,
    //         speed: animationSpeed,
    //         intensity: animationIntensity,
    //       },
    //     },
    //   });
    // }

    // Store the initial status of illumination for the token to restore if all light sources are extinguished
    async function storeTokenLighting() {

      //let myLightObject = new foundry.data.LightData();
      let myLightObject = app.object.data.light;
      const tokenFlags = app.object.document;
      await tokenFlags.setFlag(
          "LightsHUD",
          "previousLightData",
           myLightObject
        );
        LightsHUD.log("store LightData")
        LightsHUD.log(myLightObject)
        LightsHUD.log(tokenFlags.getFlag("LightsHUD", "previousLightData"));
    }
    /*
     * Returns the first GM id.
     */
    function firstGM() {
      let i;

      for (i = 0; i < game.users.entities.length; i++) {
        if (
          game.users.entities[i].data.role >= 4 &&
          game.users.entities[i].active
        )
          return game.users.entities[i].data._id;
      }
      ui.notifications.error("No GM available for Dancing Lights!");
    }

    async function sendRequest(req) {
      req.sceneId = canvas.scene._id;
      req.tokenId = app.object.id;

      if (!data.isGM) {
        req.addressTo = firstGM();
        game.socket.emit("module.torch", req);
      } else {
        LightsHUD.handleSocketRequest(req);
      }
    }

    // Finally insert the buttons in the column
    html.find(".col.LightsHUD-column-" + position).prepend(tbuttonTorch);
    html.find(".col.LightsHUD-column-" + position).prepend(tbuttonLantern);
    html.find(".col.LightsHUD-column-" + position).prepend(tbuttonLight);
  }

  static getLightDataFromSettings(lightType) {
    let lightDataObject = game.settings.get("LightsHUD",lightType) ?? new foundry.data.LightData();
    return lightDataObject ;
  }

  static log(data) {
    if (this.debug()) console.log("LightsHUD | ", data);
  }

  static async handleSocketRequest(req) {
    if (req.addressTo === undefined || req.addressTo === game.user._id) {
      let scn = game.scenes.get(req.sceneId);
      let tkn = scn.data.tokens.find(({ _id }) => _id === req.tokenId);
      let dltoks = [];

      switch (req.requestType) {
        case "removeDancingLights":
          scn.data.tokens.forEach((tok) => {
            if (
              tok.actorId === tkn.actorId &&
              tok.name === "Dancing Light" &&
              tok.light.dim === 20 &&
              tok.light.bright === 10
            ) {
              dltoks.push(scn.getEmbeddedEntity("Token", tok._id)._id);
            }
          });
          await scn.deleteEmbeddedEntity("Token", dltoks);
          break;
      }
    }
  }

  static debug() {
    let isDebug = game.settings.get("LightsHUD", "debug");
    if (isDebug) CONFIG.debug.hooks = false;
    if (!isDebug) CONFIG.debug.hooks = false;

    return isDebug;
  }
}

Hooks.on("ready", () => {
  Hooks.on("renderTokenHUD", (app, html, data) => {
    LightsHUD.addLightsHUDButtons(app, html, data);
  });
  Hooks.on("renderControlsReference", (app, html, data) => {
    html
      .find("div")
      .first()
      .append(
        '<h3>LightsHUD</h3><ol class="hotkey-list"><li><h4>' +
          game.i18n.localize("LightsHUD.turnOffAllLights") +
          '</h4><div class="keys">' +
          game.i18n.localize("LightsHUD.holdCtrlOnClick") +
          "</div></li></ol>"
      );
  });

  game.socket.on("module.torch", (request) => {
    LightsHUD.handleSocketRequest(request);
  });
});
Hooks.once("init", async () => {
  game.settings.register("LightsHUD", "position", {
    name: game.i18n.localize("LightsHUD.position.name"),
    hint: game.i18n.localize("LightsHUD.position.hint"),
    scope: "world",
    config: true,
    type: String,
    default: "left",
    choices: {
      left: game.i18n.localize("LightsHUD.position.left"),
      right: game.i18n.localize("LightsHUD.position.right"),
      top: game.i18n.localize("LightsHUD.position.top"),
      bottom: game.i18n.localize("LightsHUD.position.bottom"),
    },
  });
  game.settings.register("LightsHUD", "playerActivation", {
    name: game.i18n.localize("LightsHUD.playerActivation.name"),
    hint: game.i18n.localize("LightsHUD.playerActivation.hint"),
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  });

  
    game.settings.register("LightsHUD", "checkAvailability", {
      name: game.i18n.localize("LightsHUD.checkAvailability.name"),
      hint: game.i18n.localize("LightsHUD.checkAvailability.hint"),
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
    });
    game.settings.register("LightsHUD", "consumeItem", {
      name: game.i18n.localize("LightsHUD.consumeItem.name"),
      hint: game.i18n.localize("LightsHUD.consumeItem.hint"),
      scope: "world",
      config: true,
      default: false,
      type: Boolean,
    });
    game.settings.register("LightsHUD", "torchType.nameConsumableTorch", {
        name: game.i18n.localize("LightsHUD.torchType.nameConsumableTorch.name"),
        hint: game.i18n.localize("LightsHUD.torchType.nameConsumableTorch.hint"),
        scope: "world",
        config: true,
        default: "Torch",
        type: String,
    });
    game.settings.register("LightsHUD", "lanternType.nameConsumableLantern", {
      name: game.i18n.localize(
        "LightsHUD.lanternType.nameConsumableLantern.name"
      ),
      hint: game.i18n.localize(
        "LightsHUD.lanternType.nameConsumableLantern.hint"
      ),
      scope: "world",
      config: true,
      default: "Oil (flask)",
      type: String,
    });

  
  // Light Parameters
  game.settings.registerMenu("LightsHUD", "lightspellSubmenu", {
    name: "Spell Light",
    label: "Spell-Type Light Settings",
    hint: "Customize the Light Spell HUD Button",
    icon: "fas fa-bars",
    type: LightsHUDSubs.LightSub,
    restricted: true
  });

  await game.settings.register("LightsHUD", "lightspell", {
    name: game.i18n.localize("LightsHUD.lightBrightRadius.name"),
    hint: game.i18n.localize("LightsHUD.lightBrightRadius.hint"),
    scope: "world",
    config: false,
    default: {},
    type: Object,
  });

  // Lantern Parameters
  game.settings.registerMenu("LightsHUD", "LanternSubmenu", {
    name: "Lantern Light",
    label: "Lantern-Type Light Settings",
    hint: "Customize the Lantern Spell HUD Button",
    icon: "fas fa-bars",
    type: LightsHUDSubs.LanternSub,
    restricted: true
  });

  await game.settings.register("LightsHUD", "lanternLight", {
    name: game.i18n.localize("LightsHUD.lightBrightRadius.name"),
    hint: game.i18n.localize("LightsHUD.lightBrightRadius.hint"),
    scope: "world",
    config: false,
    default: {},
    type: Object,
  });

  // Light Parameters
  game.settings.registerMenu("LightsHUD", "torchSubmenu", {
    name: "Torch Light",
    label: "Torch-Type Light Settings",
    hint: "Customize the Torch Spell HUD Button",
    icon: "fas fa-bars",
    type: LightsHUDSubs.TorchSub,
    restricted: true
  });

  await game.settings.register("LightsHUD", "torchLight", {
    name: game.i18n.localize("LightsHUD.lightBrightRadius.name"),
    hint: game.i18n.localize("LightsHUD.lightBrightRadius.hint"),
    scope: "world",
    config: false,
    default: {},
    type: Object,
  });

  game.settings.register("LightsHUD", "debug", {
    name: "Debug",
    hint: "Enable Debug.",
    scope: "world",
    config: true,
    restricted: true,
    type: Boolean,
    default: false,
  });
  
  LightsHUD.debug();
  LightsHUD.clBanner();
});

