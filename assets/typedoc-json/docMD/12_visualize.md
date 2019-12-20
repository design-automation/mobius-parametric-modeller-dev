# VISUALIZE    

## Color  
* **Description:** Sets color by creating a vertex attribute called 'rgb' and setting the value.
~  
* **Parameters:**  
  * *entities:* The entities for which to set the color.  
  * *color:* The color, [0,0,0] is black, [1,1,1] is white.  
* **Returns:** void  
  
## Gradient  
* **Description:** Sets color by creating a vertex attribute called 'rgb' and setting the value.
~  
* **Parameters:**  
  * *entities:* The entities for which to set the color.  
  * *attrib:* undefined  
  * *range:* undefined  
  * *method:* Enum  
* **Returns:** void  
  
## Ray  
* **Description:** Visualises a ray by creating a line.  
* **Parameters:**  
  * *rays:* A list of two list of three coordinates [origin, vector]: [[x,y,z],[x',y',z']]  
  * *scale:* undefined  
* **Returns:** entities, a line representing the ray.  
* **Examples:**  
  * ray1 = virtual.visRay([[1,2,3],[0,0,1]])
  
  
## Plane  
* **Description:** Visualises a plane by creating a polyline and axis lines.  
* **Parameters:**  
  * *planes:* undefined  
  * *scale:* undefined  
* **Returns:** Entities, a polygon and two polyline representing the plane.  
* **Examples:**  
  * plane1 = virtual.visPlane(position1, vector1, [0,1,0])  
    Creates a plane with position1 on it and normal = cross product of vector1 with y-axis.
  
  
## BBox  
* **Description:** Visualises a bounding box by adding geometry to the model.  
* **Parameters:**  
  * *bboxes:* A list of lists.  
* **Returns:** Entities, twelve polylines representing the box.  
* **Examples:**  
  * bbox1 = virtual.viBBox(position1, vector1, [0,1,0])  
    Creates a plane with position1 on it and normal = cross product of vector1 with y-axis.
  
  
