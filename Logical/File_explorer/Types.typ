
TYPE
	TabInfo : 	STRUCT 
		LastModified : ARRAY[0..49]OF DATE_AND_TIME;
		Type : ARRAY[0..49]OF MpFileManagerUIItemTypeEnum;
		Size : ARRAY[0..49]OF UDINT;
		Name : ARRAY[0..49]OF STRING[80];
		SelectedRow : USINT;
		NumberOfElements : USINT;
	END_STRUCT;
END_TYPE
