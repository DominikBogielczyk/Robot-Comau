
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
	
	MpPackMLMode_Auto.Activate := 0;
	MpPackMLMode_SemiAuto.Activate := 0;
	MpPackMLMode_Manual.Activate := 0;
	
	 
END_PROGRAM

PROGRAM _CYCLIC
	MpPackMLCore_0();
	MpPackMLMode_Auto();
	MpPackMLMode_SemiAuto();
	MpPackMLMode_Manual();
	
	MpPackMLMode_Auto.Activate := 0;
	MpPackMLMode_SemiAuto.Activate := 0;
	MpPackMLMode_Manual.Activate := 0; 
	
	MpPackMLMode_Auto.Activate := diAuto AND (NOT diSemiAuto) AND (NOT diManual);
	MpPackMLMode_SemiAuto.Activate := diSemiAuto AND (NOT diAuto) AND (NOT diManual);
	MpPackMLMode_Manual.Activate := diManual AND (NOT diAuto) AND (NOT diSemiAuto);
END_PROGRAM

PROGRAM _EXIT
	MpPackMLCore_0.Enable := 0;
	MpPackMLMode_Auto.Enable := 0;
	MpPackMLMode_SemiAuto.Enable := 0;
	MpPackMLMode_Manual.Enable := 0;
	
	MpPackMLCore_0();
	MpPackMLMode_Auto();
	MpPackMLMode_SemiAuto();
	MpPackMLMode_Manual();
	
	
	
	
	 
END_PROGRAM

