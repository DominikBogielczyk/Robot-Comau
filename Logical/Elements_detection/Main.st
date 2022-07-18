
PROGRAM _INIT
	//CAMERA INITIAL VALUES
	Camera_0.Focus := 30000;
	Camera_0.ExposureTime := 40000;
	Camera_0.NumSearch := 14;
	Camera_0.Enable := 1;
	
	 
END_PROGRAM

PROGRAM _CYCLIC
	//IMAGE ACQUISITION
	Camera_0.ImageAcq := Camera_0.diTrigger AND Camera_0.Ready;
	
	FOR i := 0 TO 13 DO
		//SQUARES DETECTION 
		SquareArray[Camera_0.ModelNumArray[i]-1] := Camera_0.PixelCntSquareArray[i] < 10000;
		
		IF Camera_0.PixelCntSquareArray[i] < 50 THEN
			//NOTHING
			ElementsArray[Camera_0.ModelNumArray[i]-1] := 0;
		ELSIF Camera_0.PixelCntSquareArray[i] < 200 THEN
			//SCREW
			ElementsArray[Camera_0.ModelNumArray[i]-1] := 1;	
		ELSIF Camera_0.PixelCntSquareArray[i] < 500 THEN
			//WASHER BOLT
			ElementsArray[Camera_0.ModelNumArray[i]-1] := 2;	
		ELSIF Camera_0.PixelCntSquareArray[i] < 2000 THEN
			//WRENCH
			ElementsArray[Camera_0.ModelNumArray[i]-1] := 4;
		ELSE
			ElementsArray[Camera_0.ModelNumArray[i]-1] := 0;		
		END_IF;
		
		
	END_FOR;
	
	BtnSquare0 := SquareArray[0];
	BtnSquare1 := SquareArray[1];
	BtnSquare2 := SquareArray[2];
	BtnSquare3 := SquareArray[3];
	BtnSquare4 := SquareArray[4];
	BtnSquare5 := SquareArray[5];
	BtnSquare6 := SquareArray[6];
	BtnSquare7 := SquareArray[7];
	BtnSquare8 := SquareArray[8];
	BtnSquare9 := SquareArray[9];
	BtnSquare10 := SquareArray[10];
	BtnSquare11 := SquareArray[11];
	BtnSquare12 := SquareArray[12];
	BtnSquare13 := SquareArray[13];
	
	
	 
END_PROGRAM

PROGRAM _EXIT
	(* Insert code here *)
	 
END_PROGRAM

