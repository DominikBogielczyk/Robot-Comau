
PROGRAM _INIT
	RestorePos;
	MpRoboArm6Axis_0.Enable := TRUE;

	MpRoboArm6Axis_0.Override  := 100.0;
	RoboParameters.Position[2] := -90;
	A1;
	B1 := 90;
	C1;
	Z1 := 685;
	X1 := 435;
	Y1;
	PZ;

END_PROGRAM

PROGRAM _CYCLIC
	

	RoboParameters.Jog.Velocity[0] := VelocityQ1;
	RoboParameters.Jog.Velocity[1] := VelocityQ2;
	RoboParameters.Jog.Velocity[2] := VelocityQ3;
	RoboParameters.Jog.Velocity[3] := VelocityQ4;
	RoboParameters.Jog.Velocity[4] := VelocityQ5;
	RoboParameters.Jog.Velocity[5] := VelocityQ6;
	
	IF manual THEN
	    
		IF cartezianVSjog THEN 
			RoboParameters.Jog.CoordSystem := 10;
		ELSE			
			RoboParameters.Jog.CoordSystem := 0;
		END_IF
		
		MpRoboArm6Axis_0.MoveProgram := FALSE;	
	ELSIF NOT manual THEN
		RoboParameters.ProgramName := 'Robotic.st';    //File stored on FileDevice
		X1 := MpRoboArm6Axis_0.X;
		Y1 := MpRoboArm6Axis_0.Y;
		Z1 := MpRoboArm6Axis_0.Z;
		A1 := MpRoboArm6Axis_0.A;
		B1 := MpRoboArm6Axis_0.B;
		C1 := MpRoboArm6Axis_0.C;
		
	END_IF
		
	MpRoboArm6Axis_0.MpLink     := ADR(gAxesGroup_Racer3_1);
	MpRoboArm6Axis_0.Parameters := ADR(RoboParameters);
	MpRoboArm6Axis_0();
	
END_PROGRAM


PROGRAM _EXIT
	(* Insert code here *)
	 
END_PROGRAM

