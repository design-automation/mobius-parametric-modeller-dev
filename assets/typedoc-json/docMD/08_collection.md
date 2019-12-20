# COLLECTION    

## Create  
* **Description:** Adds one or more new collections to the model.
~
If the list of entities contains other collections, these other collections will then become
children of the new collection that will be created.
~  
* **Parameters:**  
  * *entities:* List or nested lists of points, polylines, polygons, and other colletions.  
  * *name:* The name to give to this collection, resulting in an attribute called `name`. If `null`, no attribute will be created.  
* **Returns:** Entities, new collection, or a list of new collections.  
* **Examples:**  
  * collection1 = collection.Create([point1,polyine1,polygon1], 'my_coll')  
    Creates a collection containing point1, polyline1, polygon1, with an attribute `name = 'my_coll'`.  
  * collections = collection.Create([[point1,polyine1],[polygon1]], ['coll1', 'coll2'])  
    Creates two collections, the first containing point1 and polyline1, the second containing polygon1.
  
  
## Get  
* **Description:** Get a collection from the model, given the `name` attribute.
~  
* **Parameters:**  
  * *names:* The name of the collection to get.  
* **Returns:** The collection, or a list of collections.  
  
## Add  
* **Description:** Addes entities to a collection.
~  
* **Parameters:**  
  * *coll:* The collection to be updated.  
  * *entities:* Points, polylines, polygons, and collections to add.  
* **Returns:** void  
  
## Remove  
* **Description:** Removes entities from a collection.
~  
* **Parameters:**  
  * *coll:* The collection to be updated.  
  * *entities:* Points, polylines, polygons, and collections to add.  
* **Returns:** void  
  
