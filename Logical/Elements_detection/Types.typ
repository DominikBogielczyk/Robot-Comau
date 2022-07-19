
TYPE
	PixelCounterLimits : 	STRUCT 
		WrenchLimit : UDINT;
		WasherBoltLimit : UDINT;
		ScrewLimit : UDINT;
	END_STRUCT;
	CameraStruct : 	STRUCT 
		ExposureTime : UDINT := 30000;
		Focus : UINT := 30000;
		NumSearch : USINT;
		Enable : BOOL;
		diTrigger : BOOL;
		ImageAcq : BOOL;
		PixelCntSquareArray : ARRAY[0..13]OF UDINT;
		Ready : BOOL;
		FlashColor : USINT;
		ModelNumArray : ARRAY[0..13]OF USINT;
		FlashSegment : USINT;
	END_STRUCT;
END_TYPE
