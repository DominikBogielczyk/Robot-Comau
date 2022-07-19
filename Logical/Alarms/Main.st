
PROGRAM _INIT
	MpAlarmXCore_0.MpLink := ADR(gAlarmXCore_0);
	MpAlarmXCore_0.Enable := 1;
	 
END_PROGRAM

PROGRAM _CYCLIC
	MpAlarmXCore_0();
	 
END_PROGRAM

PROGRAM _EXIT
	MpAlarmXCore_0.Enable := 0;
	 
END_PROGRAM

