
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

	
	VelocityQ;
	doMagnet;
	
	RoboParameters.Jog.Velocity[0] := VelocityQ1;
	RoboParameters.Jog.Velocity[1] := VelocityQ2;
	RoboParameters.Jog.Velocity[2] := VelocityQ3;
	RoboParameters.Jog.Velocity[3] := VelocityQ4;
	RoboParameters.Jog.Velocity[4] := VelocityQ5;
	RoboParameters.Jog.Velocity[5] := VelocityQ6;
	    
	IF cartezianVSjog THEN 
		RoboParameters.Jog.CoordSystem := 10;
	ELSE			
		RoboParameters.Jog.CoordSystem := 0;
	END_IF
	
	IF diManual THEN 
		RoboParameters.ProgramName := 'HOME.st';
	ELSE			
		RoboParameters.ProgramName := 'Robotic.st';
	END_IF

	 
END_PROGRAM

PROGRAM _EXIT
	(* Insert code here *)
	 
END_PROGRAM

