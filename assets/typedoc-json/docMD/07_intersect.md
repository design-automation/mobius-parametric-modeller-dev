# INTERSECT    

## RayFace  
* **Description:** Calculates the xyz intersection between a ray or a plane and a list of entities.
~
For a ray, the intersection between the ray and one or more faces is return.
The intersection between each face triangle and the ray is caclulated.
This ignores the intersections between rays and edges (including polyline edges).
~
For a plane, the intersection between the plane and one or more edges is returned.
This ignores the intersections between planes and face triangles (including polygon faces).
~  
* **Parameters:**  
  * *ray:* A ray.  
  * *entities:* List of entities.  
* **Returns:** A list of xyz intersection coordinates.  
* **Examples:**  
  * coords = virtual.Intersect(plane, polyline1)  
    Returns a list of coordinates where the plane intersects with polyline1.
  
  
## PlaneEdge  
* **Description:** Calculates the xyz intersection between a ray or a plane and a list of entities.
~
For a ray, the intersection between the ray and one or more faces is return.
The intersection between each face triangle and the ray is caclulated.
This ignores the intersections between rays and edges (including polyline edges).
~
For a plane, the intersection between the plane and one or more edges is returned.
This ignores the intersections between planes and face triangles (including polygon faces).
~  
* **Parameters:**  
  * *plane:* A plane.  
  * *entities:* List of entities.  
* **Returns:** A list of xyz intersection coordinates.  
* **Examples:**  
  * coords = virtual.Intersect(plane, polyline1)  
    Returns a list of coordinates where the plane intersects with polyline1.
  
  
