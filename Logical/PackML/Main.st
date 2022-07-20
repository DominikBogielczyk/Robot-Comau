
PROGRAM _INIT
	(* Insert code here *)
	MpPackMLCore_0.MpLink := ADR(gPackMLCore);
	MpPackMLCore_0.Enable := TRUE;
	
	MpPackMLMode_0.MpLink := ADR(gPackMLCore);
	MpPackMLMode_0.Enable := TRUE;
	MpPackMLMode_0.ModeID := 1;
END_PROGRAM

PROGRAM _CYCLIC
	(* Insert code here *)
	MpPackMLCore_0();
	MpPackMLMode_0();
END_PROGRAM

PROGRAM _EXIT
	(* Insert code here *)
	 
END_PROGRAM

