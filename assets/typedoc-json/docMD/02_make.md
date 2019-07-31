# MAKE    

## Position  
* **Description:** Adds one or more new position to the model.  
* **Parameters:**  
  * *coords:* A list of three numbers, or a list of lists of three numbers.  
* **Returns:** A new position, or nested list of new positions.  
* **Examples:**  
  * position1 = make.Position([1,2,3])  
    Creates a position with coordinates x=1, y=2, z=3.  
  * positions = make.Position([[1,2,3],[3,4,5],[5,6,7]])  
    Creates three positions, with coordinates [1,2,3],[3,4,5] and [5,6,7].  
* **Example URLs:**  
  1. [make.Position.mob](https://mobius.design-automation.net/flowchart?file=https://raw.githubusercontent.com/design-automation/mobius-parametric-modeller/master/src/assets/gallery/function_examples/make.Position.mob&node=1
)  
  
## Point  
* **Description:** Adds one or more new points to the model.  
* **Parameters:**  
  * *entities:* Position, or list of positions, or entities from which positions can be extracted.  
* **Returns:** Entities, new point or a list of new points.  
* **Examples:**  
  * point1 = make.Point(position1)  
    Creates a point at position1.  
* **Example URLs:**  
  1. [make.Point.mob](https://mobius.design-automation.net/flowchart?file=https://raw.githubusercontent.com/design-automation/mobius-parametric-modeller/master/src/assets/gallery/function_examples/make.Point.mob&node=1
)  
  
## Polyline  
* **Description:** Adds one or more new polylines to the model.  
* **Parameters:**  
  * *entities:* List or nested lists of positions, or entities from which positions can be extracted.  
  * *close:* Enum, 'open' or 'close'.  
* **Returns:** Entities, new polyline, or a list of new polylines.  
* **Examples:**  
  * polyline1 = make.Polyline([position1,position2,position3], close)  
    Creates a closed polyline with vertices position1, position2, position3 in sequence.  
* **Example URLs:**  
  1. [make.Polyline.mob](https://mobius.design-automation.net/flowchart?file=https://raw.githubusercontent.com/design-automation/mobius-parametric-modeller/master/src/assets/gallery/function_examples/make.Polyline.mob&node=1
)  
  
## Polygon  
* **Description:** Adds one or more new polygons to the model.  
* **Parameters:**  
  * *entities:* List or nested lists of positions, or entities from which positions can be extracted.  
* **Returns:** Entities, new polygon, or a list of new polygons.  
* **Examples:**  
  * polygon1 = make.Polygon([pos1,pos2,pos3])  
    Creates a polygon with vertices pos1, pos2, pos3 in sequence.  
  * polygons = make.Polygon([[pos1,pos2,pos3], [pos3,pos4,pos5]])  
    Creates two polygons, the first with vertices at [pos1,pos2,pos3], and the second with vertices at [pos3,pos4,pos5].  
* **Example URLs:**  
  1. [make.Polygon.mob](https://mobius.design-automation.net/flowchart?file=https://raw.githubusercontent.com/design-automation/mobius-parametric-modeller/master/src/assets/gallery/function_examples/make.Polygon.mob&node=1
)  
  
## Collection  
* **Description:** Adds one or more new collections to the model.  
* **Parameters:**  
  * *parent_coll:* Collection, the parent collection or null.  
  * *entities:* List or nested lists of points, polylines, polygons.  
* **Returns:** Entities, new collection, or a list of new collections.  
* **Examples:**  
  * collection1 = make.Collection([point1,polyine1,polygon1])  
    Creates a collection containing point1, polyline1, polygon1.  
  * collections = make.Collection([[point1,polyine1],[polygon1]])  
    Creates two collections, the first containing point1 and polyline1, the second containing polygon1.  
* **Example URLs:**  
  1. [make.Collection.mob](https://mobius.design-automation.net/flowchart?file=https://raw.githubusercontent.com/design-automation/mobius-parametric-modeller/master/src/assets/gallery/function_examples/make.Collection.mob&node=1
)  
  
## Copy  
* **Description:** Adds a new copy of specified entities to the model.  
* **Parameters:**  
  * *entities:* Entity or lists of entities to be copied. Entities can be positions, points, polylines, polygons and collections.  
  * *copy_attributes:* Enum to copy attributes or to have no attributes copied.  
* **Returns:** Entities, the copied entity or a list of copied entities.  
* **Examples:**  
  * copies = make.Copy([position1,polyine1,polygon1], copy_attributes)  
    Creates a copy of position1, polyine1, and polygon1.
  
  
## Hole  
* **Description:** Makes one or more holes in a polygon.
~
The positions must be on the polygon, i.e. they must be co-planar with the polygon and
they must be within the boundary of the polygon.
~
If the list of positions consists of a single list, then one hole will be generated.
If the list of positions consists of a list of lists, then multiple holes will be generated.
~  
* **Parameters:**  
  * *face:* A face or polygon to make holes in.  
  * *entities:* List of positions, or nested lists of positions, or entities from which positions can be extracted.  
* **Returns:** Entities, a list of wires resulting from the hole(s).  
  
## Loft  
* **Description:** Lofts between entities.
~
The geometry that is generated depends on the method that is selected.
- The 'quads' methods will generate polygons.
- The 'stringers' and 'ribs' methods will generate polylines.
- The 'copies' method will generate copies of the input geometry type.  
* **Parameters:**  
  * *entities:* List of entities, or list of lists of entities.  
  * *divisions:* undefined  
  * *method:* Enum, if 'closed', then close the loft back to the first entity in the list.  
* **Returns:** Entities, a list of new polygons or polylines resulting from the loft.  
* **Examples:**  
  * quads = make.Loft([polyline1,polyline2,polyline3], 1, 'open_quads')  
    Creates quad polygons lofting between polyline1, polyline2, polyline3.  
  * quads = make.Loft([polyline1,polyline2,polyline3], 1, 'closed_quads')  
    Creates quad polygons lofting between polyline1, polyline2, polyline3, and back to polyline1.  
  * quads = make.Loft([ [polyline1,polyline2], [polyline3,polyline4] ] , 1, 'open_quads')  
    Creates quad polygons lofting first between polyline1 and polyline2, and then between polyline3 and polyline4.
  
  
## Extrude  
* **Description:** Extrudes geometry by distance or by vector.
- Extrusion of a position, vertex, or point produces polylines;
- Extrusion of an edge, wire, or polyline produces polygons;
- Extrusion of a face or polygon produces polygons, capped at the top.
~
The geometry that is generated depends on the method that is selected.
- The 'quads' methods will generate polygons.
- The 'stringers' and 'ribs' methods will generate polylines.
- The 'copies' method will generate copies of the input geometry type.
~  
* **Parameters:**  
  * *entities:* Vertex, edge, wire, face, position, point, polyline, polygon, collection.  
  * *distance:* Number or vector. If number, assumed to be [0,0,value] (i.e. extrusion distance in z-direction).  
  * *divisions:* Number of divisions to divide extrusion by. Minimum is 1.  
  * *method:* Enum, when extruding edges, select quads, stringers, or ribs  
* **Returns:** Entities, a list of new polygons or polylines resulting from the extrude.  
* **Examples:**  
  * extrusion1 = make.Extrude(point1, 10, 2, 'quads')  
    Creates a polyline of total length 10 (with two edges of length 5 each) in the z-direction.
In this case, the 'quads' setting is ignored.  
  * extrusion2 = make.Extrude(polygon1, [0,5,0], 1, 'quads')  
    Extrudes polygon1 by 5 in the y-direction, creating a list of quad surfaces.
  
  
## Divide  
* **Description:** Divides edges into a set of shorter edges.
~
If the 'by_number' method is selected, then each edge is divided into a fixed number of equal length shorter edges.
If the 'by length' method is selected, then each edge is divided into shorter edges of the specified length.
The length of the last segment will be the remainder.
If the 'by_min_length' method is selected,
then the edge is divided into the maximum number of shorter edges
that have a new length that is equal to or greater than the minimum.
~  
* **Parameters:**  
  * *entities:* Edges, or entities from which edges can be extracted.  
  * *divisor:* Segment length or number of segments.  
  * *method:* Enum, select the method for dividing edges.  
* **Returns:** Entities, a list of new edges resulting from the divide.  
* **Examples:**  
  * segments1 = make.Divide(edge1, 5, by_number)  
    Creates a list of 5 equal segments from edge1.  
  * segments2 = make.Divide(edge1, 5, by_length)  
    If edge1 has length 13, creates from edge a list of two segments of length 5 and one segment of length 3.
  
  
## Unweld  
* **Description:** Unweld vertices so that they do not share positions. The new positions that are generated are returned.
~  
* **Parameters:**  
  * *entities:* Entities, a list of vertices, or entities from which vertices can be extracted.  
* **Returns:** Entities, a list of new positions resulting from the unweld.  
* **Examples:**  
  * mod.Unweld(polyline1)  
    Unwelds the vertices of polyline1 from all other vertices that shares the same position.
  
  
