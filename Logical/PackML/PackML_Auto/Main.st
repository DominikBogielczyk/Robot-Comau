
PROGRAM _INIT
	(* Insert code here *)
	 
END_PROGRAM

PROGRAM _CYCLIC
	Starting;
	Idle;
	Stopping;
	Resetting;
	Execute;
	Completing;
	Complete;
	Stopped;
	
	MpPackMLMode_Auto.Stop := diStop;
	
	MpPackMLCore_0;
	MpPackMLMode_Auto;
	
	diStop;
	diStart;
	
	diReset;
	diComplete;
	diCompleting;
	diExecute;
	diStopped;
	
	diAuto;
	diSemiAuto;
	diManual;

	
END_PROGRAM

PROGRAM _EXIT
	(* Insert code here *)
	 
END_PROGRAM

