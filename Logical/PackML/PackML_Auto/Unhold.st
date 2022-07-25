
ACTION Unhold: 
	
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_UNHOLDING,
		1) THEN
			
		MpRoboArm6Axis_0.Continue:=1;
		IF  MpRoboArm6Axis_0.InMotion THEN
			MpRoboArm6Axis_0.Continue:=0;
			Step:=ROBOTCTRL_MOVE;
			MpPackMLStateComplete(gPackMLCore, 1);
		END_IF
	END_IF

END_ACTION
