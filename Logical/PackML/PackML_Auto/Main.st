
PROGRAM _INIT
	RestorePos;
	MpRoboArm6Axis_0.Enable := TRUE;
	
	MpRoboArm6Axis_0.Interrupt := 0;
	MpRoboArm6Axis_0.Continue := 0;

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
	Holding;
	Held;
	Unhold;
	
	P2up;
	P2 ;
	P1up ;
	P1 ;
	P0;
	HOME;
	PZ;
	A;
	
	//throwing error 
	IF MpRoboArm6Axis_0.Error THEN
		Step := ROBOTCTRL_ERROR;
		MpPackMLMode_Auto.Abort := TRUE;
	END_IF;
	
	
	IF diStop THEN
		MpRoboArm6Axis_0.Power := 0;
		MpPackMLMode_Auto.Stop := 1;
		diStop := 1;
		END_IF
	
	MpPackMLCore_0;
	MpPackMLMode_Auto;
	
	diStop;
	diStart;
	diReset;
	diExecute;
	cmdContinue;
	
	
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
	 
END_PROGRAM

