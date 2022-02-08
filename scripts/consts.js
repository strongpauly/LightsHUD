export class LightsHUDConsts{

    modname;
    LightDataPropToInputType;
    animationTypes;

    constructor(){
        this.modname = 'LightsHUD';
        this.LightDataPropToInputType = {
            "alpha": "number",
            "angle": "number",
            "bright": "number",
            "color": "colorpicker",
            "coloration": "number",
            "contrast": "number",
            "dim": "number",
            "gradual": "number",
            "luminosity": "number",
            "saturation": "number",
            "animation.intensity": "number",
            "animation.reverse": "boolean",
            "animation.speed": "number",
            "animation.type": "select",
            "darkness.min": "number",
            "darkness.max": "number",
            "shadows": "number",
         };
        this.animationTypes = Object.keys(CONFIG.Canvas.lightAnimations);
    }
    

    



}