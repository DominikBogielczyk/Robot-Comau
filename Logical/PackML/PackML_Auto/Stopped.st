
ACTION Stopped:
	IF MpPackMLStateIsActive(gPackMLCore,
		mpPACKML_STATE_STOPPED,
		1) THEN
		
		MpRoboArm6Axis_0.Power := FALSE; 
		MpRoboArm6Axis_0.Stop := FALSE;
		MpPackMLMode_Auto.Abort := 0;
		
		IF diReset THEN
			Step := ROBOTCTRL_POWER;
			MpPackMLMode_Auto.Reset := TRUE;
			diReset := FALSE;
		END_IF
		
		
		
	END_IF

END_ACTION
