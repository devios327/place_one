//size of one segment (mm)
const widthOfSegment = 12
const heightOfSegment = 48
const ZOfSegment = 1
const RBetweenPlanes = 50

const hitPointSize = 2
var planes = [null, null, null, null]
var planeNSegments = [[],[],[],[]]

// materials
var glass = null
var metal = null
var plastic = null
var rayMaterial = null
var hitPointMaterial = null

// work vars
var engine = null
var scene = null
var sceneToRender = null
var camera = null
var ray = null
var hitPointTop = null
var hitPointBottom = null
// Environment Texture
var hdrTexture = null
//#########################################################################
//##########################################################################
//####                                                                   ####
//####                                                                   ####
//####                                                                   ####
//##########################################################################
//#########################################################################
function init(){
    var canvas = document.querySelector("#renderCanvas")

    var createDefaultEngine = function() { 
        return new BABYLON.Engine(
            canvas, 
            true, 
            { 
                preserveDrawingBuffer: true, 
                stencil: true 
            }
        )
    }

    var createScene = function () {
        scene = new BABYLON.Scene(engine)
        camera = new BABYLON.ArcRotateCamera(
            "Camera", 
            -Math.PI/2 + Math.PI/5, 
            Math.PI/2 - Math.PI/7, 
            170, 
            BABYLON.Vector3.Zero(), 
            scene
        )

        camera.attachControl(canvas, true)
        camera.minZ = 1
        
        // Environment Texture
        hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("textures/dds/19.dds", scene)

        scene.imageProcessingConfiguration.exposure = 1
        scene.imageProcessingConfiguration.contrast = 1  

        // Skybox            
        var hdrSkybox = BABYLON.Mesh.CreateBox("hdrSkyBox", 5000.0, scene)
        var hdrSkyboxMaterial = new BABYLON.PBRMaterial("skyBox", scene)
        hdrSkyboxMaterial.backFaceCulling = false
        hdrSkyboxMaterial.reflectionTexture = hdrTexture.clone()
        hdrSkyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE
        hdrSkyboxMaterial.microSurface = 1.0
        hdrSkyboxMaterial.disableLighting = true
        hdrSkybox.material = hdrSkyboxMaterial
        hdrSkybox.infiniteDistance = false

    //###########################################################################
    //###########################################################################
        createMaterials()

        drawPlanes()

        createStands()
    //###########################################################################
    //###########################################################################        
        scene.registerBeforeRender(function(){})

        var showAxis=function(e){function B(e,B,r){var n=new BABYLON.DynamicTexture("DynamicTexture",50,scene,!0);n.hasAlpha=!0,n.drawText(e,5,40,"bold 36px Arial",B,"transparent",!0);var o=new BABYLON.Mesh.CreatePlane("TextPlane",r,scene,!0);return o.material=new BABYLON.StandardMaterial("TextPlaneMaterial",scene),o.material.backFaceCulling=!1,o.material.specularColor=new BABYLON.Color3(0,0,0),o.material.diffuseTexture=n,o}BABYLON.Mesh.CreateLines("axisX",[new BABYLON.Vector3.Zero,new BABYLON.Vector3(e,0,0),new BABYLON.Vector3(.95*e,.05*e,0),new BABYLON.Vector3(e,0,0),new BABYLON.Vector3(.95*e,-.05*e,0)],scene).color=new BABYLON.Color3(1,0,0),B("X","red",e/10).position=new BABYLON.Vector3(.9*e,-.05*e,0),BABYLON.Mesh.CreateLines("axisY",[new BABYLON.Vector3.Zero,new BABYLON.Vector3(0,e,0),new BABYLON.Vector3(-.05*e,.95*e,0),new BABYLON.Vector3(0,e,0),new BABYLON.Vector3(.05*e,.95*e,0)],scene).color=new BABYLON.Color3(0,1,0),B("Y","green",e/10).position=new BABYLON.Vector3(0,.9*e,-.05*e),BABYLON.Mesh.CreateLines("axisZ",[new BABYLON.Vector3.Zero,new BABYLON.Vector3(0,0,e),new BABYLON.Vector3(0,-.05*e,.95*e),new BABYLON.Vector3(0,0,e),new BABYLON.Vector3(0,.05*e,.95*e)],scene).color=new BABYLON.Color3(0,0,1),B("Z","blue",e/10).position=new BABYLON.Vector3(0,.05*e,.9*e)};
        //showAxis(60)

        ray = BABYLON.Mesh.CreateLines("lines1", [], scene, true)
        hitPointTop = BABYLON.Mesh.CreateLines("lines2", [], scene, true)
        hitPointBottom = BABYLON.Mesh.CreateLines("lines3", [], scene, true)

        var c = 0
        //path.push(getPointForUp(widthOfSegment,widthOfSegment))
        //path.push(getPointForBottom(widthOfSegment,widthOfSegment))
    
        //mesh = BABYLON.Mesh.CreateLines("lines", path, scene, true)
        let hitPoints = []
        
        setInterval(()=>{
            hitPoints = [
                [Math.random()*widthOfSegment*4,Math.random()*widthOfSegment*4],
                [Math.random()*widthOfSegment*4,Math.random()*widthOfSegment*4]
            ]

            createHitPointsAt(hitPoints)            
            createRayAt(hitPoints)
            highLightSegments(hitPoints)
            
            /*
            path = []
            path.push(new BABYLON.Vector3(heightOfSegment*Math.random() - heightOfSegment/2, -30, heightOfSegment*Math.random() - heightOfSegment/2))
            path.push(new BABYLON.Vector3(heightOfSegment*Math.random() - heightOfSegment/2, 0, heightOfSegment*Math.random() - heightOfSegment/2))

            planeNSegments[0].forEach((elem)=>{
                elem.material = metal
            })

            planeNSegments[1].forEach((elem)=>{
                elem.material = metal
            })

            planeNSegments[2].forEach((elem)=>{
                elem.material = metal
            })

            planeNSegments[3].forEach((elem)=>{
                elem.material = metal
            })

            planeNSegments[0][Math.round(Math.random()*3)].material = plastic
            planeNSegments[1][Math.round(Math.random()*3)].material = plastic

            planeNSegments[2][Math.round(Math.random()*3)].material = plastic
            planeNSegments[3][Math.round(Math.random()*3)].material = plastic

            */
            
            c++
        }, 1000)     
        
        return scene
    }

    var engine

    try {
        engine = createDefaultEngine()
    } 
    catch(e) {
        console.log("the available createEngine function failed. Creating the default engine instead")
        engine = createDefaultEngine()
    }

    if (!engine){
        throw 'engine should not be null.'
    }

    scene = createScene()
    sceneToRender = scene

    engine.runRenderLoop(function () {
        if (sceneToRender) {
            sceneToRender.render()
        }
    })

    // Resize
    window.addEventListener("resize", function () {
        engine.resize()
    })
}
//#########################################################################
//##########################################################################
//####                                                                   ####
//####                                                                   ####
//####                                                                   ####
//##########################################################################
//#########################################################################
function highLightSegments(hitPoints){
    planeNSegments.forEach((plane_)=>{
        plane_.forEach((elem)=>{
            elem.material = metal
        })
    })

    let topPoint = hitPoints[0]
    planeNSegments[0][Math.trunc(topPoint[0]/widthOfSegment)].material = plastic
    planeNSegments[1][3-Math.trunc(topPoint[1]/widthOfSegment)].material = plastic

    let bottomPoint = hitPoints[1]
    planeNSegments[2][Math.trunc(bottomPoint[0]/widthOfSegment)].material = plastic
    planeNSegments[3][3-Math.trunc(bottomPoint[1]/widthOfSegment)].material = plastic
}
//#########################################################################
//##########################################################################
//####                                                                   ####
//####                                                                   ####
//####                                                                   ####
//##########################################################################
//#########################################################################
function createHitPointsAt(hitPoints){
    if (hitPointTop){
        hitPointTop.dispose()
        hitPointTop = null
    }

    if (hitPointBottom){
        hitPointBottom.dispose()
        hitPointBottom = null
    }

    hitPointTop = BABYLON.MeshBuilder.CreateSphere(
        "hitPointTop", 
        {
            diameter: hitPointSize
        }, 
        scene
    )

    hitPointTop.material = hitPointMaterial
    hitPointTop.translate(getPointForUp(hitPoints[0][0], hitPoints[0][1]), 1)

    hitPointBottom = BABYLON.MeshBuilder.CreateSphere(
        "hitPointTop", 
        {
            diameter: hitPointSize
        }, 
        scene
    )
    
    hitPointBottom.material = hitPointMaterial
    hitPointBottom.translate(getPointForBottom(hitPoints[1][0], hitPoints[1][1]), 1)
}
//#########################################################################
//##########################################################################
//####                                                                   ####
//####                                                                   ####
//####                                                                   ####
//##########################################################################
//#########################################################################
function createRayAt(hitPoints){
    if (ray){
        ray.dispose()
        ray = null
    }
    
    //mesh = BABYLON.Mesh.CreateLines("lines", path, scene, true)
    ray = BABYLON.MeshBuilder.CreateTube(
        "ray", 
        {
            path: [
                getPointForUp(hitPoints[0][0], hitPoints[0][1]),
                getPointForBottom(hitPoints[1][0], hitPoints[1][1])
            ], 
            radius: 0.2
        }, 
        scene
    )
    
    ray.material = rayMaterial
}
//#########################################################################
//##########################################################################
//####                                                                   ####
//####                                                                   ####
//####                                                                   ####
//##########################################################################
//#########################################################################
function getPointForUp(x,y){
    return new BABYLON.Vector3(x-2*widthOfSegment, planes[0].getWorldMatrix()._m[13], y - 2*widthOfSegment)
}
//#########################################################################
//##########################################################################
//####                                                                   ####
//####                                                                   ####
//####                                                                   ####
//##########################################################################
//#########################################################################
function getPointForBottom(x,y){
    return new BABYLON.Vector3(x-2*widthOfSegment, planes[3].getWorldMatrix()._m[13], y - 2*widthOfSegment)
}
//#########################################################################
//##########################################################################
//####                                                                   ####
//####                                                                   ####
//####                                                                   ####
//##########################################################################
//#########################################################################
function drawPlanes(){
    planes[0] = BABYLON.MeshBuilder.CreateBox(
        "plane_1", 
        { 
            width: 1,
            height: 1, 
            depth: 1
        }, 
        scene)

    planeNSegments[0] = []
    for (var i=1; i<=4; i++){
        planeNSegments[0].push(
            BABYLON.MeshBuilder.CreateBox(
                `segment1_${i}`, 
                { 
                    width: widthOfSegment,
                    height: ZOfSegment, 
                    depth: heightOfSegment 
                }, 
                scene
            )
        )
        
        planeNSegments[0][planeNSegments[0].length-1].parent = planes[0]
    }

    var pivotAt = new BABYLON.Vector3(-widthOfSegment/2, 0, 0);
    var translation = planes[0].position.subtract(pivotAt)
    planes[0].setPivotMatrix(BABYLON.Matrix.Translation(translation.x, translation.y, translation.z));
    planes[0].visibility = 'hidden'
//###########################################################################
//###########################################################################
    planes[1] = BABYLON.MeshBuilder.CreateBox(
        "plane_2", 
        { 
            width: 1,
            height: 1, 
            depth: 1
        }, 
        scene)

    planeNSegments[1] = []
    for (var i=1; i<=4; i++){
        planeNSegments[1].push(
            BABYLON.MeshBuilder.CreateBox(
                `segment2_${i}`, 
                { 
                    width: widthOfSegment,
                    height: ZOfSegment, 
                    depth: heightOfSegment 
                }, 
                scene
            )
        )
        
        planeNSegments[1][planeNSegments[1].length-1].parent = planes[1]
    }

    pivotAt = new BABYLON.Vector3(-widthOfSegment/2, 0, 0);
    translation = planes[1].position.subtract(pivotAt)
    planes[1].setPivotMatrix(BABYLON.Matrix.Translation(translation.x, translation.y, translation.z));
    planes[1].rotate(new BABYLON.Vector3(0, 1, 0), Math.PI/2)
    planes[1].visibility = 'hidden'
//###########################################################################
//###########################################################################
    planes[2] = BABYLON.MeshBuilder.CreateBox(
        "plane_3", 
        { 
            width: 1,
            height: 1, 
            depth: 1
        }, 
        scene)

    planeNSegments[2] = []
    for (var i=1; i<=4; i++){
        planeNSegments[2].push(
            BABYLON.MeshBuilder.CreateBox(
                `segment3_${i}`, 
                { 
                    width: widthOfSegment,
                    height: ZOfSegment, 
                    depth: heightOfSegment 
                }, 
                scene
            )
        )
        
        planeNSegments[2][planeNSegments[2].length-1].parent = planes[2]
    }

    pivotAt = new BABYLON.Vector3(-widthOfSegment/2, 0, 0);
    translation = planes[2].position.subtract(pivotAt)
    planes[2].setPivotMatrix(BABYLON.Matrix.Translation(translation.x, translation.y, translation.z));
    planes[2].visibility = 'hidden'
//###########################################################################
//###########################################################################
    planes[3] = BABYLON.MeshBuilder.CreateBox(
        "plane_4", 
        { 
            width: 1,
            height: 1, 
            depth: 1
        }, 
        scene)

    planeNSegments[3] = []
    for (var i=1; i<=4; i++){
        planeNSegments[3].push(
            BABYLON.MeshBuilder.CreateBox(
                `segment4_${i}`, 
                { 
                    width: widthOfSegment,
                    height: ZOfSegment, 
                    depth: heightOfSegment 
                }, 
                scene
            )
        )
        
        planeNSegments[3][planeNSegments[3].length-1].parent = planes[3]
    }

    pivotAt = new BABYLON.Vector3(-widthOfSegment/2, 0, 0);
    translation = planes[3].position.subtract(pivotAt)
    planes[3].setPivotMatrix(BABYLON.Matrix.Translation(translation.x, translation.y, translation.z));
    planes[3].rotate(new BABYLON.Vector3(0, 1, 0), Math.PI/2)
    planes[3].visibility = 'hidden'
//#########################################################################
//#########################################################################
    //planeNSegments[0][0].material = planeNSegments[1][0].material = planeNSegments[2][0].material = planeNSegments[3][0].material = metal
    planeNSegments.forEach((plane_elem)=>{
        plane_elem.forEach((segment)=>{
            segment.material = metal
        })
    })

    planeNSegments.forEach((elem)=>{
        elem[0].translate(new BABYLON.Vector3(1, 0, 0), -2*widthOfSegment)
        elem[1].translate(new BABYLON.Vector3(1, 0, 0), -1*widthOfSegment)
        elem[2].translate(new BABYLON.Vector3(1, 0, 0), 0)
        elem[3].translate(new BABYLON.Vector3(1, 0, 0), 1*widthOfSegment)            
    })
    
    planes[0].translate(new BABYLON.Vector3(0, 1, 0), RBetweenPlanes/2+ZOfSegment)
    planes[1].translate(new BABYLON.Vector3(0, 1, 0), RBetweenPlanes/2)
    planes[2].translate(new BABYLON.Vector3(0, 1, 0), -RBetweenPlanes/2)
    planes[3].translate(new BABYLON.Vector3(0, 1, 0), -RBetweenPlanes/2-ZOfSegment)

    planes[0].translate(new BABYLON.Vector3(1, 0, 0), widthOfSegment/2)
    planes[1].translate(new BABYLON.Vector3(0, 0, 1), widthOfSegment/2)
    planes[2].translate(new BABYLON.Vector3(1, 0, 0), widthOfSegment/2)
    planes[3].translate(new BABYLON.Vector3(0, 0, 1), widthOfSegment/2)
}
//#########################################################################
//##########################################################################
//####                                                                   ####
//####                                                                   ####
//####                                                                   ####
//##########################################################################
//#########################################################################
function createMaterials(){
    glass = new BABYLON.PBRMaterial("glass", scene)
    glass.reflectionTexture = hdrTexture
    glass.refractionTexture = hdrTexture
    glass.linkRefractionWithTransparency = true
    glass.indexOfRefraction = 0.7
    glass.alpha = 0
    glass.microSurface = 1
    glass.reflectivityColor = new BABYLON.Color3(0.2, 0.2, 0.2)
    glass.albedoColor = new BABYLON.Color3(0.85, 0.85, 0.85)

    metal = new BABYLON.PBRMaterial("metal", scene)
    metal.alpha = .3
    metal.reflectionTexture = hdrTexture
    metal.microSurface = .5
    metal.reflectivityColor = new BABYLON.Color3(0.85, 0.85, 0.85)
    metal.albedoColor = new BABYLON.Color3(0.01, 0.01, 0.01)

    plastic = new BABYLON.PBRMaterial("plastic", scene)
    plastic.alpha = .3
    plastic.reflectionTexture = hdrTexture
    plastic.microSurface = 0    
    plastic.albedoColor = new BABYLON.Color3(0, 0, 1)
    plastic.reflectivityColor = new BABYLON.Color3(0, 0, 1)

    rayMaterial = new BABYLON.PBRMaterial("rayMaterial", scene)
    rayMaterial.alpha = 1
    rayMaterial.reflectionTexture = hdrTexture
    rayMaterial.microSurface = 1    
    rayMaterial.albedoColor = new BABYLON.Color3(0, 1, 0)
    rayMaterial.reflectivityColor = new BABYLON.Color3(0, 1, 0)

    hitPointMaterial = new BABYLON.PBRMaterial("hitPointMaterial", scene)
    hitPointMaterial.reflectionTexture = hdrTexture
    hitPointMaterial.microSurface = .7   
    hitPointMaterial.albedoColor = new BABYLON.Color3(0, 0, 0)
    hitPointMaterial.reflectivityColor = new BABYLON.Color3(0, 1, 0)
}
//#########################################################################
//##########################################################################
//####                                                                   ####
//####                                                                   ####
//####                                                                   ####
//##########################################################################
//#########################################################################
function createStands(){
    var stand1 = BABYLON.MeshBuilder.CreateCylinder(
        "stand1", 
        {
            diameterTop: 1,
            diameterBottom: 1,
            height: 100
        }, 
        scene
    )
    
    stand1.material = glass  

    var stand2 = stand1.clone()
    
    stand1.translate(new BABYLON.Vector3(1, 0, 1), -2*widthOfSegment)
    stand2.translate(new BABYLON.Vector3(-1, 0, 1), 2*widthOfSegment)
}