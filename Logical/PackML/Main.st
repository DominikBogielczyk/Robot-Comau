
PROGRAM _INIT
	MpPackMLCore_0.MpLink := ADR(gPackMLCore);
	MpPackMLCore_0.Enable := TRUE;
	
	MpPackMLMode_Auto.MpLink := ADR(gPackMLCore);
	MpPackMLMode_Auto.Enable := TRUE;
	MpPackMLMode_Auto.ModeID := 1;
	
	MpPackMLMode_SemiAuto.MpLink := ADR(gPackMLCore);
	MpPackMLMode_SemiAuto.Enable := TRUE;
	MpPackMLMode_SemiAuto.ModeID := 2;
	
	MpPackMLMode_Manual.MpLink := ADR(gPackMLCore);
	MpPackMLMode_Manual.Enable := TRUE;
	MpPackMLMode_Manual.ModeID := 3;
	
	//ACTIVATE := 1 ?????
	 
END_PROGRAM

PROGRAM _CYCLIC
	MpPackMLCore_0();
	MpPackMLMode_Auto();
	MpPackMLMode_SemiAuto();
	MpPackMLMode_Manual();
	
	 
END_PROGRAM

PROGRAM _EXIT
	(* Insert code here *)
	 
END_PROGRAM

