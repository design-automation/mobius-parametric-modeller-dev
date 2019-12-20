# MATERIAL    

## Set  
* **Description:** Sets material by creating a polygon attribute called 'material' and setting the value.
The value is a sitring, which is the name of the material.
The properties of this material must be defined at the model level, using one of the material functions.
~  
* **Parameters:**  
  * *entities:* The entities for which to set the material.  
  * *material:* undefined  
* **Returns:** void  
  
## Glass  
* **Description:** Creates a glass material with an opacity setting. The material will default to a Phong material.
~
In order to assign a material to polygons in the model, a polygon attribute called 'material'
needs to be created. The value for each polygon must either be null, or must be a material name.
~  
* **Parameters:**  
  * *name:* The name of the material.  
  * *opacity:* The opacity of the glass, between 0 (totally transparent) and 1 (totally opaque).  
* **Returns:** void  
  
## Basic  
* **Description:** Creates a Basic material and saves it in the model attributes.
~
[See the threejs docs](https://threejs.org/docs/#api/en/materials/MeshBasicMaterial)
~
The color pf the material can either ignore or apply the vertex rgb colors.
If 'apply' id selected, then the actual color will be a combination of the material color
and the vertex colors, as specified by the a vertex attribute called 'rgb'.
In such a case, if material color is set to white, then it will
have no effect, and the color will be defined by the vertex [r,g,b] values.
~
Additional material properties can be set by calling the functions for the more advanced materials.
These include LambertMaterial, PhongMaterial, StandardMaterial, and Physical Material.
Each of these more advanced materials allows you to specify certain additional settings.
~
In order to assign a material to polygons in the model, a polygon attribute called 'material'.
needs to be created. The value for each polygon must either be null, or must be a material name.
~  
* **Parameters:**  
  * *name:* The name of the material.  
  * *color:* The diffuse color, as [r, g, b] values between 0 and 1. White is [1, 1, 1].  
  * *opacity:* The opacity of the glass, between 0 (totally transparent) and 1 (totally opaque).  
  * *select_side:* Enum, select front, back, or both.  
  * *select_vert_colors:* Enum, select whether to use vertex colors if they exist.  
* **Returns:** void  
  
## Lambert  
* **Description:** Creates a Lambert material and saves it in the model attributes.
If a Basic material with the same name already exits, these settings will be added to the basic material.
~
[See the threejs docs](https://threejs.org/docs/#api/en/materials/MeshLambertMaterial)
~
In order to assign a material to polygons in the model, a polygon attribute called 'material'
needs to be created. The value for each polygon must either be null, or must be a material name.
~  
* **Parameters:**  
  * *name:* The name of the material.  
  * *emissive:* The emissive color, as [r, g, b] values between 0 and 1. White is [1, 1, 1].  
* **Returns:** void  
  
## Phong  
* **Description:** Creates a Phong material and saves it in the model attributes.
If a Basic material with the same name already exits, these settings will be added to the basic material.
~
[See the threejs docs](https://threejs.org/docs/#api/en/materials/MeshPhongMaterial)
~
In order to assign a material to polygons in the model, a polygon attribute called 'material'
needs to be created. The value for each polygon must either be null, or must be a material name.
~  
* **Parameters:**  
  * *name:* The name of the material.  
  * *emissive:* The emissive color, as [r, g, b] values between 0 and 1. White is [1, 1, 1].  
  * *specular:* The specular color, as [r, g, b] values between 0 and 1. White is [1, 1, 1].  
  * *shininess:* The shininess, between 0 and 100.  
* **Returns:** void  
  
## Standard  
* **Description:** Creates a Standard material and saves it in the model attributes.
If a Basic material with the same name already exits, these settings will be added to the basic material.
~
[See the threejs docs](https://threejs.org/docs/#api/en/materials/MeshStandardMaterial)
~
In order to assign a material to polygons in the model, a polygon attribute called 'material'
needs to be created. The value for each polygon must either be null, or must be a material name.
~  
* **Parameters:**  
  * *name:* The name of the material.  
  * *emissive:* The emissive color, as [r, g, b] values between 0 and 1. White is [1, 1, 1].  
  * *roughness:* The roughness, between 0 (smooth) and 1 (rough).  
  * *metalness:* The metalness, between 0 (non-metalic) and 1 (metalic).  
* **Returns:** void  
  
## Physical  
* **Description:** Creates a Physical material and saves it in the model attributes.
If a Basic material with the same name already exits, these settings will be added to the basic material.
~
[See the threejs docs](https://threejs.org/docs/#api/en/materials/MeshPhysicalMaterial)
~
In order to assign a material to polygons in the model, a polygon attribute called 'material'
needs to be created. The value for each polygon must either be null, or must be a material name.
~  
* **Parameters:**  
  * *name:* The name of the material.  
  * *emissive:* The emissive color, as [r, g, b] values between 0 and 1. White is [1, 1, 1].  
  * *roughness:* The roughness, between 0 (smooth) and 1 (rough).  
  * *metalness:* The metalness, between 0 (non-metalic) and 1 (metalic).  
  * *reflectivity:* The reflectivity, between 0 (non-reflective) and 1 (reflective).  
* **Returns:** void  
  
