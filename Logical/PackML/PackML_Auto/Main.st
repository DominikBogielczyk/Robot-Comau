
PROGRAM _INIT
	RestorePos;
	MpRoboArm6Axis_0.Enable := TRUE;

	MpRoboArm6Axis_0.Override  := 100.0;
	RoboParameters.CoordSystem := 0; 
	RoboParameters.Velocity := 100; 
	RoboParameters.Acceleration := 1000; 
	RoboParameters.Deceleration := 1000; 
	RoboParameters.ProgramName := 'Robotic.st';  
	 
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
	
	MpRoboArm6Axis_0.MpLink     := ADR(gAxesGroup_Racer3_1);
	MpRoboArm6Axis_0.Parameters := ADR(RoboParameters);
	MpRoboArm6Axis_0.Override := 100.0;
	MpRoboArm6Axis_0.Enable := TRUE;
	MpRoboArm6Axis_0();

	
END_PROGRAM

PROGRAM _EXIT
	MpRoboArm6Axis_0.Enable :=FALSE;
	MpRoboArm6Axis_0();
	 
END_PROGRAM

