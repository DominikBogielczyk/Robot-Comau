
PROGRAM _INIT
	(* Insert code here *)
	Focus := 30000;
	ExposureTime := 30000;
	NumSearch := 14;
	Enable := 1;
	
	
	 
END_PROGRAM

PROGRAM _CYCLIC
	(* Insert code here *)

	ImageAcq := diTrigger AND CameraReady;
	
	FOR i := 0 TO 13 DO
		IF PixelCntArray[i] < 10000 THEN
			SquareArray[i] := 0;
		ELSE
			SquareArray[i] := 1;
		END_IF;
		

	END_FOR;
	
	PixelCntArray;
	ResetAcq;
	FlashColor;
	FlashSegment;
	
	
	 
END_PROGRAM

PROGRAM _EXIT
	(* Insert code here *)
	 
END_PROGRAM

