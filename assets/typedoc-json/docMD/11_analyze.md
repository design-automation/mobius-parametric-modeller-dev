# ANALYZE    

## Raytrace  
* **Description:** xxx
~  
* **Parameters:**  
  * *origins:* The origins of teh rays  
  * *directions:* The direction vectors  
  * *entities:* The obstructions, faces, polygons, or collections of faces or polygons.  
  * *limits:* undefined  
  * *method:* Enum; raytracing method  
* **Returns:** Distance, or list of distances (if position2 is a list).  
* **Examples:**  
  * distance1 = calc.Distance (position1, position2, p_to_p_distance)  
    position1 = [0,0,0], position2 = [[0,0,10],[0,0,20]], Expected value of distance is [10,20].
  
  
## Solar  
* **Description:** xxx
~
The detail parameter spacifies the number of target points that get generated along the sun paths.
The higher the level of detail, the more accurate but also the slower the analysis will be.
The number of points differs depending on the latitde. At latitude 0, the
- detail = 0 -> 45 points
- detail = 1 -> 66 points
- detail = 2 -> 91 points
- detail = 3 -> 136 points
- detail = 4 -> 225 points
- detail = 5 -> 490 points
- detail = 6  -> 1067 points
~  
* **Parameters:**  
  * *origins:* The origins of the rays  
  * *detail:* The level of detail for the analysis  
  * *entities:* The obstructions, faces, polygons, or collections of faces or polygons.  
  * *limits:* The max distance for raytracing  
  * *method:* Enum; solar method  
* **Returns:** Distance, or list of distances (if position2 is a list).  
* **Examples:**  
  * distance1 = calc.Distance (position1, position2, p_to_p_distance)  
    position1 = [0,0,0], position2 = [[0,0,10],[0,0,20]], Expected value of distance is [10,20].
  
  
## SunPath  
* **Description:** xxx
~  
* **Parameters:**  
  * *origin:* undefined  
  * *detail:* The level of detail for the analysis  
  * *radius:* The radius of the sun path  
  * *method:* Enum; solar method  
* **Returns:** Distance, or list of distances (if position2 is a list).  
* **Examples:**  
  * distance1 = calc.Distance (position1, position2, p_to_p_distance)  
    position1 = [0,0,0], position2 = [[0,0,10],[0,0,20]], Expected value of distance is [10,20].
  
  
