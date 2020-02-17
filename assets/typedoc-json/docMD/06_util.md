# UTIL    

## ExportIO  
* **Description:** Export data from the model as a file.
This will result in a popup in your browser, asking you to save the filel.  
* **Parameters:**  
  * *__console__:* undefined  
  * *__fileName__:* undefined  
  * *file_name:* Name of the file as a string.  
  * *exportParams:* Enum.  
  * *exportContent:* Enum.  
* **Returns:** Boolean.  
* **Examples:**  
  * util.ExportIO('my_model.json')  
    Exports all the data in the model as an OBJ.
  
  
## convertString  
* **Description:** undefined  
* **Parameters:**  
  * *value:* undefined  
  
## ParamInfo  
* **Description:** Returns a text summary of the contents of this model  
* **Parameters:**  
* **Returns:** Text that summarises what is in the model.  
  
## ModelInfo  
* **Description:** Returns a text summary of the contents of this model  
* **Parameters:**  
* **Returns:** Text that summarises what is in the model, click print to see this text.  
  
## ModelCompare  
* **Description:** Compare the GI data in this model to the GI data in another model.
~
If method = subset, then this model is the answer, and the other model is the submitted model.
It will check that all entites in this model also exist in the other model.
~
If method = superset, then this model is the submitted model, and the other model is the answer model.
It will check that all entites in the other model also exist in this model.
~
For specifying the location of the GI Model, you can either specify a URL,
or the name of a file in LocalStorage.
In the latter case, you do not specify a path, you just specify the file name, e.g. 'my_model.gi'  
* **Parameters:**  
  * *gi_model:* The location of the GI Model to compare this model to.  
  * *method:* Enum, method used to compare this model to the other model specified in the gi_model parameter.  
* **Returns:** Text that summarises the comparison between the two models.  
  
## ModelCheck  
* **Description:** Check the internal consistency of the model.  
* **Parameters:**  
* **Returns:** Text that summarises what is in the model, click print to see this text.  
  
