
PROGRAM _INIT
	(* Insert code here *)
	MpRecipeXml_0.MpLink := ADR(gRecipeXml);
	MpRecipeXml_0.Enable := TRUE;
	
	MpRecipeRegPar_0.MpLink := ADR(gRecipeXml);
	MpRecipeRegPar_0.Enable := TRUE;
	gAimPos;
	ScrewPosible := TRUE;
	ScrewWasherPosible := TRUE;
	WrenchPosible := TRUE;
	name;
END_PROGRAM

PROGRAM _CYCLIC
	(* Insert code here *)
	
	
	IF clear THEN 
	
		FOR i := 0 TO 13 BY 1 DO
		gAimPos[i] :=0 ;	
		END_FOR;
		
		ScrewPosible := TRUE;
		ScrewWasherPosible := TRUE;
		WrenchPosible := TRUE;
	END_IF
	
	
	
	FOR i := 0 TO 13 BY 1 DO
			
		IF gAimPos[i]  = 1 THEN 
			ScrewPosible := FALSE;
		END_IF
		IF gAimPos[i]  = 2 THEN 
			ScrewWasherPosible := FALSE;
		END_IF
		IF gAimPos[i]  = 4 THEN 
			WrenchPosible := FALSE;
		END_IF
		
	END_FOR;
		
		
	MpRecipeXml_0();
	MpRecipeXml_0.DeviceName := ADR('RecipeDir');

	
	MpRecipeRegPar_0();
	MpRecipeRegPar_0.PVName := ADR('gAimPos');
	
	
	MpRecipeXml_0.FileName := ADR(name);
	
END_PROGRAM

PROGRAM _EXIT
	(* Insert code here *)
	 
END_PROGRAM

