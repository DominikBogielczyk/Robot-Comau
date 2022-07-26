
ACTION Unhold: 
	
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_UNHOLDING,
		1) THEN
			
		MpRoboArm6Axis_0.Continue := 1;
		MpPackMLMode_Auto.Unhold := 0;
		IF  MpRoboArm6Axis_0.InMotion THEN
			MpRoboArm6Axis_0.Continue:=0;
			Step:=ROBOTCTRL_MOVE;
			MpPackMLStateComplete(gPackMLCore, 1);
			MpPackMLMode_Auto.Hold := 0;
		END_IF
	END_IF
	
	

END_ACTION
